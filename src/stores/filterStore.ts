import { create } from 'zustand';

export interface FilterState {
  searchQuery: string;
  sortBy: 'newest' | 'oldest' | 'mostFunded' | 'leastFunded' | 'endingSoon' | 'mostPopular';
  statusFilter: string[];
  minGoal: number;
  maxGoal: number;
  dateRange: 'all' | 'thisWeek' | 'thisMonth' | 'thisQuarter';
}

interface FilterStore extends FilterState {
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: FilterState['sortBy']) => void;
  setStatusFilter: (statuses: string[]) => void;
  setGoalRange: (min: number, max: number) => void;
  setDateRange: (range: FilterState['dateRange']) => void;
  resetFilters: () => void;
}

const initialState: FilterState = {
  searchQuery: '',
  sortBy: 'newest',
  statusFilter: [],
  minGoal: 0,
  maxGoal: 1000000,
  dateRange: 'all',
};

export const useFilterStore = create<FilterStore>((set) => ({
  ...initialState,
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setSortBy: (sort: FilterState['sortBy']) => set({ sortBy: sort }),
  setStatusFilter: (statuses: string[]) => set({ statusFilter: statuses }),
  setGoalRange: (min: number, max: number) => set({ minGoal: min, maxGoal: max }),
  setDateRange: (range: FilterState['dateRange']) => set({ dateRange: range }),
  resetFilters: () => set(initialState),
}));
