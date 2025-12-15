import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BetSelection {
  eventId: string;
  eventTitle: string;
  optionId: string;
  optionName: string;
  currentOdd: number;
}

type BetMode = 'SINGLE' | 'MULTIPLE';

interface BetSlipState {
  selections: BetSelection[];
  mode: BetMode;
  amount: string;

  // Actions
  addSelection: (selection: BetSelection) => void;
  removeSelection: (eventId: string) => void;
  clearSlip: () => void;
  setMode: (mode: BetMode) => void;
  setAmount: (amount: string) => void;

  // Computed helpers
  getTotalOdd: () => number;
  getPotentialPayout: () => number;
  hasEventSelected: (eventId: string) => boolean;
  getSelectionForEvent: (eventId: string) => BetSelection | undefined;
}

export const useBetSlipStore = create<BetSlipState>()(
  persist(
    (set, get) => ({
      selections: [],
      mode: 'MULTIPLE',
      amount: '',

      addSelection: (selection) => {
        const { selections, mode } = get();

        // In MULTIPLE mode, replace selection from same event
        const existingIndex = selections.findIndex(
          (s) => s.eventId === selection.eventId
        );

        if (existingIndex >= 0) {
          // Replace existing selection for this event
          const newSelections = [...selections];
          newSelections[existingIndex] = selection;
          set({ selections: newSelections });
        } else {
          // Add new selection
          set({ selections: [...selections, selection] });
        }
      },

      removeSelection: (eventId) => {
        set((state) => ({
          selections: state.selections.filter((s) => s.eventId !== eventId),
        }));
      },

      clearSlip: () => {
        set({ selections: [], amount: '' });
      },

      setMode: (mode) => {
        set({ mode });
      },

      setAmount: (amount) => {
        set({ amount });
      },

      getTotalOdd: () => {
        const { selections, mode } = get();
        if (selections.length === 0) return 0;

        if (mode === 'MULTIPLE') {
          // Multiply all odds
          return selections.reduce((acc, s) => acc * s.currentOdd, 1);
        } else {
          // Single mode: just first selection's odd
          return selections[0]?.currentOdd || 0;
        }
      },

      getPotentialPayout: () => {
        const { amount } = get();
        const totalOdd = get().getTotalOdd();
        const parsedAmount = parseFloat(amount) || 0;
        return parsedAmount * totalOdd;
      },

      hasEventSelected: (eventId) => {
        return get().selections.some((s) => s.eventId === eventId);
      },

      getSelectionForEvent: (eventId) => {
        return get().selections.find((s) => s.eventId === eventId);
      },
    }),
    {
      name: 'bet-slip-storage',
      partialize: (state) => ({
        selections: state.selections,
        mode: state.mode,
        amount: state.amount,
      }),
    }
  )
);
