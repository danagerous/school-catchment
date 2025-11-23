<template>
  <div class="app-container">
    <NavigationBar @toggle-filters="showFilters = true" @toggle-about="showAbout = true" />

    <div class="map-wrapper">
      <MapContainer />
      <AddressSearch />
    </div>

    <FilterMenu v-model:visible="showFilters" />
    <AboutModal v-model:visible="showAbout" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import NavigationBar from './components/NavigationBar.vue'
import MapContainer from './components/MapContainer.vue'
import AddressSearch from './components/AddressSearch.vue'
import FilterMenu from './components/FilterMenu.vue'
import AboutModal from './components/AboutModal.vue'

const showFilters = ref(false)
const showAbout = ref(false)
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif;
}

.app-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.map-wrapper {
  position: absolute;
  top: 70px;
  bottom: 45px;
  left: 0;
  right: 0;
}

/* Leaflet control positioning */
:deep(.leaflet-top.leaflet-left) {
  margin-top: 60px;
}

:deep(.leaflet-bottom.leaflet-left) {
  margin-bottom: 50px;
  margin-left: 10px;
}

/* Leaflet popup styling */
:deep(.leaflet-popup-content) {
  margin: 13px 19px;
  line-height: 1.4;
}

:deep(.leaflet-popup-content b) {
  font-weight: 600;
}

/* Marker cluster styling */
:deep(.marker-cluster-small),
:deep(.marker-cluster-medium),
:deep(.marker-cluster-large) {
  background-color: rgba(51, 136, 255, 0.6);
}

:deep(.marker-cluster-small div),
:deep(.marker-cluster-medium div),
:deep(.marker-cluster-large div) {
  background-color: rgba(51, 136, 255, 0.8);
  color: white;
  font-weight: bold;
}

/* Print styles */
@media print {
  .navbar-top,
  .navbar-bottom,
  .address-search {
    display: none !important;
  }

  .map-wrapper {
    top: 0 !important;
    bottom: 0 !important;
  }
}
</style>
