import { useTradingStore } from "../../../../commons/stores";
import { usePrices } from "../../../../queries";
import { generateId } from "../../../../commons/utils";
import { Trade } from "../../../../types";

type PositionsTableProps = {
  className?: string;
};

export function PositionsTable({ className = "" }: PositionsTableProps) {
  const { getAggregatedPositions, closePosition, addTrade, getOpenPositions } =
    useTradingStore();
  const { data: prices } = usePrices();

  const aggregatedPositions = getAggregatedPositions().filter(
    (p) => p.netQuantity !== 0
  );

  const calculatePnL = (position: {
    symbol: string;
    netQuantity: number;
    avgBuyPrice: number;
    avgSellPrice: number;
  }) => {
    if (!prices) return { pnl: 0, pnlPercent: 0 };

    const currentPrice = parseFloat(prices[position.symbol] || "0");
    if (!currentPrice) return { pnl: 0, pnlPercent: 0 };

    // For long positions (positive net quantity)
    if (position.netQuantity > 0) {
      const pnl = (currentPrice - position.avgBuyPrice) * position.netQuantity;
      const pnlPercent =
        (pnl / (position.avgBuyPrice * position.netQuantity)) * 100;
      return { pnl, pnlPercent };
    }

    // For short positions (negative net quantity)
    const pnl =
      (position.avgSellPrice - currentPrice) * Math.abs(position.netQuantity);
    const pnlPercent =
      (pnl / (position.avgSellPrice * Math.abs(position.netQuantity))) * 100;
    return { pnl, pnlPercent };
  };

  const handleClose = (position: {
    symbol: string;
    netQuantity: number;
    avgBuyPrice: number;
    avgSellPrice: number;
  }) => {
    if (!prices) return;

    const currentPrice = parseFloat(prices[position.symbol] || "0");
    if (!currentPrice) return;

    const now = Date.now();

    // Get the actual open positions to close them
    const openPositions = getOpenPositions().filter(
      (p) => p.symbol === position.symbol
    );

    // Close all positions for this symbol
    openPositions.forEach((pos) => {
      const trade: Trade = {
        id: generateId(),
        symbol: pos.symbol,
        side: pos.side === "buy" ? "sell" : "buy", // Opposite side to close
        quantity: pos.quantity,
        price: currentPrice,
        timestamp: now,
        type: "close",
        positionId: pos.id,
      };

      addTrade(trade);
      closePosition(pos.id, currentPrice, now);
    });
  };

  if (aggregatedPositions.length === 0) {
    return (
      <div className={`${className} bg-white dark:bg-gray-800 rounded-lg p-4`}>
        <h3 className="font-medium text-gray-900 dark:text-white mb-4">
          Positions
        </h3>
        <div className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
          No open positions
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} bg-white dark:bg-gray-800 rounded-lg p-4`}>
      <h3 className="font-medium text-gray-900 dark:text-white mb-4">
        Positions
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b dark:border-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th className="pb-3">Asset</th>
              <th className="pb-3">Side</th>
              <th className="pb-3">Quantity</th>
              <th className="pb-3">Avg Price</th>
              <th className="pb-3">Current Price</th>
              <th className="pb-3">PnL</th>
              <th className="pb-3">PnL %</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {aggregatedPositions.map((position) => {
              const currentPrice = prices
                ? parseFloat(prices[position.symbol] || "0")
                : 0;
              const { pnl, pnlPercent } = calculatePnL(position);
              const isLong = position.netQuantity > 0;

              return (
                <tr
                  key={position.symbol}
                  className="border-b dark:border-gray-700 text-sm"
                >
                  <td className="py-2 font-medium text-gray-900 dark:text-white">
                    {position.symbol}
                  </td>
                  <td className="py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        isLong
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                          : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                      }`}
                    >
                      {isLong ? "LONG" : "SHORT"}
                    </span>
                  </td>
                  <td className="py-2 font-mono text-gray-900 dark:text-white">
                    {Math.abs(position.netQuantity).toFixed(3)}
                  </td>
                  <td className="py-2 font-mono text-gray-900 dark:text-white">
                    $
                    {(isLong
                      ? position.avgBuyPrice
                      : position.avgSellPrice
                    ).toLocaleString()}
                  </td>
                  <td className="py-2 font-mono text-gray-900 dark:text-white">
                    {currentPrice ? `$${currentPrice.toLocaleString()}` : "—"}
                  </td>
                  <td
                    className={`py-2 font-mono ${
                      pnl >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                  </td>
                  <td
                    className={`py-2 font-mono ${
                      pnlPercent >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {pnlPercent >= 0 ? "+" : ""}
                    {pnlPercent.toFixed(2)}%
                  </td>
                  <td className="py-2">
                    <button
                      onClick={() => handleClose(position)}
                      className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Close
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
