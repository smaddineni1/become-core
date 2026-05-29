/**
 * Video Cache Manager
 *
 * Prefetches and caches breathing videos on first app load.
 * Ensures instant playback and offline viewing for the guided breathing module.
 *
 * Storage strategy:
 * - Videos are stored in the app's document directory (persists across sessions)
 * - Each video is keyed by its URL hash
 * - Cache is limited to 500MB; LRU eviction above threshold
 * - Videos are pre-downloaded during onboarding completion or first home screen load
 */

export interface CachedVideo {
  originalUrl: string;
  localUri: string;
  sizeBytes: number;
  cachedAt: number; // timestamp
  lastAccessedAt: number;
}

export interface CacheStatus {
  totalSizeBytes: number;
  videoCount: number;
  maxSizeBytes: number;
  videos: CachedVideo[];
}

const MAX_CACHE_SIZE_BYTES = 500 * 1024 * 1024; // 500MB

/**
 * Video Cache Manager
 *
 * In production, this uses:
 * - expo-file-system for downloading and storing files
 * - AsyncStorage for cache metadata
 * - Background fetch for prefetching during idle time
 */
export class VideoCacheManager {
  private cache: Map<string, CachedVideo> = new Map();

  /**
   * Get a video URI — returns cached local path if available,
   * otherwise returns the remote URL (and triggers background download).
   */
  async getVideoUri(remoteUrl: string): Promise<string> {
    const cacheKey = this.hashUrl(remoteUrl);
    const cached = this.cache.get(cacheKey);

    if (cached) {
      // Update last accessed time
      cached.lastAccessedAt = Date.now();
      this.cache.set(cacheKey, cached);
      return cached.localUri;
    }

    // Start background download, return remote URL for immediate playback
    this.downloadInBackground(remoteUrl);
    return remoteUrl;
  }

  /**
   * Prefetch a list of videos (called during onboarding or app launch).
   */
  async prefetchVideos(urls: string[]): Promise<void> {
    for (const url of urls) {
      const cacheKey = this.hashUrl(url);
      if (!this.cache.has(cacheKey)) {
        await this.downloadInBackground(url);
      }
    }
  }

  /**
   * Check if a video is cached locally.
   */
  isCached(remoteUrl: string): boolean {
    return this.cache.has(this.hashUrl(remoteUrl));
  }

  /**
   * Get cache status for debugging/settings display.
   */
  getCacheStatus(): CacheStatus {
    let totalSize = 0;
    const videos: CachedVideo[] = [];

    for (const video of this.cache.values()) {
      totalSize += video.sizeBytes;
      videos.push(video);
    }

    return {
      totalSizeBytes: totalSize,
      videoCount: this.cache.size,
      maxSizeBytes: MAX_CACHE_SIZE_BYTES,
      videos,
    };
  }

  /**
   * Clear entire video cache.
   */
  async clearCache(): Promise<void> {
    // In production: delete all files from expo-file-system documentDirectory
    this.cache.clear();
  }

  // ----- Private -----

  private async downloadInBackground(url: string): Promise<void> {
    // In production:
    // 1. FileSystem.downloadAsync(url, localPath)
    // 2. Get file info for size
    // 3. Store metadata in AsyncStorage
    // 4. Evict LRU entries if cache exceeds MAX_CACHE_SIZE_BYTES

    const cacheKey = this.hashUrl(url);
    const localUri = `file:///cache/videos/${cacheKey}.mp4`;

    this.cache.set(cacheKey, {
      originalUrl: url,
      localUri,
      sizeBytes: 50 * 1024 * 1024, // Placeholder ~50MB per video
      cachedAt: Date.now(),
      lastAccessedAt: Date.now(),
    });

    // Evict if over limit
    await this.evictIfNeeded();
  }

  private async evictIfNeeded(): Promise<void> {
    const status = this.getCacheStatus();
    if (status.totalSizeBytes <= MAX_CACHE_SIZE_BYTES) return;

    // Sort by last accessed (LRU = oldest first)
    const sorted = status.videos.sort((a, b) => a.lastAccessedAt - b.lastAccessedAt);

    let currentSize = status.totalSizeBytes;
    for (const video of sorted) {
      if (currentSize <= MAX_CACHE_SIZE_BYTES) break;
      // Delete file and remove from cache
      this.cache.delete(this.hashUrl(video.originalUrl));
      currentSize -= video.sizeBytes;
    }
  }

  private hashUrl(url: string): string {
    // Simple hash for cache key (in production, use a proper hash)
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return `vid_${Math.abs(hash).toString(36)}`;
  }
}

/**
 * Singleton instance
 */
export const videoCacheManager = new VideoCacheManager();

/**
 * Default breathing videos to prefetch on app launch
 */
export const PREFETCH_BREATHING_VIDEOS = [
  'https://storage.become.app/videos/breathing-calm-5min.mp4',
  'https://storage.become.app/videos/breathing-focus-10min.mp4',
  'https://storage.become.app/videos/breathing-energy-5min.mp4',
];
