import { useState } from "react";
import { useTradingStore } from "../../../../commons/stores";
import { generateId } from "../../../../commons/utils";
import { Position, Trade } from "../../../../types";

type TradeFormProps = {
  symbol: string;
  currentPrice: number;
  className?: string;
};

export function TradeForm({
  symbol,
  currentPrice,
  className = "",
}: TradeFormProps) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState<string>("1");
  const [submitting, setSubmitting] = useState(false);

  const {
    addPosition,
    addTrade,
    getAvailableQuantity,
    getOpenPositions,
    closePosition,
    updatePosition,
  } = useTradingStore();

  const availableQuantity = getAvailableQuantity(symbol);
  const requestedQuantity = parseFloat(quantity) || 0;
  const isShortSelling =
    side === "sell" && requestedQuantity > availableQuantity;
  const sellError =
    side === "sell" &&
    requestedQuantity > 0 &&
    availableQuantity > 0 &&
    requestedQuantity > availableQuantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) return;

    // For paper trading, allow short selling (selling without owning)
    // In real trading, this would require margin and have different rules
    if (side === "sell" && getAvailableQuantity(symbol) < qty) {
      // This is a short sell - we're selling more than we own
      // In a real platform, this would require margin account
      console.log(
        `Short selling ${qty - getAvailableQuantity(symbol)} ${symbol}`
      );
    }

    setSubmitting(true);

    try {
      const now = Date.now();

      if (side === "buy") {
        // Opening a new long position
        const positionId = generateId();

        const position: Position = {
          id: positionId,
          symbol,
          side,
          quantity: qty,
          entryPrice: currentPrice,
          timestamp: now,
          status: "open",
        };

        const trade: Trade = {
          id: generateId(),
          symbol,
          side,
          quantity: qty,
          price: currentPrice,
          timestamp: now,
          type: "open",
          positionId,
        };

        addPosition(position);
        addTrade(trade);
      } else {
        // Selling - should close existing positions
        const openPositions = getOpenPositions().filter(
          (p) => p.symbol === symbol && p.side === "buy"
        );

        if (openPositions.length > 0) {
          // Close existing positions
          let remainingQty = qty;

          for (const position of openPositions) {
            if (remainingQty <= 0) break;

            const closeQty = Math.min(remainingQty, position.quantity);

            const trade: Trade = {
              id: generateId(),
              symbol,
              side: "sell",
              quantity: closeQty,
              price: currentPrice,
              timestamp: now,
              type: "close",
              positionId: position.id,
            };

            addTrade(trade);

            // Update position quantity
            if (closeQty === position.quantity) {
              // Close the entire position
              closePosition(position.id, currentPrice, now);
            } else {
              // Partial close - reduce quantity
              updatePosition(position.id, {
                quantity: position.quantity - closeQty,
              });
            }

            remainingQty -= closeQty;
          }
        } else {
          // No existing positions to close - create a short position
          const positionId = generateId();

          const position: Position = {
            id: positionId,
            symbol,
            side: "sell",
            quantity: qty,
            entryPrice: currentPrice,
            timestamp: now,
            status: "open",
          };

          const trade: Trade = {
            id: generateId(),
            symbol,
            side: "sell",
            quantity: qty,
            price: currentPrice,
            timestamp: now,
            type: "open",
            positionId,
          };

          addPosition(position);
          addTrade(trade);
        }
      }

      setQuantity("1");
    } finally {
      setSubmitting(false);
    }
  };

  const estimatedValue = parseFloat(quantity || "0") * currentPrice;

  return (
    <div className={`${className} bg-white dark:bg-gray-800 rounded-lg p-4`}>
      <h3 className="font-medium text-gray-900 dark:text-white mb-4">
        Place Trade
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Balance Display */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Current Balance
          </label>
          <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded border text-gray-900 dark:text-white">
            <div className="flex justify-between items-center">
              <span className="font-medium">{symbol}</span>
              <span className="font-mono">{availableQuantity.toFixed(3)}</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              ≈ ${(availableQuantity * currentPrice).toLocaleString()}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Asset
          </label>
          <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded border text-gray-900 dark:text-white">
            {symbol} @ ${currentPrice.toLocaleString()}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Side
          </label>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setSide("buy")}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                side === "buy"
                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-300 dark:border-green-700"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Buy
            </button>
            <button
              type="button"
              onClick={() => setSide("sell")}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                side === "sell"
                  ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-red-300 dark:border-red-700"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Sell
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="quantity"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Quantity
          </label>
          <input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="0.001"
            step="0.001"
            required
            className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
              sellError
                ? "border-red-500 dark:border-red-500"
                : "border-gray-300 dark:border-gray-600"
            }`}
          />
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Est. value: ${estimatedValue.toLocaleString()}
          </div>
          {side === "sell" && (
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Available: {availableQuantity.toFixed(3)} {symbol}
              {isShortSelling && (
                <span className="text-orange-600 dark:text-orange-400 ml-2">
                  (Short selling{" "}
                  {Math.abs(requestedQuantity - availableQuantity).toFixed(3)}{" "}
                  {symbol})
                </span>
              )}
            </div>
          )}
          {sellError && (
            <div className="mt-1 text-xs text-red-600 dark:text-red-400">
              Insufficient balance. You can only sell{" "}
              {availableQuantity.toFixed(3)} {symbol}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={
            submitting || !quantity || parseFloat(quantity) <= 0 || sellError
          }
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            side === "buy"
              ? "bg-green-600 hover:bg-green-700 disabled:bg-green-300"
              : "bg-red-600 hover:bg-red-700 disabled:bg-red-300"
          } text-white disabled:cursor-not-allowed`}
        >
          {submitting
            ? "Placing..."
            : `${
                side === "buy" ? "Buy" : isShortSelling ? "Short Sell" : "Sell"
              } ${symbol}`}
        </button>
      </form>
    </div>
  );
}
