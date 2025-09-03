import { useMemo, useState } from 'react';
import { useAssets, usePrices } from '../../../../queries';
import { SearchInput } from '../../../../commons/components';
import { Asset } from '../../../../types';

type MarketListProps = {
  selectedSymbol?: string;
  onSelectSymbol: (symbol: string) => void;
  className?: string;
};

export function MarketList({ selectedSymbol, onSelectSymbol, className = '' }: MarketListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: assetMeta, isLoading: assetsLoading, error: assetsError } = useAssets();
  const { data: prices, error: pricesError } = usePrices();

  const assets = assetMeta?.universe || [];

  const filteredAssets = useMemo(() => {
    if (!searchQuery.trim()) return assets;
    const query = searchQuery.toLowerCase();
    return assets.filter((asset: Asset) => 
      asset.name.toLowerCase().includes(query)
    );
  }, [assets, searchQuery]);

  const sortedAssets = useMemo(() => {
    if (!prices) return filteredAssets;
    
    return filteredAssets.sort((a, b) => {
      const priceA = parseFloat(prices[a.name] || '0');
      const priceB = parseFloat(prices[b.name] || '0');
      return priceB - priceA; // Sort by price descending
    });
  }, [filteredAssets, prices]);

  if (assetsLoading) {
    return (
      <div className={className}>
        <div className="animate-pulse space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (assetsError) {
    return (
      <div className={className}>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          Failed to load assets: {assetsError.message}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search assets..."
        />
      </div>

      {pricesError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          Price updates unavailable: {pricesError.message}
        </div>
      )}

      <div className="space-y-1 max-h-96 overflow-y-auto">
        {sortedAssets.map((asset) => {
          const price = prices?.[asset.name];
          const isSelected = selectedSymbol === asset.name;
          
          return (
            <button
              key={asset.name}
              onClick={() => onSelectSymbol(asset.name)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                isSelected
                  ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium text-gray-900 dark:text-white">
                  {asset.name}
                </div>
                <div className="text-right">
                  {price ? (
                    <div className="font-mono text-sm text-gray-900 dark:text-white">
                      ${parseFloat(price).toLocaleString()}
                    </div>
                  ) : (
                    <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}