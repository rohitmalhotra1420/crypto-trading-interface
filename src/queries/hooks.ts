import { useQuery } from '@tanstack/react-query';
import { fetchAssetMeta, fetchAllMids, fetchCandleSnapshot } from './api';
import { CandleRequest } from './types';
import { POLL_INTERVAL } from '../commons/constants';

export function useAssets() {
  return useQuery({
    queryKey: ['assets'],
    queryFn: fetchAssetMeta,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
}

export function usePrices() {
  return useQuery({
    queryKey: ['prices'],
    queryFn: fetchAllMids,
    refetchInterval: POLL_INTERVAL,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useCandles(request: CandleRequest) {
  return useQuery({
    queryKey: ['candles', request.coin, request.interval, request.hoursBack],
    queryFn: () => fetchCandleSnapshot(request),
    enabled: !!request.coin,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
}