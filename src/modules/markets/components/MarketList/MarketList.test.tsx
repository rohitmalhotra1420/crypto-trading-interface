import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import { MarketList } from "./MarketList";
import { useAssets, usePrices } from "../../../../queries";
import { AssetMeta, MidPrices } from "../../../../types";

// Mock the query hooks
vi.mock("../../../../queries", () => ({
  useAssets: vi.fn(),
  usePrices: vi.fn(),
}));

const mockUseAssets = useAssets as vi.MockedFunction<typeof useAssets>;
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

describe("MarketList", () => {
  const mockOnSelectSymbol = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state", () => {
    mockUseAssets.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      isError: false,
      isSuccess: false,
      isPending: true,
    } as QueryResult<AssetMeta>);

    mockUsePrices.mockReturnValue({
      data: undefined,
      error: null,
      isError: false,
      isSuccess: false,
      isPending: false,
    } as QueryResult<MidPrices>);

    render(<MarketList onSelectSymbol={mockOnSelectSymbol} />, {
      wrapper: createWrapper(),
    });

    // Check for loading skeleton elements (5 divs with animate-pulse class)
    const skeletonElements = screen
      .getAllByRole("generic")
      .filter((el) => el.className.includes("animate-pulse"));
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it("renders assets with prices", () => {
    const mockAssets: AssetMeta = {
      universe: [
        { name: "BTC", szDecimals: 5 },
        { name: "ETH", szDecimals: 4 },
      ],
    };

    const mockPrices: MidPrices = {
      BTC: "50000",
      ETH: "3000",
    };

    mockUseAssets.mockReturnValue({
      data: mockAssets,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      isPending: false,
    } as QueryResult<AssetMeta>);

    mockUsePrices.mockReturnValue({
      data: mockPrices,
      error: null,
      isError: false,
      isSuccess: true,
      isPending: false,
    } as QueryResult<MidPrices>);

    render(<MarketList onSelectSymbol={mockOnSelectSymbol} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("BTC")).toBeInTheDocument();
    expect(screen.getByText("ETH")).toBeInTheDocument();
    expect(screen.getByText("$50,000")).toBeInTheDocument();
    expect(screen.getByText("$3,000")).toBeInTheDocument();
  });

  it("filters assets based on search query", async () => {
    const mockAssets: AssetMeta = {
      universe: [
        { name: "BTC", szDecimals: 5 },
        { name: "ETH", szDecimals: 4 },
        { name: "ADA", szDecimals: 6 },
      ],
    };

    mockUseAssets.mockReturnValue({
      data: mockAssets,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      isPending: false,
    } as QueryResult<AssetMeta>);

    mockUsePrices.mockReturnValue({
      data: {},
      error: null,
      isError: false,
      isSuccess: true,
      isPending: false,
    } as QueryResult<MidPrices>);

    render(<MarketList onSelectSymbol={mockOnSelectSymbol} />, {
      wrapper: createWrapper(),
    });

    const searchInput = screen.getByPlaceholderText("Search assets...");
    fireEvent.change(searchInput, { target: { value: "BTC" } });

    expect(screen.getByText("BTC")).toBeInTheDocument();
    expect(screen.queryByText("ETH")).not.toBeInTheDocument();
    expect(screen.queryByText("ADA")).not.toBeInTheDocument();
  });

  it("calls onSelectSymbol when asset is clicked", () => {
    const mockAssets: AssetMeta = {
      universe: [{ name: "BTC", szDecimals: 5 }],
    };

    mockUseAssets.mockReturnValue({
      data: mockAssets,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      isPending: false,
    } as QueryResult<AssetMeta>);

    mockUsePrices.mockReturnValue({
      data: {},
      error: null,
      isError: false,
      isSuccess: true,
      isPending: false,
    } as QueryResult<MidPrices>);

    render(<MarketList onSelectSymbol={mockOnSelectSymbol} />, {
      wrapper: createWrapper(),
    });

    fireEvent.click(screen.getByText("BTC"));
    expect(mockOnSelectSymbol).toHaveBeenCalledWith("BTC");
  });
});
