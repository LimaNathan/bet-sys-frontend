import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingState {
  hasCompletedOnboarding: boolean;
  currentStep: number;
  setCompleted: () => void;
  setStep: (step: number) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      currentStep: 0,
      setCompleted: () => set({ hasCompletedOnboarding: true, currentStep: 0 }),
      setStep: (step) => set({ currentStep: step }),
      reset: () => set({ hasCompletedOnboarding: false, currentStep: 0 }),
    }),
    {
      name: 'onboarding-storage',
    }
  )
);
