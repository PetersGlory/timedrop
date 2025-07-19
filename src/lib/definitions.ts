
export const PUBLIC_FLUTTERWAVE_PUBLIC_KEY="FLWPUBK-1c1a78c3bd5cb0f567b1be96c2df6725-X"


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
  status: 'Open' | 'Filled' | 'Cancelled';
};
