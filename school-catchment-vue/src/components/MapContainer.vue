<template>
  <div id="map" class="map-container"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet.locatecontrol'
import * as topojson from 'topojson-client'
import { useMapStore } from '../stores/mapStore'
import type { Feature, FeatureCollection } from 'geojson'

const mapStore = useMapStore()

const CONFIG = {
  map: {
    center: [49.624889, -116.962890] as [number, number],
    zoom: 8
  },
  data: {
    schools: '/data/schools.geojson',
    catchments: '/data/catchment_sd8_2023.topojson'
  }
}

// Custom school icon
const schoolIcon = L.icon({
  iconUrl: '/images/school.png',
  iconSize: [32, 37],
  iconAnchor: [15, 35],
  popupAnchor: [1, -30]
})

// TopoJSON Layer Extension
const TopoJSONLayer = L.GeoJSON.extend({
  addData: function (jsonData: any) {
    if (jsonData.type === 'Topology') {
      for (const key in jsonData.objects) {
        const geojson: any = topojson.feature(jsonData, jsonData.objects[key])
        L.GeoJSON.prototype.addData.call(this, geojson)
      }
    } else {
      L.GeoJSON.prototype.addData.call(this, jsonData)
    }
  }
})

/**
 * Initialize the Leaflet map
 */
function initializeMap() {
  const map = L.map('map').setView(CONFIG.map.center, CONFIG.map.zoom)

  // Add tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map)

  // Add locate control
  // @ts-ignore - leaflet.locatecontrol types
  L.control.locate({
    position: 'topleft',
    drawCircle: false,
    setView: true,
    keepCurrentZoomLevel: false,
    strings: {
      title: 'Show my location'
    }
  }).addTo(map)

  // Initialize geocode results layer
  const geocodeResultsLayer = L.layerGroup().addTo(map)
  mapStore.setGeocodeResults(geocodeResultsLayer)
  mapStore.setMap(map)
}

/**
 * Load and display school markers
 */
async function loadSchools() {
  try {
    const response = await fetch(CONFIG.data.schools)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: FeatureCollection = await response.json()

    // Initialize marker cluster group
    const markers = L.markerClusterGroup({
      showCoverageOnHover: false
    })

    // Create school layer
    const schoolLayer = L.geoJSON(data, {
      pointToLayer: (_feature, latlng) => {
        return L.marker(latlng, { icon: schoolIcon })
      },
      onEachFeature: (feature, featureLayer) => {
        const popupContent = `<b>${feature.properties?.SCHOOL_NAM}</b><br>${feature.properties?.SCHOOL_PHY}`
        featureLayer.bindPopup(popupContent)
      }
    })

    markers.addLayer(schoolLayer)
    mapStore.map?.addLayer(markers)
    mapStore.map?.fitBounds(markers.getBounds())
    mapStore.setSchoolMarkers(markers)
  } catch (error) {
    console.error('Error loading schools:', error)
    alert('Failed to load school data. Please refresh the page.')
  }
}

/**
 * Style function for TopoJSON polygons
 */
function getFeatureStyle(feature: Feature) {
  return {
    color: feature.properties?.stroke || '#3388ff',
    fillColor: feature.properties?.fill || '#3388ff',
    weight: 2,
    opacity: 0.8,
    fillOpacity: 0.3
  }
}

/**
 * Filter function for catchment layer
 */
function filterCatchments(feature: Feature) {
  const isCatchmentChecked = mapStore.checkboxStates.catchments.includes(feature.properties?.SCHOOL || '')
  const isBoundaryChecked = mapStore.checkboxStates.boundaries.includes(feature.properties?.Name || '')
  return isCatchmentChecked || isBoundaryChecked
}

/**
 * Load and display catchment boundaries
 */
async function loadCatchments() {
  try {
    const response = await fetch(CONFIG.data.catchments)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    mapStore.setCatchmentData(data)

    // Create catchment layer
    // @ts-ignore - TopoJSON custom layer
    const layer = new TopoJSONLayer(null, {
      filter: filterCatchments,
      onEachFeature: (feature: Feature, featureLayer: any) => {
        let popupContent = ''
        if (feature.properties?.CATCHMENT) {
          popupContent = `<b>Catchment:</b> ${feature.properties.CATCHMENT}<br><b>School:</b> ${feature.properties.SCHOOL}`
        } else if (feature.properties?.Name) {
          popupContent = feature.properties.Name
        }
        if (popupContent) {
          featureLayer.bindPopup(popupContent)
        }
      },
      style: getFeatureStyle
    }).addTo(mapStore.map!)

    layer.addData(data)
    mapStore.setCatchmentLayer(layer)
  } catch (error) {
    console.error('Error loading catchments:', error)
    alert('Failed to load catchment data. Please refresh the page.')
  }
}

/**
 * Refresh catchment layer based on checkbox states
 */
function refreshCatchmentLayer() {
  if (!mapStore.catchmentLayer || !mapStore.catchmentData || !mapStore.map) return

  // Remove existing layer
  mapStore.map.removeLayer(mapStore.catchmentLayer)

  // Create new layer with updated filters
  // @ts-ignore - TopoJSON custom layer
  const layer = new TopoJSONLayer(null, {
    filter: filterCatchments,
    onEachFeature: (feature: Feature, featureLayer: any) => {
      let popupContent = ''
      if (feature.properties?.CATCHMENT) {
        popupContent = `<b>Catchment:</b> ${feature.properties.CATCHMENT}<br><b>School:</b> ${feature.properties.SCHOOL}`
      } else if (feature.properties?.Name) {
        popupContent = feature.properties.Name
      }
      if (popupContent) {
        featureLayer.bindPopup(popupContent)
      }
    },
    style: getFeatureStyle
  }).addTo(mapStore.map)

  layer.addData(mapStore.catchmentData)
  mapStore.setCatchmentLayer(layer)

  // Fit bounds if layer has valid bounds
  if (layer.getBounds && layer.getBounds().isValid()) {
    mapStore.map.fitBounds(layer.getBounds())
  }
}

// Watch checkbox states and refresh layer when they change
watch(
  () => mapStore.checkboxStates,
  () => {
    refreshCatchmentLayer()
  },
  { deep: true }
)

// Initialize map when component is mounted
onMounted(async () => {
  initializeMap()
  await Promise.all([loadSchools(), loadCatchments()])
  console.log('Map initialized successfully')
})

// Cleanup when component is unmounted
onUnmounted(() => {
  if (mapStore.map) {
    mapStore.map.remove()
  }
})
</script>

<style scoped>
.map-container {
  height: 100%;
  width: 100%;
}
</style>
