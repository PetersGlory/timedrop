
export const PUBLIC_FLUTTERWAVE_PUBLIC_KEY="FLWPUBK-5ee14d98f1a2564abaea36e4b3e74e81-X"


export type Market = {
  id: string;
  category: string;
  question: string;
  image: {
    url: string;
    hint: string;
  };
  history: { date: string; chance: number }[];
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
  status: 'Open' | 'Filled' | 'Cancelled' | 'Closed'| 'pending';
};
