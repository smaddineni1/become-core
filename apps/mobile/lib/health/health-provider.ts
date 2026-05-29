/**
 * Health Provider — Unified interface for Apple HealthKit & Google Health Connect
 *
 * Abstracts platform health APIs behind a single interface.
 * Pulls: HRV (RMSSD), Resting Heart Rate, Sleep Duration & Quality
 */

import { Platform } from 'react-native';

export type HealthDataSource = 'healthkit' | 'health_connect' | 'manual';

export interface HRVSample {
  rmssdMs: number;
  timestamp: string;
  source: HealthDataSource;
}

export interface RestingHeartRateSample {
  bpm: number;
  timestamp: string;
  source: HealthDataSource;
}

export interface SleepSample {
  durationMinutes: number;
  deepSleepMinutes: number | null;
  remSleepMinutes: number | null;
  lightSleepMinutes: number | null;
  awakeMinutes: number | null;
  startTime: string;
  endTime: string;
  source: HealthDataSource;
}

export interface DailyHealthSnapshot {
  date: string;
  hrv: HRVSample | null;
  restingHeartRate: RestingHeartRateSample | null;
  sleep: SleepSample | null;
}

export interface HealthPermissionStatus {
  hrv: 'granted' | 'denied' | 'not_determined';
  heartRate: 'granted' | 'denied' | 'not_determined';
  sleep: 'granted' | 'denied' | 'not_determined';
}

export interface HealthProvider {
  readonly platform: 'ios' | 'android';
  readonly isAvailable: boolean;
  requestPermissions(): Promise<HealthPermissionStatus>;
  checkPermissions(): Promise<HealthPermissionStatus>;
  getLatestHRV(): Promise<HRVSample | null>;
  getHRVHistory(startDate: string, endDate: string): Promise<HRVSample[]>;
  getLatestRestingHeartRate(): Promise<RestingHeartRateSample | null>;
  getLatestSleep(): Promise<SleepSample | null>;
  getDailySnapshot(date: string): Promise<DailyHealthSnapshot>;
}

export function getHealthProvider(): HealthProvider {
  if (Platform.OS === 'ios') return new AppleHealthKitProvider();
  return new GoogleHealthConnectProvider();
}

class AppleHealthKitProvider implements HealthProvider {
  readonly platform = 'ios' as const;
  readonly isAvailable = Platform.OS === 'ios';

  async requestPermissions(): Promise<HealthPermissionStatus> {
    // expo-health / react-native-health integration point
    return { hrv: 'granted', heartRate: 'granted', sleep: 'granted' };
  }
  async checkPermissions(): Promise<HealthPermissionStatus> {
    return { hrv: 'not_determined', heartRate: 'not_determined', sleep: 'not_determined' };
  }
  async getLatestHRV(): Promise<HRVSample | null> { return null; }
  async getHRVHistory(): Promise<HRVSample[]> { return []; }
  async getLatestRestingHeartRate(): Promise<RestingHeartRateSample | null> { return null; }
  async getLatestSleep(): Promise<SleepSample | null> { return null; }
  async getDailySnapshot(date: string): Promise<DailyHealthSnapshot> {
    const [hrv, restingHeartRate, sleep] = await Promise.all([
      this.getLatestHRV(), this.getLatestRestingHeartRate(), this.getLatestSleep(),
    ]);
    return { date, hrv, restingHeartRate, sleep };
  }
}

class GoogleHealthConnectProvider implements HealthProvider {
  readonly platform = 'android' as const;
  readonly isAvailable = Platform.OS === 'android';

  async requestPermissions(): Promise<HealthPermissionStatus> {
    // react-native-health-connect integration point
    return { hrv: 'granted', heartRate: 'granted', sleep: 'granted' };
  }
  async checkPermissions(): Promise<HealthPermissionStatus> {
    return { hrv: 'not_determined', heartRate: 'not_determined', sleep: 'not_determined' };
  }
  async getLatestHRV(): Promise<HRVSample | null> { return null; }
  async getHRVHistory(): Promise<HRVSample[]> { return []; }
  async getLatestRestingHeartRate(): Promise<RestingHeartRateSample | null> { return null; }
  async getLatestSleep(): Promise<SleepSample | null> { return null; }
  async getDailySnapshot(date: string): Promise<DailyHealthSnapshot> {
    const [hrv, restingHeartRate, sleep] = await Promise.all([
      this.getLatestHRV(), this.getLatestRestingHeartRate(), this.getLatestSleep(),
    ]);
    return { date, hrv, restingHeartRate, sleep };
  }
}
