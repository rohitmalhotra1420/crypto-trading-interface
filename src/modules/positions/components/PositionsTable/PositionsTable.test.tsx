import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import { PositionsTable } from "./PositionsTable";
import { useTradingStore } from "../../../../commons/stores";
import { usePrices } from "../../../../queries";
import { MidPrices } from "../../../../types";

// Mock the stores and queries
vi.mock("../../../../commons/stores", () => ({
  useTradingStore: vi.fn(),
}));

vi.mock("../../../../queries", () => ({
  usePrices: vi.fn(),
}));

const mockUseTradingStore = useTradingStore as vi.MockedFunction<
  typeof useTradingStore
>;
const mockUsePrices = usePrices as vi.MockedFunction<typeof usePrices>;

// Type for React Query result
type QueryResult<T> = {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  isSuccess: boolean;
  isPending: boolean;
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("PositionsTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows empty state when no positions", () => {
    mockUseTradingStore.mockReturnValue({
      positions: [],
      closePosition: vi.fn(),
      addTrade: vi.fn(),
      trades: [],
      selectedSymbol: "BTC",
      addPosition: vi.fn(),
      setSelectedSymbol: vi.fn(),
      getOpenPositions: vi.fn().mockReturnValue([]),
      getTotalPnL: vi.fn().mockReturnValue(0),
      getAggregatedPositions: vi.fn().mockReturnValue([]),
      getAvailableQuantity: vi.fn().mockReturnValue(0),
      canSell: vi.fn().mockReturnValue(false),
    } as any);

    mockUsePrices.mockReturnValue({
      data: {},
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      isPending: false,
    } as QueryResult<MidPrices>);

    render(<PositionsTable />, { wrapper: createWrapper() });

    expect(screen.getByText("No open positions")).toBeInTheDocument();
  });

  it("displays open positions with PnL calculations", () => {
    const mockPositions = [
      {
        id: "1",
        symbol: "BTC",
        side: "buy" as const,
        quantity: 1,
        entryPrice: 45000,
        timestamp: Date.now(),
        status: "open" as const,
      },
    ];

    const mockAggregatedPositions = [
      {
        symbol: "BTC",
        buyQuantity: 1,
        sellQuantity: 0,
        netQuantity: 1,
        avgBuyPrice: 45000,
        avgSellPrice: 0,
      },
    ];

    const mockPrices: MidPrices = {
      BTC: "50000",
    };

    mockUseTradingStore.mockReturnValue({
      positions: mockPositions,
      closePosition: vi.fn(),
      addTrade: vi.fn(),
      trades: [],
      selectedSymbol: "BTC",
      addPosition: vi.fn(),
      setSelectedSymbol: vi.fn(),
      getOpenPositions: vi.fn().mockReturnValue(mockPositions),
      getTotalPnL: vi.fn().mockReturnValue(5000),
      getAggregatedPositions: vi.fn().mockReturnValue(mockAggregatedPositions),
      getAvailableQuantity: vi.fn().mockReturnValue(1),
      canSell: vi.fn().mockReturnValue(true),
    } as any);

    mockUsePrices.mockReturnValue({
      data: mockPrices,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      isPending: false,
    } as QueryResult<MidPrices>);

    render(<PositionsTable />, { wrapper: createWrapper() });

    expect(screen.getByText("BTC")).toBeInTheDocument();
    expect(screen.getByText("LONG")).toBeInTheDocument();
    expect(screen.getByText("1.000")).toBeInTheDocument();
    expect(screen.getByText("$45,000")).toBeInTheDocument();
    expect(screen.getByText("$50,000")).toBeInTheDocument();
    // Check for PnL text by looking at all table cells
    const tableCells = screen.getAllByRole("cell");
    const pnlCell = tableCells.find((cell) =>
      cell.textContent?.includes("+$5000.00")
    );
    const pnlPercentCell = tableCells.find((cell) =>
      cell.textContent?.includes("+11.11%")
    );

    expect(pnlCell).toBeTruthy();
    expect(pnlPercentCell).toBeTruthy();
  });
});
