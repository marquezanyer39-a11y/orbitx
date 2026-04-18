import { create } from 'zustand';

export type UiToastTone = 'success' | 'error' | 'info';

interface UiToast {
  id: string;
  message: string;
  tone: UiToastTone;
}

interface UiState {
  globalLoading: boolean;
  toast: UiToast | null;
  errorMessage: string | null;
  setGlobalLoading: (value: boolean) => void;
  showToast: (message: string, tone?: UiToastTone) => void;
  hideToast: () => void;
  setErrorMessage: (message: string | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  globalLoading: false,
  toast: null,
  errorMessage: null,
  setGlobalLoading: (value) => set({ globalLoading: value }),
  showToast: (message, tone = 'info') =>
    set({
      toast: {
        id: `${Date.now()}`,
        message,
        tone,
      },
    }),
  hideToast: () => set({ toast: null }),
  setErrorMessage: (message) => set({ errorMessage: message }),
}));
