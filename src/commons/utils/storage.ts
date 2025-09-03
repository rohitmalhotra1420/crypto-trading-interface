import { Position, Trade } from '../../types';
import { POSITIONS_KEY, TRADES_KEY } from '../constants';

function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

export function loadPositions(): Position[] {
  const stored = localStorage.getItem(POSITIONS_KEY);
  return stored ? safeJsonParse(stored, []) : [];
}

export function savePositions(positions: Position[]): void {
  localStorage.setItem(POSITIONS_KEY, JSON.stringify(positions));
}

export function loadTrades(): Trade[] {
  const stored = localStorage.getItem(TRADES_KEY);
  return stored ? safeJsonParse(stored, []) : [];
}

export function saveTrades(trades: Trade[]): void {
  localStorage.setItem(TRADES_KEY, JSON.stringify(trades));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}