import { create } from 'zustand';

interface DiseaseStore {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useDiseaseStore = create<DiseaseStore>((set) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
}));