<template>
  <Sidebar v-model:visible="isVisible" position="right" class="filter-sidebar" header="Map Filters">
    <div class="filter-content">
      <!-- Schools -->
      <h6 class="filter-heading">Schools</h6>
      <div class="filter-item">
        <Checkbox v-model="showSchools" :binary="true" inputId="schools" @change="toggleSchools" />
        <label for="schools" class="filter-label">School Locations</label>
      </div>

      <!-- Catchment Boundaries -->
      <h6 class="filter-heading mt-3">Catchment Boundaries</h6>

      <!-- Slocan Valley -->
      <div class="filter-group">
        <strong class="group-label">Slocan Valley</strong>
        <div v-for="school in slocanValley" :key="school.id" class="filter-item">
          <Checkbox
            v-model="selectedCatchments"
            :inputId="school.id"
            :value="school.value"
            @change="updateCatchments"
          />
          <label :for="school.id" class="filter-label">{{ school.label }}</label>
        </div>
      </div>

      <!-- Nelson -->
      <div class="filter-group">
        <strong class="group-label">Nelson</strong>
        <div v-for="school in nelson" :key="school.id" class="filter-item">
          <Checkbox
            v-model="selectedCatchments"
            :inputId="school.id"
            :value="school.value"
            @change="updateCatchments"
          />
          <label :for="school.id" class="filter-label">{{ school.label }}</label>
        </div>
      </div>

      <!-- Kaslo and Meadow Creek -->
      <div class="filter-group">
        <strong class="group-label">Kaslo and Meadow Creek</strong>
        <div v-for="school in kasloMeadowCreek" :key="school.id" class="filter-item">
          <Checkbox
            v-model="selectedCatchments"
            :inputId="school.id"
            :value="school.value"
            @change="updateCatchments"
          />
          <label :for="school.id" class="filter-label">{{ school.label }}</label>
        </div>
      </div>

      <!-- Salmo -->
      <div class="filter-group">
        <strong class="group-label">Salmo</strong>
        <div v-for="school in salmo" :key="school.id" class="filter-item">
          <Checkbox
            v-model="selectedCatchments"
            :inputId="school.id"
            :value="school.value"
            @change="updateCatchments"
          />
          <label :for="school.id" class="filter-label">{{ school.label }}</label>
        </div>
      </div>

      <!-- Creston and Crawford Bay -->
      <div class="filter-group">
        <strong class="group-label">Creston and Crawford Bay</strong>
        <div v-for="school in crestonCrawfordBay" :key="school.id" class="filter-item">
          <Checkbox
            v-model="selectedCatchments"
            :inputId="school.id"
            :value="school.value"
            @change="updateCatchments"
          />
          <label :for="school.id" class="filter-label">{{ school.label }}</label>
        </div>
      </div>

      <!-- Administrative Boundaries -->
      <h6 class="filter-heading mt-3">Administrative Boundaries</h6>
      <div v-for="boundary in administrativeBoundaries" :key="boundary.id" class="filter-item">
        <Checkbox
          v-model="selectedBoundaries"
          :inputId="boundary.id"
          :value="boundary.value"
          @change="updateBoundaries"
        />
        <label :for="boundary.id" class="filter-label">{{ boundary.label }}</label>
      </div>

      <!-- Regional Districts -->
      <div class="filter-group">
        <strong class="group-label">Regional Districts</strong>
        <div v-for="district in regionalDistricts" :key="district.id" class="filter-item">
          <Checkbox
            v-model="selectedBoundaries"
            :inputId="district.id"
            :value="district.value"
            @change="updateBoundaries"
          />
          <label :for="district.id" class="filter-label">{{ district.label }}</label>
        </div>
      </div>

      <!-- SD 8 Trustee Electoral Areas -->
      <div class="filter-group">
        <strong class="group-label">SD 8 Trustee Electoral Areas</strong>
        <div v-for="area in trusteeAreas" :key="area.id" class="filter-item">
          <Checkbox
            v-model="selectedBoundaries"
            :inputId="area.id"
            :value="area.value"
            @change="updateBoundaries"
          />
          <label :for="area.id" class="filter-label">{{ area.label }}</label>
        </div>
      </div>

      <!-- RDCK Electoral Areas -->
      <div class="filter-group">
        <strong class="group-label">RDCK Electoral Areas</strong>
        <div v-for="area in rdckAreas" :key="area.id" class="filter-item">
          <Checkbox
            v-model="selectedBoundaries"
            :inputId="area.id"
            :value="area.value"
            @change="updateBoundaries"
          />
          <label :for="area.id" class="filter-label">{{ area.label }}</label>
        </div>
      </div>

      <!-- Communities -->
      <div class="filter-group">
        <strong class="group-label">Communities</strong>
        <div v-for="community in communities" :key="community.id" class="filter-item">
          <Checkbox
            v-model="selectedBoundaries"
            :inputId="community.id"
            :value="community.value"
            @change="updateBoundaries"
          />
          <label :for="community.id" class="filter-label">{{ community.label }}</label>
        </div>
      </div>

      <!-- Reset Button -->
      <div class="mt-4">
        <Button
          label="Reset Map"
          icon="pi pi-refresh"
          @click="resetMap"
          class="w-full"
          outlined
        />
      </div>
    </div>
  </Sidebar>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMapStore } from '../stores/mapStore'

const mapStore = useMapStore()

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const showSchools = ref(true)
const selectedCatchments = ref<string[]>([])
const selectedBoundaries = ref<string[]>([])

// School data
const slocanValley = [
  { id: 'brent-kennedy', label: 'Brent Kennedy', value: 'Brent Kenney k-6' },
  { id: 'mount-sentinel-middle', label: 'Mount Sentinel Middle', value: 'Mount Sentinel 7-9' },
  { id: 'mount-sentinel-secondary', label: 'Mount Sentinel Secondary', value: 'Mount Sentinel 9-12' },
  { id: 'we-graham-elementary', label: 'W.E. Graham Community Elementary', value: 'W.E. Graham Community k-6' },
  { id: 'we-graham-secondary', label: 'W.E. Graham Community Secondary', value: 'W.E. Graham Community 7-10' },
  { id: 'winlaw-elementary', label: 'Winlaw Elementary', value: 'Winlaw Elementary' }
]

const nelson = [
  { id: 'blewett-elementary', label: 'Blewett Elementary', value: 'Blewett Elementary' },
  { id: 'hume-elementary', label: 'Hume Elementary', value: 'Hume Elementary k-5' },
  { id: 'lv-rogers-secondary', label: 'LV Rogers Secondary', value: 'LV Rogers Secondary' },
  { id: 'redfish-elementary', label: 'Redfish Elementary', value: 'Redfish Elementary' },
  { id: 'rosemont-elementary', label: 'Rosemont Elementary', value: 'Rosemont Elementary' },
  { id: 'south-nelson-elementary', label: 'South Nelson Elementary', value: 'South Nelson Elementary' },
  { id: 'trafalgar-middle', label: 'Trafalgar Middle School', value: 'Trafalgar Middle School' },
  { id: 'wildflower-nelson', label: 'Wildflower Elementary Nelson', value: 'Wildflower Nelson' }
]

const kasloMeadowCreek = [
  { id: 'jewett-elementary', label: 'Jewett Elementary', value: 'Jewett Elementary' },
  { id: 'jv-humphries-elementary', label: 'JV Humphries Elementary', value: 'JV Humphries Elementary' },
  { id: 'jv-humphries-secondary', label: 'JV Humphries Secondary', value: 'JV Humphries Secondary' }
]

const salmo = [
  { id: 'salmo-elementary', label: 'Salmo Elementary', value: 'Salmo Elementary' },
  { id: 'salmo-secondary', label: 'Salmo Secondary', value: 'Salmo Secondary' }
]

const crestonCrawfordBay = [
  { id: 'adam-robertson', label: 'Adam Robertson Elementary', value: 'Adam Robertson Elementary' },
  { id: 'canyon-lister', label: 'Canyon-Lister Elementary', value: 'Canyon-Lister Elementary' },
  { id: 'crawford-bay', label: 'Crawford Bay Elementary/Secondary', value: 'Crawford Bay Elementary Secondary' },
  { id: 'erickson-elementary', label: 'Erickson Elementary', value: 'Erickson Elementary' },
  { id: 'kootenay-river-secondary', label: 'Kootenay River Secondary', value: 'Kootenay River Secondary' },
  { id: 'wildflower-creston', label: 'Wildflower Elementary Creston', value: 'Wildflower Creston' }
]

const administrativeBoundaries = [
  { id: 'sd8-boundary', label: 'SD8 District Boundary', value: 'Kootenay Lake School District 8' },
  { id: 'lower-kootenay-band', label: 'Lower Kootenay Band', value: 'Lower Kootenay Band' }
]

const regionalDistricts = [
  { id: 'central-kootenay', label: 'Central Kootenay', value: 'Regional District of Central Kootenay' },
  { id: 'columbia-shuswap', label: 'Columbia Shuswap', value: 'Columbia Shuswap Regional District' },
  { id: 'east-kootenay', label: 'East Kootenay', value: 'Regional District of East Kootenay' },
  { id: 'kootenay-boundary', label: 'Kootenay Boundary', value: 'Kootenay Boundary Regional District' }
]

const trusteeAreas = [
  { id: 'trustee-area-1', label: 'Trustee Electoral Area 1', value: 'SD 8  Trustee Electoral Area 1' },
  { id: 'trustee-area-2', label: 'Trustee Electoral Area 2', value: 'SD 8  Trustee Electoral Area 2' },
  { id: 'trustee-area-3', label: 'Trustee Electoral Area 3', value: 'SD 8  Trustee Electoral Area 3' },
  { id: 'trustee-area-4', label: 'Trustee Electoral Area 4', value: 'SD 8  Trustee Electoral Area 4' },
  { id: 'trustee-area-5', label: 'Trustee Electoral Area 5', value: 'SD 8  Trustee Electoral Area 5' },
  { id: 'trustee-area-6', label: 'Trustee Electoral Area 6', value: 'SD 8  Trustee Electoral Area 6' },
  { id: 'trustee-area-7', label: 'Trustee Electoral Area 7', value: 'SD 8  Trustee Electoral Area 7' }
]

const rdckAreas = [
  { id: 'rdck-area-a', label: 'RDCK Electoral Area A', value: 'RDCK Electoral Area A (Wynndel / East Shore Kootenay Lake)' },
  { id: 'rdck-area-b', label: 'RDCK Electoral Area B', value: 'RDCK Electoral Area B' },
  { id: 'rdck-area-c', label: 'RDCK Electoral Area C', value: 'RDCK Electoral Area C' },
  { id: 'rdck-area-d', label: 'RDCK Electoral Area D', value: 'RDCK Electoral Area D' },
  { id: 'rdck-area-e', label: 'RDCK Electoral Area E', value: 'RDCK Electoral Area E' },
  { id: 'rdck-area-f', label: 'RDCK Electoral Area F', value: 'RDCK Electoral Area F' },
  { id: 'rdck-area-g', label: 'RDCK Electoral Area G', value: 'RDCK Electoral Area G' },
  { id: 'rdck-area-h', label: 'RDCK Electoral Area H', value: 'RDCK Electoral Area H (The Slocan Valley)' },
  { id: 'rdck-area-i', label: 'RDCK Electoral Area I', value: 'RDCK Electoral Area I' },
  { id: 'rdck-area-j', label: 'RDCK Electoral Area J', value: 'RDCK Electoral Area J (Lower Arrow / Columbia)' },
  { id: 'rdck-area-k', label: 'RDCK Electoral Area K', value: 'RDCK Electoral Area K (The Arrow Lakes)' }
]

const communities = [
  { id: 'creston', label: 'Creston', value: 'Creston' },
  { id: 'kaslo', label: 'Kaslo', value: 'Kalso' },
  { id: 'nelson', label: 'Nelson', value: 'Nelson' },
  { id: 'salmo-community', label: 'Salmo', value: 'Salmo' },
  { id: 'slocan', label: 'Slocan', value: 'Slocan' }
]

function toggleSchools() {
  if (!mapStore.map || !mapStore.schoolMarkers) return

  if (showSchools.value) {
    mapStore.map.addLayer(mapStore.schoolMarkers)
    mapStore.map.fitBounds(mapStore.schoolMarkers.getBounds())
  } else {
    mapStore.map.removeLayer(mapStore.schoolMarkers)
  }
}

function updateCatchments() {
  mapStore.updateCheckboxStates({ catchments: selectedCatchments.value })
}

function updateBoundaries() {
  mapStore.updateCheckboxStates({ boundaries: selectedBoundaries.value })
}

function resetMap() {
  // Clear selections
  selectedCatchments.value = []
  selectedBoundaries.value = []
  mapStore.clearAllFilters()

  // Fit map to school markers
  if (mapStore.map && mapStore.schoolMarkers) {
    mapStore.map.fitBounds(mapStore.schoolMarkers.getBounds())
  }
}
</script>

<style scoped>
.filter-sidebar {
  width: 400px !important;
}

.filter-content {
  padding: 0;
}

.filter-heading {
  background-color: #6c757d;
  color: white;
  padding: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.filter-group {
  margin-top: 0.75rem;
}

.group-label {
  display: block;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  color: #495057;
  font-weight: 600;
}

.filter-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.875rem;
  cursor: pointer;
  user-select: none;
  margin: 0;
}

@media (max-width: 768px) {
  .filter-sidebar {
    width: 85% !important;
  }
}
</style>
