# School Catchment Map - Vue.js Edition

A modern Vue.js 3 rewrite of the School Catchment Map application for Kootenay Lake School District 8. This interactive map allows users to explore school catchment areas and administrative boundaries in the region.

## Technology Stack

- **Vue 3** - Progressive JavaScript framework with Composition API
- **TypeScript** - Type-safe development
- **Vite** - Next-generation build tool
- **Pinia** - State management library
- **PrimeVue** - Vue UI component library
- **Leaflet** - Interactive mapping library
- **Leaflet Plugins**:
  - MarkerCluster - Marker clustering
  - LocateControl - Geolocation control
- **TopoJSON** - Efficient boundary data format

## Features

- Interactive map with zoom/pan controls
- School location markers with clustering
- 51 toggleable boundary layers:
  - School catchment areas (29 schools)
  - Administrative boundaries (22 areas)
- Address search with autocomplete (BC Government Geocoder API)
- Geolocation support
- Responsive design (mobile & desktop)
- Filter reset functionality
- Print-friendly styling

## Project Structure

```
school-catchment-vue/
├── public/
│   ├── data/
│   │   ├── schools.geojson
│   │   └── catchment_sd8_2023.topojson
│   └── images/
│       ├── logo_sd8.png
│       ├── icon_sd8.png
│       └── school.png
├── src/
│   ├── components/
│   │   ├── MapContainer.vue        # Main Leaflet map
│   │   ├── FilterMenu.vue          # Sidebar filter menu
│   │   ├── AddressSearch.vue       # Geocoding search
│   │   ├── NavigationBar.vue       # Top/bottom navigation
│   │   └── AboutModal.vue          # About dialog
│   ├── stores/
│   │   └── mapStore.ts             # Pinia state management
│   ├── App.vue                     # Root component
│   └── main.ts                     # Application entry point
├── index.html
├── package.json
└── vite.config.ts
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Navigate to the project directory:
   ```bash
   cd school-catchment-vue
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to the URL shown (typically http://localhost:5173)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready to deploy to any static hosting service.

### Preview Production Build

```bash
npm run preview
```

## Key Improvements Over Original

1. **Modern Framework** - Vue 3 with Composition API for better code organization
2. **Type Safety** - TypeScript for catching errors at compile time
3. **Reactive State** - Pinia for centralized, reactive state management
4. **Component-Based** - Modular, reusable components
5. **Build Optimization** - Vite for fast development and optimized production builds
6. **Better Developer Experience** - Hot module replacement, TypeScript IntelliSense
7. **Professional UI** - PrimeVue components for consistent, accessible UI

## Component Overview

### MapContainer.vue
- Initializes Leaflet map
- Loads school markers and catchment boundaries
- Handles map interactions
- Watches for filter changes and updates layers reactively

### FilterMenu.vue
- PrimeVue Sidebar component
- 51 filter checkboxes organized by region
- School visibility toggle
- Reset functionality

### AddressSearch.vue
- PrimeVue AutoComplete component
- BC Government Geocoder API integration
- Debounced autocomplete (300ms)
- Keyboard navigation support

### NavigationBar.vue
- Top navigation with logo and filter button
- Bottom navigation with about button
- Responsive design

### AboutModal.vue
- PrimeVue Dialog component
- Application metadata and data sources
- Links to external resources

## State Management

The application uses Pinia for centralized state management:

- **map** - Leaflet map instance
- **schoolMarkers** - School marker cluster group
- **catchmentLayer** - TopoJSON boundary layer
- **geocodeResults** - Geocoding result markers
- **catchmentData** - Cached TopoJSON data
- **checkboxStates** - Selected catchment and boundary filters

## Browser Support

- Modern browsers with ES2015+ support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

See LICENSE file in parent directory.

## Credits

**Original Application:** Dana Diotte
**Vue.js Migration:** AI-assisted conversion to modern Vue.js 3 stack

**Data Sources:**
- School District 8, Kootenay Lake
- DataBC (BC Government)
- BC Stats
- Regional District of Central Kootenay (RDCK)

## Links

- [Original Application](https://www.sd8.bc.ca/catchments/)
- [School District 8](https://www.sd8.bc.ca/)
- [DataBC](https://www.data.gov.bc.ca/)
- [GitHub Repository](https://github.com/danagerous/school-catchment)
