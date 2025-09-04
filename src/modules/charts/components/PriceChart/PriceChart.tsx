import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useCandles, usePrices } from "../../../../queries";

type PriceChartProps = {
  symbol: string;
  className?: string;
};

export function PriceChart({ symbol, className = "" }: PriceChartProps) {
  const {
    data: candles,
    isLoading,
    error,
  } = useCandles({
    coin: symbol,
    interval: "1h",
    hoursBack: 24,
  });

  const { data: prices } = usePrices();

  if (isLoading) {
    return (
      <div className={`${className} bg-white dark:bg-gray-800 rounded-lg p-4`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-24"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !candles || candles.length === 0) {
    return (
      <div className={`${className} bg-white dark:bg-gray-800 rounded-lg p-4`}>
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
          {symbol} Chart
        </h3>
        <div className="text-gray-500 dark:text-gray-400 text-sm">
          {error?.message || "No chart data available"}
        </div>
      </div>
    );
  }

  // Transform candle data for Recharts
  const chartData = candles.map((candle) => ({
    time: new Date(candle.t).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    price: parseFloat(candle.c),
    high: parseFloat(candle.h),
    low: parseFloat(candle.l),
    volume: parseFloat(candle.v),
  }));

  // Use current mid price from prices API for consistency
  const currentPrice = prices ? parseFloat(prices[symbol] || "0") : 0;
  const firstPrice = chartData[0]?.price || 0;
  const change = currentPrice - firstPrice;
  const changePercent = firstPrice ? (change / firstPrice) * 100 : 0;
  const isPositive = change >= 0;

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ payload: { price: number; high: number; low: number } }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className="font-mono text-sm text-gray-900 dark:text-white">
            Price: ${data.price.toLocaleString()}
          </p>
          <p className="font-mono text-xs text-gray-500 dark:text-gray-400">
            H: ${data.high.toLocaleString()} L: ${data.low.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`${className} bg-white dark:bg-gray-800 rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900 dark:text-white">{symbol}</h3>
        <div className="text-right">
          <div className="font-mono text-lg text-gray-900 dark:text-white">
            ${currentPrice.toLocaleString()}
          </div>
          <div
            className={`text-sm ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? "+" : ""}${change.toFixed(2)} (
            {changePercent.toFixed(2)}%)
          </div>
        </div>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={["dataMin - 50", "dataMax + 50"]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="price"
              stroke={change >= 0 ? "#10b981" : "#ef4444"}
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                fill: change >= 0 ? "#10b981" : "#ef4444",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        24h chart • {candles.length} hourly candles
      </div>
    </div>
  );
}
