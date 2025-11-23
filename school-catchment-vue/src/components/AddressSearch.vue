<template>
  <div class="address-search">
    <div class="search-input-group">
      <AutoComplete
        v-model="searchQuery"
        :suggestions="suggestions"
        @complete="searchAddress"
        @item-select="onSelectSuggestion"
        @keydown="handleKeydown"
        placeholder="Enter a civic address"
        :minLength="3"
        :delay="300"
        optionLabel="fullAddress"
        class="search-input"
        inputClass="search-field"
      >
        <template #option="slotProps">
          <div class="autocomplete-option">
            {{ slotProps.option.fullAddress }}
          </div>
        </template>
      </AutoComplete>
      <Button
        icon="pi pi-search"
        @click="geocode"
        class="search-button"
        aria-label="Search"
        title="Search"
      />
      <Button
        icon="pi pi-times"
        @click="clearSearch"
        class="search-button"
        aria-label="Clear"
        title="Clear"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import L from 'leaflet'
import { useMapStore } from '../stores/mapStore'

const mapStore = useMapStore()

const CONFIG = {
  geocoder: {
    apiUrl: 'https://geocoder.api.gov.bc.ca/',
    minScore: 50,
    maxResults: 3,
    minLength: 3
  }
}

const searchQuery = ref('')
const suggestions = ref<any[]>([])

interface GeocoderFeature {
  properties: {
    fullAddress: string
    [key: string]: any
  }
  geometry: {
    coordinates: [number, number]
  }
}

/**
 * Fetch autocomplete suggestions
 */
async function searchAddress(event: any) {
  const searchTerm = event.query

  if (!searchTerm || searchTerm.length < CONFIG.geocoder.minLength) {
    suggestions.value = []
    return
  }

  const params = new URLSearchParams({
    minScore: CONFIG.geocoder.minScore.toString(),
    maxResults: CONFIG.geocoder.maxResults.toString(),
    echo: 'false',
    brief: 'true',
    autoComplete: 'true',
    addressString: searchTerm
  })

  try {
    const response = await fetch(`${CONFIG.geocoder.apiUrl}addresses.json?${params}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    suggestions.value = (data.features || []).map((feature: any) => ({
      fullAddress: feature.properties.fullAddress,
      coordinates: feature.geometry.coordinates
    }))
  } catch (error) {
    console.error('Autocomplete error:', error)
    suggestions.value = []
  }
}

/**
 * Handle suggestion selection
 */
function onSelectSuggestion(event: any) {
  const selected = event.value
  if (selected && selected.coordinates) {
    placeMarker(selected.fullAddress, selected.coordinates)
  }
}

/**
 * Geocode the entered address
 */
async function geocode() {
  const address = typeof searchQuery.value === 'string' ? searchQuery.value : (searchQuery.value as any)?.fullAddress

  if (!address || address.trim() === '') return

  const url = `${CONFIG.geocoder.apiUrl}addresses.json?addressString=${encodeURIComponent(address)}&minScore=80&maxResults=1`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data.features && data.features.length > 0) {
      const feature: GeocoderFeature = data.features[0]
      placeMarker(feature.properties.fullAddress, feature.geometry.coordinates)
    } else {
      alert('Address not found. Please try a different address.')
    }
  } catch (error) {
    console.error('Geocoding error:', error)
    alert('An error occurred during geocoding. Please try again.')
  }
}

/**
 * Place marker on map
 */
function placeMarker(address: string, coordinates: [number, number]) {
  if (!mapStore.map || !mapStore.geocodeResults) return

  mapStore.geocodeResults.clearLayers()

  const latlng = L.latLng(coordinates[1], coordinates[0])
  const marker = L.marker(latlng).addTo(mapStore.map as any)
  marker.bindPopup(address).openPopup()
  mapStore.geocodeResults.addLayer(marker)
  mapStore.map.setView(latlng, 13)
}

/**
 * Clear search
 */
function clearSearch() {
  searchQuery.value = ''
  suggestions.value = []
  if (mapStore.geocodeResults) {
    mapStore.geocodeResults.clearLayers()
  }
}

/**
 * Handle keyboard events
 */
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    geocode()
  } else if (event.key === 'Escape') {
    clearSearch()
  }
}
</script>

<style scoped>
.address-search {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  width: 90%;
  max-width: 400px;
}

.search-input-group {
  display: flex;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  overflow: hidden;
}

:deep(.search-input) {
  flex: 1;
}

:deep(.search-field) {
  border-radius: 4px 0 0 4px !important;
  border-right: none !important;
}

.search-button {
  border-radius: 0 !important;
  border-left: 1px solid #ced4da !important;
}

.search-button:last-child {
  border-radius: 0 4px 4px 0 !important;
}

.autocomplete-option {
  padding: 0.5rem;
  font-size: 0.9rem;
}

@media (max-width: 576px) {
  .address-search {
    width: 95%;
    max-width: none;
  }
}

@media (min-width: 768px) {
  .address-search {
    width: 400px;
  }
}
</style>
