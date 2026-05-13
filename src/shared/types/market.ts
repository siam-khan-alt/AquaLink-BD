export type FishCategory = 'carp' | 'catfish' | 'prawn' | 'others';
export type PriceTrend = 'up' | 'down' | 'stable';

export interface IPriceHistory {
  date: string | Date;
  price: number;
}

export interface IMarketPrice {
  _id: string;
  fishName: string;
  currentPrice: number;
  unit: string;
  location: string;
  category: FishCategory;
  trend: PriceTrend;
  history: IPriceHistory[];
  lastUpdated: string | Date;
}

export interface IChartData {
  date: string;
  price: number;
}
export interface ScrapedFishData {
  fishName: string;
  price: number;
  location: string;
  category: 'carp' | 'catfish' | 'prawn' | 'others';
}