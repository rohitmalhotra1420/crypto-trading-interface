import { X } from 'lucide-react';
import { useTradingStore } from '../../../../commons/stores';
import { usePrices } from '../../../../queries';
import { generateId } from '../../../../commons/utils';
import { Position, Trade } from '../../../../types';

type PositionsTableProps = {
  className?: string;
};

export function PositionsTable({ className = '' }: PositionsTableProps) {
  const { positions, closePosition, addTrade } = useTradingStore();
  const { data: prices } = usePrices();
  
  const openPositions = positions.filter(p => p.status === 'open');

  const calculatePnL = (position: Position) => {
    if (!prices) return { pnl: 0, pnlPercent: 0 };
    
    const currentPrice = parseFloat(prices[position.symbol] || '0');
    if (!currentPrice) return { pnl: 0, pnlPercent: 0 };

    const pnl = position.side === 'buy'
      ? (currentPrice - position.entryPrice) * position.quantity
      : (position.entryPrice - currentPrice) * position.quantity;
    
    const pnlPercent = (pnl / (position.entryPrice * position.quantity)) * 100;
    
    return { pnl, pnlPercent };
  };

  const handleClose = (position: Position) => {
    if (!prices) return;
    
    const currentPrice = parseFloat(prices[position.symbol] || '0');
    if (!currentPrice) return;

    const now = Date.now();
    
    const trade: Trade = {
      id: generateId(),
      symbol: position.symbol,
      side: position.side === 'buy' ? 'sell' : 'buy',
      quantity: position.quantity,
      price: currentPrice,
      timestamp: now,
      type: 'close',
      positionId: position.id,
    };

    closePosition(position.id, currentPrice, now);
    addTrade(trade);
  };

  if (openPositions.length === 0) {
    return (
      <div className={`${className} bg-white dark:bg-gray-800 rounded-lg p-4`}>
        <h3 className="font-medium text-gray-900 dark:text-white mb-4">Positions</h3>
        <div className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
          No open positions
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} bg-white dark:bg-gray-800 rounded-lg p-4`}>
      <h3 className="font-medium text-gray-900 dark:text-white mb-4">
        Positions ({openPositions.length})
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
              <th className="pb-2 font-medium">Asset</th>
              <th className="pb-2 font-medium">Side</th>
              <th className="pb-2 font-medium">Qty</th>
              <th className="pb-2 font-medium">Entry</th>
              <th className="pb-2 font-medium">Last</th>
              <th className="pb-2 font-medium">PnL</th>
              <th className="pb-2 font-medium">PnL%</th>
              <th className="pb-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {openPositions.map((position) => {
              const currentPrice = prices ? parseFloat(prices[position.symbol] || '0') : 0;
              const { pnl, pnlPercent } = calculatePnL(position);
              
              return (
                <tr key={position.id} className="border-b dark:border-gray-700 text-sm">
                  <td className="py-2 font-medium text-gray-900 dark:text-white">
                    {position.symbol}
                  </td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      position.side === 'buy'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                    }`}>
                      {position.side.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2 font-mono text-gray-900 dark:text-white">
                    {position.quantity.toFixed(3)}
                  </td>
                  <td className="py-2 font-mono text-gray-900 dark:text-white">
                    ${position.entryPrice.toLocaleString()}
                  </td>
                  <td className="py-2 font-mono text-gray-900 dark:text-white">
                    {currentPrice ? `$${currentPrice.toLocaleString()}` : '—'}
                  </td>
                  <td className={`py-2 font-mono ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                  </td>
                  <td className={`py-2 font-mono ${pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                  </td>
                  <td className="py-2">
                    <button
                      onClick={() => handleClose(position)}
                      disabled={!currentPrice}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Close position"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}