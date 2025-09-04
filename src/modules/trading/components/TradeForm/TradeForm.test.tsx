import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TradeForm } from "./TradeForm";
import { useTradingStore } from "../../../../commons/stores";

// Mock the store
vi.mock("../../../../commons/stores", () => ({
  useTradingStore: vi.fn(),
}));

const mockUseTradingStore = useTradingStore as vi.MockedFunction<
  typeof useTradingStore
>;

describe("TradeForm", () => {
  const mockAddPosition = vi.fn();
  const mockAddTrade = vi.fn();
  const mockGetAvailableQuantity = vi.fn();
  const mockCanSell = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTradingStore.mockReturnValue({
      addPosition: mockAddPosition,
      addTrade: mockAddTrade,
      getAvailableQuantity: mockGetAvailableQuantity,
      canSell: mockCanSell,
      positions: [],
      trades: [],
      selectedSymbol: "BTC",
      closePosition: vi.fn(),
      setSelectedSymbol: vi.fn(),
      getOpenPositions: vi.fn().mockReturnValue([]),
      getTotalPnL: vi.fn().mockReturnValue(0),
      getAggregatedPositions: vi.fn().mockReturnValue([]),
    } as any);
  });

  it("renders trade form with default values", () => {
    mockGetAvailableQuantity.mockReturnValue(10);
    render(<TradeForm symbol="BTC" currentPrice={50000} />);

    expect(screen.getByText("Place Trade")).toBeInTheDocument();
    expect(screen.getByText("BTC @ $50,000")).toBeInTheDocument();
    expect(screen.getByDisplayValue("1")).toBeInTheDocument();
    expect(screen.getByText("Buy BTC")).toBeInTheDocument();
  });

  it("switches between buy and sell sides", () => {
    mockGetAvailableQuantity.mockReturnValue(10);
    render(<TradeForm symbol="BTC" currentPrice={50000} />);

    const sellButton = screen.getByText("Sell");
    fireEvent.click(sellButton);

    expect(screen.getByText("Sell BTC")).toBeInTheDocument();
  });

  it("calculates estimated value correctly", () => {
    mockGetAvailableQuantity.mockReturnValue(10);
    render(<TradeForm symbol="BTC" currentPrice={50000} />);

    const quantityInput = screen.getByLabelText("Quantity");
    fireEvent.change(quantityInput, { target: { value: "2" } });

    expect(screen.getByText("Est. value: $100,000")).toBeInTheDocument();
  });

  it("shows available quantity when selling", () => {
    mockGetAvailableQuantity.mockReturnValue(5.5);
    render(<TradeForm symbol="BTC" currentPrice={50000} />);

    const sellButton = screen.getByText("Sell");
    fireEvent.click(sellButton);

    expect(screen.getByText("5.500")).toBeInTheDocument();
  });

  it("prevents selling more than available quantity", () => {
    mockGetAvailableQuantity.mockReturnValue(1);
    mockCanSell.mockReturnValue(false);

    render(<TradeForm symbol="BTC" currentPrice={50000} />);

    const sellButton = screen.getByText("Sell");
    fireEvent.click(sellButton);

    const quantityInput = screen.getByLabelText("Quantity");
    fireEvent.change(quantityInput, { target: { value: "2" } });

    expect(
      screen.getByText("Insufficient balance. You can only sell 1.000 BTC")
    ).toBeInTheDocument();
    expect(screen.getByText("Short Sell BTC")).toBeDisabled();
  });

  it("submits buy trade with correct data", async () => {
    mockGetAvailableQuantity.mockReturnValue(10);
    mockCanSell.mockReturnValue(true);

    render(<TradeForm symbol="BTC" currentPrice={50000} />);

    const quantityInput = screen.getByLabelText("Quantity");
    fireEvent.change(quantityInput, { target: { value: "0.5" } });

    const submitButton = screen.getByText("Buy BTC");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAddPosition).toHaveBeenCalledWith(
        expect.objectContaining({
          symbol: "BTC",
          side: "buy",
          quantity: 0.5,
          entryPrice: 50000,
          status: "open",
        })
      );
    });

    expect(mockAddTrade).toHaveBeenCalledWith(
      expect.objectContaining({
        symbol: "BTC",
        side: "buy",
        quantity: 0.5,
        price: 50000,
        type: "open",
      })
    );
  });

  it("submits sell trade with correct data when sufficient balance", async () => {
    mockGetAvailableQuantity.mockReturnValue(2);
    mockCanSell.mockReturnValue(true);

    render(<TradeForm symbol="BTC" currentPrice={50000} />);

    const sellButton = screen.getByText("Sell");
    fireEvent.click(sellButton);

    const quantityInput = screen.getByLabelText("Quantity");
    fireEvent.change(quantityInput, { target: { value: "1" } });

    const submitButton = screen.getByText("Sell BTC");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAddPosition).toHaveBeenCalledWith(
        expect.objectContaining({
          symbol: "BTC",
          side: "sell",
          quantity: 1,
          entryPrice: 50000,
          status: "open",
        })
      );
    });

    expect(mockAddTrade).toHaveBeenCalledWith(
      expect.objectContaining({
        symbol: "BTC",
        side: "sell",
        quantity: 1,
        price: 50000,
        type: "open",
      })
    );
  });

  it("does not submit sell trade when insufficient balance", async () => {
    mockGetAvailableQuantity.mockReturnValue(0.5);
    mockCanSell.mockReturnValue(false);

    render(<TradeForm symbol="BTC" currentPrice={50000} />);

    const sellButton = screen.getByText("Sell");
    fireEvent.click(sellButton);

    const quantityInput = screen.getByLabelText("Quantity");
    fireEvent.change(quantityInput, { target: { value: "1" } });

    const submitButton = screen.getByText("Short Sell BTC");
    fireEvent.click(submitButton);

    // Should not call addPosition or addTrade
    expect(mockAddPosition).not.toHaveBeenCalled();
    expect(mockAddTrade).not.toHaveBeenCalled();
  });
});
