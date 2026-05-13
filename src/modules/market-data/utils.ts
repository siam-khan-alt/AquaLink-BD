import { IPriceHistory } from "@/shared/types/market";

export const getFilteredHistory = (history: IPriceHistory[], range: 'week' | 'month') => {
  const now = new Date();
  const daysToKeep = range === 'week' ? 7 : 30;
  
  const cutoff = new Date(now.setDate(now.getDate() - daysToKeep));
  
  return history
    .filter(h => new Date(h.date) >= cutoff)
    .map(h => ({
      date: new Date(h.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' }),
      price: h.price
    }));
};