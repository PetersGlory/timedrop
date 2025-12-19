
import type { Market, Order } from './definitions';
import { eachHourOfInterval, format, addHours, subHours } from 'date-fns';

function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export const generateMarketHistory = (startDate: string, endDate: string, initialChance: number) => {

  const seed = new Date(startDate).getTime();
  let seedCounter = 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  
  const relevantEndDate = end < today ? end : (start > today ? start : today);

  if (relevantEndDate < start) {
    return [{ date: format(start, 'HH:mm'), chance: initialChance }];
  }

  const hourRange = eachHourOfInterval({ start, end: relevantEndDate });
  let lastChance = initialChance;

  if (hourRange.length === 0) {
    return [{ date: format(start, 'HH:mm'), chance: initialChance }];
  }

  return hourRange.map((date, index) => {
    // Simulate a gentle random walk for the probability using seededRandom
    const change = (seededRandom(seed + index) - 0.5) * 5; // Change by up to +/- 2.5 percentage points
    let newChance = lastChance + change;
    
    // Clamp the chance between 5 and 95 to keep it realistic
    newChance = Math.max(5, Math.min(95, newChance));
    
    lastChance = newChance;
    return {
      date: format(date, 'HH:mm'),
      chance: Math.round(newChance),
    };
  });
};


export const markets: Market[] = [
  {
    id: '1',
    category: 'Finance',
    question: 'Will the S&P 500 close above 5,500 today?',
    image: {
      url: 'https://placehold.co/600x400.png',
      hint: 'stock market',
    },
    startDate: subHours(new Date(), 4).toISOString(),
    endDate: addHours(new Date(), 20).toISOString(),
    history: [],
  },
  {
    id: '2',
    category: 'News',
    question: 'Will the UN Security Council pass a new resolution on AI safety this week?',
    image: {
      url: 'https://placehold.co/600x400.png',
      hint: 'government building',
    },
    startDate: subHours(new Date(), 12).toISOString(),
    endDate: addHours(new Date(), 12).toISOString(),
    history: [],
  },
  {
    id: '3',
    category: 'Technology',
    question: 'Will a major tech company announce a new flagship phone in the next 24 hours?',
    image: {
      url: 'https://placehold.co/600x400.png',
      hint: 'quantum computer',
    },
    startDate: subHours(new Date(), 2).toISOString(),
    endDate: addHours(new Date(), 22).toISOString(),
    history: [],
  },
  {
    id: '4',
    category: 'Crypto',
    question: 'Will Bitcoin (BTC) price cross the $70,000 mark in the next 24 hours?',
    image: {
      url: 'https://placehold.co/600x400.png',
      hint: 'bitcoin crypto',
    },
    startDate: subHours(new Date(), 8).toISOString(),
    endDate: addHours(new Date(), 16).toISOString(),
    history: [],
  },
  {
    id: '5',
    category: 'Sports',
    question: 'Will the final score of the championship game be decided by more than 10 points tonight?',
    image: {
      url: 'https://placehold.co/600x400.png',
      hint: 'basketball game',
    },
    startDate: subHours(new Date(), 1).toISOString(),
    endDate: addHours(new Date(), 23).toISOString(),
    history: [],
  },
  {
    id: '6',
    category: 'Science',
    question: 'Will the new telescope release its first images within 24 hours?',
    image: {
      url: 'https://placehold.co/600x400.png',
      hint: 'mars planet',
    },
    startDate: new Date().toISOString(),
    endDate: addHours(new Date(), 24).toISOString(),
    history: [],
  },
  {
    id: '7',
    category: 'Health',
    question: 'Will the FDA approve the new drug in the next 24-hour session?',
    image: {
      url: 'https://placehold.co/600x400.png',
      hint: 'science laboratory',
    },
    startDate: subHours(new Date(), 6).toISOString(),
    endDate: addHours(new Date(), 18).toISOString(),
    history: [],
  },
  {
    id: '8',
    category: 'Economics',
    question: 'Will the jobs report released tomorrow morning exceed expectations?',
    image: {
      url: 'https://placehold.co/600x400.png',
      hint: 'dollar bills',
    },
    startDate: subHours(new Date(), 10).toISOString(),
    endDate: addHours(new Date(), 14).toISOString(),
    history: [],
  },
  {
    id: '9',
    category: 'Technology',
    question: 'Was the Apple Vision Pro a commercial success in its first year?',
    image: {
      url: 'https://placehold.co/600x400.png',
      hint: 'virtual reality',
    },
    startDate: '2023-06-01T00:00:00Z',
    endDate: '2024-02-02T23:59:59Z',
    history: [],
  },
].map(market => {
  const initialChances: {[key: string]: number} = {
    '1': 55, '2': 30, '3': 15, '4': 70, '5': 60, '6': 85, '7': 40, '8': 50, '9': 75
  };
  return {
    ...market,
    history: generateMarketHistory(market.startDate, market.endDate, initialChances[market.id] || 50)
  }
});

export const openOrders: Order[] = [
  { id: 'o1', marketId: '1', marketName: 'S&P 500 > 5,500', type: 'BUY', price: 1, quantity: 100, status: 'Open' },
  { id: 'o2', marketId: '3', marketName: 'Quantum Computer by 2025', type: 'SELL', price: 1, quantity: 50, status: 'Open' },
];

export const filledOrders: Order[] = [
  { id: 'f1', marketId: '2', marketName: 'UK Election: Labour Majority', type: 'BUY', price: 1, quantity: 200, status: 'Filled' },
  { id: 'f2', marketId: '4', marketName: 'BTC > $100k in 2024', type: 'BUY', price: 1, quantity: 500, status: 'Filled' },
  { id: 'f3', marketId: '1', marketName: 'S&P 500 > 5,500', type: 'SELL', price: 1, quantity: 75, status: 'Filled' },
];

// This represents the global order book for all markets from all users.
export const marketOrders: Order[] = [
  // Market 1
  { id: 'm1', marketId: '1', marketName: 'S&P 500 > 5,500', type: 'BUY', price: 1, quantity: 5000, status: 'Open' },
  { id: 'm2', marketId: '1', marketName: 'S&P 500 > 5,500', type: 'BUY', price: 1, quantity: 10000, status: 'Open' },
  { id: 'm3', marketId: '1', marketName: 'S&P 500 > 5,500', type: 'BUY', price: 1, quantity: 50000, status: 'Open' },
  { id: 'm4', marketId: '1', marketName: 'S&P 500 > 5,500', type: 'SELL', price: 1, quantity: 5000, status: 'Open' },
  { id: 'm5', marketId: '1', marketName: 'S&P 500 > 5,500', type: 'SELL', price: 1, quantity: 20000, status: 'Open' },
  { id: 'm6', marketId: '1', marketName: 'S&P 500 > 5,500', type: 'SELL', price: 1, quantity: 20000, status: 'Open' },
  // Market 2
  { id: 'm7', marketId: '2', marketName: 'UK Election: Labour Majority', type: 'BUY', price: 1, quantity: 50000, status: 'Open' },
  { id: 'm8', marketId: '2', marketName: 'UK Election: Labour Majority', type: 'BUY', price: 1, quantity: 50000, status: 'Open' },
  { id: 'm9', marketId: '2', marketName: 'UK Election: Labour Majority', type: 'BUY', price: 1, quantity: 100000, status: 'Open' },
  // Market 4
  { id: 'm10', marketId: '4', marketName: 'BTC > $100k in 2024', type: 'SELL', price: 1, quantity: 200000, status: 'Open' },
  { id: 'm11', marketId: '4', marketName: 'BTC > $100k in 2024', type: 'SELL', price: 1, quantity: 200000, status: 'Open' },
  { id: 'm12', marketId: '4', marketName: 'BTC > $100k in 2024', type: 'SELL', price: 1, quantity: 500000, status: 'Open' },
];

export const getMarketById = (id: string): Market | undefined => {
  return markets.find((market) => market.id === id);
};

export const getOrdersByMarketId = (marketId: string): Order[] => {
  return marketOrders.filter((order) => order.marketId === marketId);
};
