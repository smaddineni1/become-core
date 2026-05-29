/**
 * Genie Store — Zustand global state for the Genie AI Coach overlay
 *
 * Manages the open/close state of the Genie bottom sheet,
 * accessible from any screen in the app via the FAB.
 */

export interface GenieStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * Store definition — initialized with zustand create():
 *
 * export const useGenieStore = create<GenieStore>((set) => ({
 *   isOpen: false,
 *   open: () => set({ isOpen: true }),
 *   close: () => set({ isOpen: false }),
 *   toggle: () => set((state) => ({ isOpen: !state.isOpen })),
 * }));
 */

// Placeholder for type-checking until zustand is installed
export const GENIE_STORE_INITIAL_STATE: Omit<GenieStore, 'open' | 'close' | 'toggle'> = {
  isOpen: false,
};
