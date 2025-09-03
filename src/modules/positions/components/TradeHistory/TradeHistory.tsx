import { useTradingStore } from '../../../../commons/stores';

type TradeHistoryProps = {
  className?: string;
};

export function TradeHistory({ className = '' }: TradeHistoryProps) {
  const { trades } = useTradingStore();
  
  const sortedTrades = trades.sort((a, b) => b.timestamp - a.timestamp);

  if (trades.length === 0) {
    return (
      <div className={`${className} bg-white dark:bg-gray-800 rounded-lg p-4`}>
        <h3 className="font-medium text-gray-900 dark:text-white mb-4">Trade History</h3>
        <div className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
          No trades yet
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} bg-white dark:bg-gray-800 rounded-lg p-4`}>
      <h3 className="font-medium text-gray-900 dark:text-white mb-4">
        Trade History ({trades.length})
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
              <th className="pb-2 font-medium">Time</th>
              <th className="pb-2 font-medium">Asset</th>
              <th className="pb-2 font-medium">Side</th>
              <th className="pb-2 font-medium">Qty</th>
              <th className="pb-2 font-medium">Price</th>
              <th className="pb-2 font-medium">Type</th>
            </tr>
          </thead>
          <tbody>
            {sortedTrades.map((trade) => (
              <tr key={trade.id} className="border-b dark:border-gray-700 text-sm">
                <td className="py-2 text-gray-600 dark:text-gray-400">
                  {new Date(trade.timestamp).toLocaleTimeString()}
                </td>
                <td className="py-2 font-medium text-gray-900 dark:text-white">
                  {trade.symbol}
                </td>
                <td className="py-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    trade.side === 'buy'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                  }`}>
                    {trade.side.toUpperCase()}
                  </span>
                </td>
                <td className="py-2 font-mono text-gray-900 dark:text-white">
                  {trade.quantity.toFixed(3)}
                </td>
                <td className="py-2 font-mono text-gray-900 dark:text-white">
                  ${trade.price.toLocaleString()}
                </td>
                <td className="py-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    trade.type === 'open'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                      : 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400'
                  }`}>
                    {trade.type.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}