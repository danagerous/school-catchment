import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Map } from 'leaflet'

interface CheckboxStates {
  catchments: string[]
  boundaries: string[]
}

interface AutocompleteState {
  currentFocus: number
}

interface CatchmentData {
  type: string
  [key: string]: any
}

export const useMapStore = defineStore('map', () => {
  // State
  const map = ref<Map | null>(null)
  const schoolMarkers = ref<any>(null)
  const catchmentLayer = ref<any>(null)
  const geocodeResults = ref<any>(null)
  const catchmentData = ref<CatchmentData | null>(null)
  const checkboxStates = ref<CheckboxStates>({
    catchments: [],
    boundaries: []
  })
  const autocomplete = ref<AutocompleteState>({
    currentFocus: -1
  })

  // Getters
  const hasSchoolMarkers = computed(() => schoolMarkers.value !== null)
  const hasCatchmentLayer = computed(() => catchmentLayer.value !== null)
  const hasCatchmentData = computed(() => catchmentData.value !== null)

  // Actions
  function setMap(mapInstance: Map) {
    map.value = mapInstance
  }

  function setSchoolMarkers(markers: any) {
    schoolMarkers.value = markers
  }

  function setCatchmentLayer(layer: any) {
    catchmentLayer.value = layer
  }

  function setGeocodeResults(results: any) {
    geocodeResults.value = results
  }

  function setCatchmentData(data: CatchmentData) {
    catchmentData.value = data
  }

  function updateCheckboxStates(states: Partial<CheckboxStates>) {
    if (states.catchments !== undefined) {
      checkboxStates.value.catchments = states.catchments
    }
    if (states.boundaries !== undefined) {
      checkboxStates.value.boundaries = states.boundaries
    }
  }

  function addCatchment(value: string) {
    if (!checkboxStates.value.catchments.includes(value)) {
      checkboxStates.value.catchments.push(value)
    }
  }

  function removeCatchment(value: string) {
    const index = checkboxStates.value.catchments.indexOf(value)
    if (index > -1) {
      checkboxStates.value.catchments.splice(index, 1)
    }
  }

  function addBoundary(value: string) {
    if (!checkboxStates.value.boundaries.includes(value)) {
      checkboxStates.value.boundaries.push(value)
    }
  }

  function removeBoundary(value: string) {
    const index = checkboxStates.value.boundaries.indexOf(value)
    if (index > -1) {
      checkboxStates.value.boundaries.splice(index, 1)
    }
  }

  function clearAllFilters() {
    checkboxStates.value.catchments = []
    checkboxStates.value.boundaries = []
  }

  function setAutocompleteFocus(focus: number) {
    autocomplete.value.currentFocus = focus
  }

  return {
    // State
    map,
    schoolMarkers,
    catchmentLayer,
    geocodeResults,
    catchmentData,
    checkboxStates,
    autocomplete,
    // Getters
    hasSchoolMarkers,
    hasCatchmentLayer,
    hasCatchmentData,
    // Actions
    setMap,
    setSchoolMarkers,
    setCatchmentLayer,
    setGeocodeResults,
    setCatchmentData,
    updateCheckboxStates,
    addCatchment,
    removeCatchment,
    addBoundary,
    removeBoundary,
    clearAllFilters,
    setAutocompleteFocus
  }
})
