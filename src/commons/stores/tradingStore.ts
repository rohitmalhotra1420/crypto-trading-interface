import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Position, Trade } from "../../types";
import { loadPositions, savePositions, loadTrades, saveTrades } from "../utils";

type TradingStore = {
  positions: Position[];
  trades: Trade[];
  selectedSymbol: string;
  addPosition: (position: Position) => void;
  addTrade: (trade: Trade) => void;
  closePosition: (
    positionId: string,
    exitPrice: number,
    exitTimestamp: number
  ) => void;
  updatePosition: (positionId: string, updates: Partial<Position>) => void;
  setSelectedSymbol: (symbol: string) => void;
  getOpenPositions: () => Position[];
  getTotalPnL: (prices: Record<string, string>) => number;
  getAvailableQuantity: (symbol: string) => number;
  canSell: (symbol: string, quantity: number) => boolean;
  getAggregatedPositions: () => Array<{
    symbol: string;
    buyQuantity: number;
    sellQuantity: number;
    netQuantity: number;
    avgBuyPrice: number;
    avgSellPrice: number;
  }>;
};

export const useTradingStore = create<TradingStore>()(
  persist(
    (set, get) => ({
      positions: loadPositions(),
      trades: loadTrades(),
      selectedSymbol: "BTC",

      addPosition: (position) => {
        const newPositions = [...get().positions, position];
        set({ positions: newPositions });
        savePositions(newPositions);
      },

      addTrade: (trade) => {
        const newTrades = [...get().trades, trade];
        set({ trades: newTrades });
        saveTrades(newTrades);
      },

      closePosition: (positionId, exitPrice, exitTimestamp) => {
        const updatedPositions = get().positions.map((p) =>
          p.id === positionId
            ? { ...p, status: "closed" as const, exitPrice, exitTimestamp }
            : p
        );
        set({ positions: updatedPositions });
        savePositions(updatedPositions);
      },

      updatePosition: (positionId, updates) => {
        const updatedPositions = get().positions.map((p) =>
          p.id === positionId ? { ...p, ...updates } : p
        );
        set({ positions: updatedPositions });
        savePositions(updatedPositions);
      },

      setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),

      getOpenPositions: () =>
        get().positions.filter((p) => p.status === "open"),

      getTotalPnL: (prices) => {
        return get()
          .positions.filter((p) => p.status === "open")
          .reduce((total, position) => {
            const currentPrice = parseFloat(prices[position.symbol] || "0");
            if (!currentPrice) return total;

            const pnl =
              position.side === "buy"
                ? (currentPrice - position.entryPrice) * position.quantity
                : (position.entryPrice - currentPrice) * position.quantity;

            return total + pnl;
          }, 0);
      },

      getAvailableQuantity: (symbol: string) => {
        const openPositions = get().positions.filter(
          (p) => p.status === "open" && p.symbol === symbol
        );

        const buyQuantity = openPositions
          .filter((p) => p.side === "buy")
          .reduce((total, p) => total + p.quantity, 0);

        const sellQuantity = openPositions
          .filter((p) => p.side === "sell")
          .reduce((total, p) => total + p.quantity, 0);

        return buyQuantity - sellQuantity;
      },

      canSell: (symbol: string, quantity: number) => {
        const availableQuantity = get().getAvailableQuantity(symbol);
        return availableQuantity >= quantity;
      },

      getAggregatedPositions: () => {
        const openPositions = get().positions.filter(
          (p) => p.status === "open"
        );
        const symbolMap = new Map<
          string,
          {
            buyQuantity: number;
            sellQuantity: number;
            buyValue: number;
            sellValue: number;
          }
        >();

        openPositions.forEach((position) => {
          if (!symbolMap.has(position.symbol)) {
            symbolMap.set(position.symbol, {
              buyQuantity: 0,
              sellQuantity: 0,
              buyValue: 0,
              sellValue: 0,
            });
          }

          const current = symbolMap.get(position.symbol)!;
          if (position.side === "buy") {
            current.buyQuantity += position.quantity;
            current.buyValue += position.quantity * position.entryPrice;
          } else {
            current.sellQuantity += position.quantity;
            current.sellValue += position.quantity * position.entryPrice;
          }
        });

        return Array.from(symbolMap.entries()).map(([symbol, data]) => ({
          symbol,
          buyQuantity: data.buyQuantity,
          sellQuantity: data.sellQuantity,
          netQuantity: data.buyQuantity - data.sellQuantity,
          avgBuyPrice:
            data.buyQuantity > 0 ? data.buyValue / data.buyQuantity : 0,
          avgSellPrice:
            data.sellQuantity > 0 ? data.sellValue / data.sellQuantity : 0,
        }));
      },
    }),
    {
      name: "trading-storage",
      partialize: (state) => ({
        positions: state.positions,
        trades: state.trades,
        selectedSymbol: state.selectedSymbol,
      }),
    }
  )
);
