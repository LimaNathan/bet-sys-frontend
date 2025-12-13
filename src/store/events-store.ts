import { create } from 'zustand';

export interface EventOption {
  id: string;
  name: string;
  currentOdd: number;
  totalStaked: number;
}

export interface Event {
  id: string;
  title: string;
  category: 'SPORTS' | 'INTERNAL';
  status: 'PENDING' | 'OPEN' | 'LOCKED' | 'SETTLED' | 'CANCELED';
  pricingModel: 'FIXED_ODDS' | 'DYNAMIC_PARIMUTUEL';
  commenceTime: string;
  options: EventOption[];
  winnerOptionId?: string;
}

interface EventsState {
  events: Event[];
  setEvents: (events: Event[]) => void;
  updateEvent: (event: Event) => void;
  addEvent: (event: Event) => void;
}

export const useEventsStore = create<EventsState>((set) => ({
  events: [],
  setEvents: (events) => set({ events }),
  updateEvent: (updatedEvent) =>
    set((state) => ({
      events: state.events.map((e) =>
        e.id === updatedEvent.id ? updatedEvent : e
      ),
    })),
  addEvent: (event) =>
    set((state) => ({
      events: [...state.events, event],
    })),
}));
