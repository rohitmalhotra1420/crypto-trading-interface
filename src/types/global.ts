export type Asset = {
  name: string;
  szDecimals: number;
};

export type AssetMeta = {
  universe: Asset[];
};

export type MidPrices = {
  [symbol: string]: string;
};

export type Candle = {
  t: number; // timestamp
  T: number; // close time
  s: string; // symbol
  i: string; // interval
  o: string; // open
  c: string; // close
  h: string; // high
  l: string; // low
  v: string; // volume
  n: number; // number of trades
};

export type Position = {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  entryPrice: number;
  timestamp: number;
  status: 'open' | 'closed';
  exitPrice?: number;
  exitTimestamp?: number;
};

export type Trade = {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  timestamp: number;
  type: 'open' | 'close';
  positionId?: string;
};

export type ApiResponse<T> = {
  data?: T;
  error?: string;
};

export type ThemeMode = 'light' | 'dark' | 'system';