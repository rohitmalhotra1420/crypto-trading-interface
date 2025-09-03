import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TradeForm } from './TradeForm';
import { useTradingStore } from '../../../../commons/stores';

// Mock the store
vi.mock('../../../../commons/stores', () => ({
  useTradingStore: vi.fn(),
}));

const mockUseTradingStore = useTradingStore as vi.MockedFunction<typeof useTradingStore>;

describe('TradeForm', () => {
  const mockAddPosition = vi.fn();
  const mockAddTrade = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTradingStore.mockReturnValue({
      addPosition: mockAddPosition,
      addTrade: mockAddTrade,
    } as any);
  });

  it('renders trade form with default values', () => {
    render(<TradeForm symbol="BTC" currentPrice={50000} />);

    expect(screen.getByText('Place Trade')).toBeInTheDocument();
    expect(screen.getByText('BTC @ $50,000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    expect(screen.getByText('Buy BTC')).toBeInTheDocument();
  });

  it('switches between buy and sell sides', () => {
    render(<TradeForm symbol="BTC" currentPrice={50000} />);

    const sellButton = screen.getByText('Sell');
    fireEvent.click(sellButton);

    expect(screen.getByText('Sell BTC')).toBeInTheDocument();
  });

  it('calculates estimated value correctly', () => {
    render(<TradeForm symbol="BTC" currentPrice={50000} />);

    const quantityInput = screen.getByLabelText('Quantity');
    fireEvent.change(quantityInput, { target: { value: '2' } });

    expect(screen.getByText('Est. value: $100,000')).toBeInTheDocument();
  });

  it('submits trade with correct data', async () => {
    render(<TradeForm symbol="BTC" currentPrice={50000} />);

    const quantityInput = screen.getByLabelText('Quantity');
    fireEvent.change(quantityInput, { target: { value: '0.5' } });

    const submitButton = screen.getByText('Buy BTC');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAddPosition).toHaveBeenCalledWith(
        expect.objectContaining({
          symbol: 'BTC',
          side: 'buy',
          quantity: 0.5,
          entryPrice: 50000,
          status: 'open',
        })
      );
    });

    expect(mockAddTrade).toHaveBeenCalledWith(
      expect.objectContaining({
        symbol: 'BTC',
        side: 'buy',
        quantity: 0.5,
        price: 50000,
        type: 'open',
      })
    );
  });
});