# Indonesia Map Frontend

Next.js 16 frontend application for exploring Indonesian administrative regions (Provinsi, Kabupaten, Kecamatan, Desa).

## Features

- 🗺️ **Interactive Maps:** View Indonesia on OpenStreetMap with Leaflet.js
- 📍 **Province Boundaries:** See all provinces with their geographic boundaries
- 🔍 **Search:** Find any region by name across all administrative levels
- 📊 **Detailed Information:** View complete data for provinces, regencies, districts, and villages
- 🌐 **Hierarchical Navigation:** Browse through administrative levels (Provinsi → Kabupaten → Kecamatan → Desa)
- 🗺️ **Individual Maps:** Each wilayah detail page includes its own interactive map
- 📱 **Responsive Design:** Beautiful UI with Tailwind CSS that works on all devices
- ⚡ **Fast Performance:** Built with Next.js 16 App Router and Bun

## Tech Stack

- **Framework:** Next.js 16.1.6 (App Router)
- **Runtime:** Bun
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **HTTP Client:** Axios
- **State Management:** SWR (for data fetching)
- **Map Library:** Leaflet.js 1.9.4 (OpenStreetMap integration)
- **UI Components:** Custom React components

## Prerequisites

- Bun installed (https://bun.sh)
- Backend API running on `http://localhost:8080`

## Installation

```bash
# Install dependencies
bun install
```

## Configuration

Create a `.env.local` file (already created):

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Running the Application

```bash
# Development mode
bun dev

# Build for production
bun run build

# Start production server
bun start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Home page (provinces list)
│   │   ├── map/
│   │   │   └── page.tsx          # Interactive map page with all provinces
│   │   ├── wilayah/[kode]/
│   │   │   └── page.tsx          # Dynamic route for region details with map
│   │   └── layout.tsx            # Root layout
│   ├── components/
│   │   ├── WilayahCard.tsx       # Card component for displaying regions
│   │   ├── MapView.tsx           # Leaflet map component for individual regions
│   │   ├── SearchBar.tsx         # Search component
│   │   ├── Loading.tsx           # Loading spinner
│   │   └── ErrorMessage.tsx      # Error display component
│   ├── lib/
│   │   ├── api.ts                # API client functions
│   │   └── leaflet-icon-fix.ts  # Fix for Leaflet default marker icons
│   └── types/
│       └── wilayah.ts            # TypeScript interfaces
├── public/
└── package.json
```

## API Endpoints Used

The frontend consumes the following API v2 endpoints:

- `GET /api/v2/wilayah/provinsi` - Get all provinces
- `GET /api/v2/wilayah/provinsi/{provinsiKode}/kabupaten` - Get regencies by province
- `GET /api/v2/wilayah/kabupaten/{kabupatenKode}/kecamatan` - Get districts by regency
- `GET /api/v2/wilayah/kecamatan/{kecamatanKode}/desa` - Get villages by district
- `GET /api/v2/wilayah/search?keyword={keyword}` - Search regions
- `GET /api/v2/wilayah/{kode}` - Get region details
- `GET /api/v2/wilayah/{kode}/boundaries` - Get region with boundaries
- `GET /api/v2/wilayah/{kode}/boundary` - Get boundary geometry

## Usage

1. **Browse Provinces:** Visit the home page (`/`) to see all 38 provinces in card format
2. **Interactive Map:** Click "🗺️ Lihat Peta" button to view all provinces on an interactive OpenStreetMap
3. **View Details:** Click on any province card or map marker to see detailed information
4. **Region Maps:** Each region detail page includes an interactive map showing boundaries and location
5. **Navigate Hierarchy:** Continue clicking through to explore: Provinsi → Kabupaten → Kecamatan → Desa
6. **Search:** Use the search bar to find any region by name across all administrative levels
7. **Map Interactions:**
   - Click markers or boundaries to see region information
   - Zoom and pan to explore different areas
   - Popup windows show quick region details
   - Click "Lihat Detail" to navigate to the full detail page

## Development

```bash
# Type checking
bun run type-check

# Linting
bun run lint
```

## Notes

- Make sure the backend Spring Boot application is running on port 8080
- The application uses client-side rendering for dynamic data fetching
- CORS is enabled on the backend for cross-origin requests
