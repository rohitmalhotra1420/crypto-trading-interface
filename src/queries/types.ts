import { AssetMeta, MidPrices, Candle } from '../types';

export type AssetMetaResponse = AssetMeta;
export type MidPricesResponse = MidPrices;
export type CandleResponse = Candle[];

export type CandleRequest = {
  coin: string;
  interval?: string;
  hoursBack?: number;
};