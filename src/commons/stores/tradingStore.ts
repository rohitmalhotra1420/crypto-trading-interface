import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Position, Trade } from '../../types';
import { loadPositions, savePositions, loadTrades, saveTrades } from '../utils';

type TradingStore = {
  positions: Position[];
  trades: Trade[];
  selectedSymbol: string;
  addPosition: (position: Position) => void;
  addTrade: (trade: Trade) => void;
  closePosition: (positionId: string, exitPrice: number, exitTimestamp: number) => void;
  setSelectedSymbol: (symbol: string) => void;
  getOpenPositions: () => Position[];
  getTotalPnL: (prices: Record<string, string>) => number;
};

export const useTradingStore = create<TradingStore>()(
  persist(
    (set, get) => ({
      positions: loadPositions(),
      trades: loadTrades(),
      selectedSymbol: 'BTC',
      
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
        const updatedPositions = get().positions.map(p =>
          p.id === positionId
            ? { ...p, status: 'closed' as const, exitPrice, exitTimestamp }
            : p
        );
        set({ positions: updatedPositions });
        savePositions(updatedPositions);
      },
      
      setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
      
      getOpenPositions: () => get().positions.filter(p => p.status === 'open'),
      
      getTotalPnL: (prices) => {
        return get().positions
          .filter(p => p.status === 'open')
          .reduce((total, position) => {
            const currentPrice = parseFloat(prices[position.symbol] || '0');
            if (!currentPrice) return total;
            
            const pnl = position.side === 'buy'
              ? (currentPrice - position.entryPrice) * position.quantity
              : (position.entryPrice - currentPrice) * position.quantity;
            
            return total + pnl;
          }, 0);
      },
    }),
    {
      name: 'trading-storage',
      partialize: (state) => ({
        positions: state.positions,
        trades: state.trades,
        selectedSymbol: state.selectedSymbol,
      }),
    }
  )
);