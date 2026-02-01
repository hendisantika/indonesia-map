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
│   │   ├── interactive/
│   │   │   └── page.tsx          # Interactive selector with hierarchical dropdowns
│   │   ├── map/
│   │   │   └── page.tsx          # All provinces map view
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

### Pages Overview

1. **Home Page** (`/`)
   - Browse all 38 provinces in card format
   - Search for any region by name
   - Quick navigation to map views

2. **Interactive Selector Page** (`/interactive`) ⭐ NEW
   - Hierarchical dropdown selectors: Provinsi → Kabupaten → Kecamatan → Desa
   - Real-time boundary visualization on map when region is selected
   - Side panel with detailed region information
   - Statistics panel showing total regions
   - **Same functionality as the Thymeleaf template!**

3. **All Provinces Map** (`/map`)
   - View all provinces on a single interactive map
   - Click markers or boundaries to see information
   - Side panel with selected province details

4. **Region Detail Pages** (`/wilayah/{kode}`)
   - Detailed information about specific region
   - Interactive map with boundaries
   - Navigate to sub-regions

### How to Use

1. **Interactive Selector (Recommended):**
   - Click "🎯 Interactive Map" from home page
   - Select Provinsi from dropdown → boundary appears on map
   - Select Kabupaten → see kabupaten boundary
   - Select Kecamatan → see kecamatan boundary
   - Select Desa/Kelurahan → see desa boundary
   - View details in the side panel

2. **Browse by Cards:**
   - Visit home page to see all provinces
   - Click on any province card to see details
   - Continue navigating through sub-regions

3. **Search:**
   - Use the search bar to find any region by name
   - Works across all administrative levels

4. **Map Interactions:**
   - Click markers or boundaries to see region information
   - Zoom and pan to explore different areas
   - Reset view button to go back to Indonesia view
   - "Tampilkan Provinsi" to show all province markers

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
