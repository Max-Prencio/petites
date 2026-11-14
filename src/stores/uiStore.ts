import { create } from 'zustand';

export type ToastTone = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface UiState {
  toast: Toast | null;
  showToast: (message: string, tone?: ToastTone) => void;
  hideToast: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  toast: null,
  showToast: (message, tone = 'info') => set({ toast: { id: Date.now(), message, tone } }),
  hideToast: () => set({ toast: null }),
}));

export const toast = {
  success: (message: string) => useUiStore.getState().showToast(message, 'success'),
  error: (message: string) => useUiStore.getState().showToast(message, 'error'),
  info: (message: string) => useUiStore.getState().showToast(message, 'info'),
};
