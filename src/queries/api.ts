import { API_BASE } from '../commons/constants';
import { AssetMetaResponse, MidPricesResponse, CandleResponse, CandleRequest } from './types';

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new ApiError(`HTTP ${response.status}`, response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Network error');
  }
}

export async function fetchAssetMeta(): Promise<AssetMetaResponse> {
  return fetchJson<AssetMetaResponse>(`${API_BASE}/info`, {
    method: 'POST',
    body: JSON.stringify({ type: 'meta' }),
  });
}

export async function fetchAllMids(): Promise<MidPricesResponse> {
  return fetchJson<MidPricesResponse>(`${API_BASE}/info`, {
    method: 'POST',
    body: JSON.stringify({ type: 'allMids' }),
  });
}

export async function fetchCandleSnapshot({ 
  coin, 
  interval = '1h', 
  hoursBack = 24 
}: CandleRequest): Promise<CandleResponse> {
  const startTime = Date.now() - (hoursBack * 60 * 60 * 1000);
  
  return fetchJson<CandleResponse>(`${API_BASE}/info`, {
    method: 'POST',
    body: JSON.stringify({
      type: 'candleSnapshot',
      req: { coin, interval, startTime }
    }),
  });
}