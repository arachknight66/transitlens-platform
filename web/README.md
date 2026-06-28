# TransitLens Web

Next.js 14 frontend for the TransitLens exoplanet detection platform.

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
cd web
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building

```bash
npm run build
npm start
```

## Project Structure

- `app/` - Next.js App Router pages
- `components/` - Reusable React components
- `lib/` - Utilities, API client, store, configuration
- `types/` - TypeScript interfaces
- `public/demo_data/` - Static demo data for offline mode

## Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Technologies

- **Next.js 14** - React framework
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **Zustand** - State management
- **TypeScript** - Type safety

## API Integration

The app communicates with the FastAPI backend at `NEXT_PUBLIC_API_URL`:

- `POST /analyze` - Run analysis with time/flux arrays
- `POST /analyze/stream` - Stream analysis progress via SSE
- `GET /health` - Health check
- Static demo data in `/public/demo_data/` for offline fallback
