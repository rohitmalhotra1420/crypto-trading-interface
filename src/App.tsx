import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "./commons/components";
import { MarketList } from "./modules/markets";
import { TradeForm } from "./modules/trading";
import { PositionsTable, TradeHistory } from "./modules/positions";
import { PriceChart } from "./modules/charts";
import { usePrices } from "./queries";
import { useTradingStore, useThemeStore, applyTheme } from "./commons/stores";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      refetchOnWindowFocus: false,
    },
  },
});

function TradingApp() {
  const { selectedSymbol, setSelectedSymbol } = useTradingStore();
  const { data: prices } = usePrices();

  const currentPrice = prices ? parseFloat(prices[selectedSymbol] || "0") : 0;

  const sidebar = (
    <MarketList
      selectedSymbol={selectedSymbol}
      onSelectSymbol={setSelectedSymbol}
    />
  );

  return (
    <Layout sidebar={sidebar}>
      <div className="space-y-6">
        {/* Chart and Trade Form */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <PriceChart symbol={selectedSymbol} />
          </div>
          <div>
            {currentPrice > 0 && (
              <TradeForm symbol={selectedSymbol} currentPrice={currentPrice} />
            )}
          </div>
        </div>

        {/* Positions */}
        <PositionsTable />

        {/* History */}
        <TradeHistory />
      </div>
    </Layout>
  );
}

function ThemeProvider() {
  const { theme } = useThemeStore();

  useEffect(() => {
    applyTheme();
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        applyTheme();
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider />
      <TradingApp />
    </QueryClientProvider>
  );
}

export default App;
