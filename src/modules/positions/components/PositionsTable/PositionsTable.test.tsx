import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PositionsTable } from './PositionsTable';
import { useTradingStore } from '../../../../commons/stores';
import { usePrices } from '../../../../queries';

// Mock the stores and queries
vi.mock('../../../../commons/stores', () => ({
  useTradingStore: vi.fn(),
}));

vi.mock('../../../../queries', () => ({
  usePrices: vi.fn(),
}));

const mockUseTradingStore = useTradingStore as vi.MockedFunction<typeof useTradingStore>;
const mockUsePrices = usePrices as vi.MockedFunction<typeof usePrices>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('PositionsTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows empty state when no positions', () => {
    mockUseTradingStore.mockReturnValue({
      positions: [],
      closePosition: vi.fn(),
      addTrade: vi.fn(),
    } as any);

    mockUsePrices.mockReturnValue({
      data: {},
    } as any);

    render(<PositionsTable />, { wrapper: createWrapper() });

    expect(screen.getByText('No open positions')).toBeInTheDocument();
  });

  it('displays open positions with PnL calculations', () => {
    const mockPositions = [
      {
        id: '1',
        symbol: 'BTC',
        side: 'buy' as const,
        quantity: 1,
        entryPrice: 45000,
        timestamp: Date.now(),
        status: 'open' as const,
      },
    ];

    const mockPrices = {
      BTC: '50000',
    };

    mockUseTradingStore.mockReturnValue({
      positions: mockPositions,
      closePosition: vi.fn(),
      addTrade: vi.fn(),
    } as any);

    mockUsePrices.mockReturnValue({
      data: mockPrices,
    } as any);

    render(<PositionsTable />, { wrapper: createWrapper() });

    expect(screen.getByText('BTC')).toBeInTheDocument();
    expect(screen.getByText('BUY')).toBeInTheDocument();
    expect(screen.getByText('1.000')).toBeInTheDocument();
    expect(screen.getByText('$45,000')).toBeInTheDocument();
    expect(screen.getByText('$50,000')).toBeInTheDocument();
    expect(screen.getByText('+$5,000.00')).toBeInTheDocument(); // PnL
    expect(screen.getByText('+11.11%')).toBeInTheDocument(); // PnL%
  });
});