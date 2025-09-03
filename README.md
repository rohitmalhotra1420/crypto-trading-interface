# Paper Trader

A professional crypto paper trading interface built with React, TypeScript, and modern state management. Practice trading with real-time data from Hyperliquid without risking actual funds.

## Setup & Scripts

```bash
npm install
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview build locally
npm run test     # Run unit tests
npm run test:ui  # Run tests with UI
```

## Features

- **Real-time market data** from Hyperliquid API with React Query caching and error handling
- **Asset selection** with search and live price updates
- **Paper trading** simulation with buy/sell positions
- **Live PnL tracking** with automatic calculations using Zustand state management
- **Trade history** with persistent localStorage
- **Price charts** using lightweight SVG sparklines
- **Theme system** with light/dark/system modes and proper persistence
- **Responsive design** with mobile-first approach and accessible UI
- **Unit testing** with React Testing Library and Vitest

## Architecture

Built as a production-ready SPA following enterprise React patterns. The codebase uses a feature-based modular architecture:

### Folder Structure
- `src/commons/` - Shared components, utilities, stores, and constants
- `src/modules/` - Feature-specific modules (markets, trading, positions, charts)
- `src/queries/` - React Query hooks and API layer
- `src/types/` - Global TypeScript type definitions

### State Management
- **React Query** for server state, caching, and real-time updates with intelligent polling
- **Zustand** for client state (positions, trades, selected symbol, theme)
- **localStorage** persistence with versioned data format for easy migration

### Key Decisions
- **React Query over polling**: Automatic retry logic, caching, and optimistic updates
- **Zustand over Redux**: Simpler API with built-in persistence and TypeScript support
- **Feature modules**: Each domain (markets, trading, positions) is self-contained
- **Type-first approach**: All API responses and state are strongly typed
- **CSS-in-JS avoided**: Clean Tailwind classes for maintainable styling

## Real-time Strategy

The app uses React Query's `refetchInterval` for live price updates every 1.5 seconds. This approach provides:
- Automatic retry with exponential backoff on failures
- Intelligent caching to reduce unnecessary API calls
- Background refetching when the window regains focus
- Optimistic updates for better perceived performance

## Data Persistence

All trading data persists to localStorage with a versioned schema:
- Positions and trades are stored separately for efficient updates
- Theme preferences persist across sessions
- Selected symbol state maintains user context
- Automatic migration support for future schema changes

## Testing Strategy

Unit tests focus on critical business logic:
- Position PnL calculations and state updates
- Asset filtering and search functionality
- Trade form validation and submission
- Theme switching and persistence

## Limitations

- Paper trading only (no real money or order routing)
- 24-hour candle history due to API constraints  
- No advanced order types (market orders only)
- Single-user experience (no accounts or sharing)

## If More Time

- WebSocket integration for sub-second price updates
- Advanced charting with technical indicators and multiple timeframes
- Portfolio performance analytics with profit/loss charts
- Order book depth visualization and market microstructure
- Export trade history to CSV with detailed reporting
- Mobile app using React Native with offline support
- Advanced order types (limit, stop-loss, take-profit)
- Risk management tools and position sizing calculators
- Integration with multiple exchanges for price comparison
- Real-time alerts and notifications for price movements