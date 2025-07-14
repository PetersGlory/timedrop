export type Market = {
  id: string;
  category: string;
  question: string;
  image: {
    url: string;
    hint: string;
  };
  history: { date: string; volume: number }[];
  startDate: string;
  endDate: string;
};

export type Order = {
  id: string;
  marketId: string;
  marketName: string;
  type: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  status: 'Open' | 'Filled' | 'Cancelled';
};
