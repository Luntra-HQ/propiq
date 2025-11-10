# PropIQ Frontend

React + TypeScript frontend for PropIQ real estate investment analysis platform.

## Tech Stack

- React 18
- TypeScript
- Vite (build tool)
- Playwright (E2E testing)

## Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with backend API URL

# Run development server
npm run dev
```

The app will be available at http://localhost:5173

## Environment Variables

Create a `.env` file:

```bash
VITE_API_BASE=http://localhost:8000
```

For production:
```bash
VITE_API_BASE=https://your-backend.azurewebsites.net
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run unit tests
npm run test:e2e     # Run Playwright E2E tests
npm run lint         # Lint code
```

## Project Structure

```
src/
├── App.tsx          # Main application component
├── main.tsx         # Application entry point
├── index.css        # Global styles
├── components/      # React components
├── config/          # Configuration
└── assets/          # Static assets

public/              # Public static files
tests/               # Playwright E2E tests
```

## Development

### Adding New Features

1. Create component in `src/components/`
2. Import and use in `App.tsx`
3. Add tests in `tests/`
4. Update documentation

### API Integration

The frontend connects to the backend via the `VITE_API_BASE` environment variable.

Example API call:
```typescript
const response = await fetch(`${import.meta.env.VITE_API_BASE}/propiq/analyze`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(propertyData)
});
```

## Testing

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test
npx playwright test tests/full-user-journey.spec.ts

# Run tests in UI mode
npx playwright test --ui

# Generate test report
npx playwright show-report
```

## Build & Deploy

```bash
# Build for production
npm run build

# Output will be in dist/
```

Deploy the `dist/` folder to:
- Vercel
- Netlify
- Azure Static Web Apps
- Cloudflare Pages

## Troubleshooting

**API Connection Issues:**
- Check `VITE_API_BASE` in `.env`
- Verify backend is running
- Check CORS settings in backend

**Build Errors:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

## License

Proprietary - LUNTRA
