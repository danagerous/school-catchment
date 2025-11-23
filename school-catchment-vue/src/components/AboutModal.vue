<template>
  <Dialog
    v-model:visible="isVisible"
    header="Metadata"
    :modal="true"
    :style="{ width: '50vw' }"
    :breakpoints="{ '960px': '75vw', '640px': '95vw' }"
  >
    <div class="about-content">
      <p>
        <strong>Summary:</strong> A School District Catchment Boundary is a geographic area created
        for the purposes of educational administration.
      </p>

      <p>
        <strong>Description:</strong> SD catchment boundaries are determined by School District 8,
        Kootenay Lake
        <a
          href="https://www.sd8.bc.ca/Policy/461SchoolChoice&Catchments.pdf"
          target="_blank"
          rel="noopener noreferrer"
          >Policy No. 461</a
        >. Boundaries are determined based upon a number of factors including geography and
        demographics. Boundaries were created using 1:20,000 TRIM data from
        <a
          href="https://www.data.gov.bc.ca/dbc/geographic/connect/index.page?"
          target="_blank"
          rel="noopener noreferrer"
          >DataBC WMS base layers</a
        >
        and Fire Zone, Fire Department and Addressing data provided by the
        <a href="https://www.rdck.bc.ca/" target="_blank" rel="noopener noreferrer"
          >Regional District of Central Kootenay (RDCK)</a
        >.
      </p>

      <p>
        <a
          href="https://www.bcstats.gov.bc.ca/StatisticsBySubject/Geography/TranslationsDataSets.aspx"
          target="_blank"
          rel="noopener noreferrer"
          >School District</a
        >
        boundary data acquired from
        <a href="https://www.bcstats.gov.bc.ca/Home.aspx" target="_blank" rel="noopener noreferrer"
          >BC Stats</a
        >.
      </p>

      <p>
        <a
          href="https://catalogue.data.gov.bc.ca/dataset/bc-schools-school-locations"
          target="_blank"
          rel="noopener noreferrer"
          >School Location</a
        >,
        <a
          href="https://catalogue.data.gov.bc.ca/dataset/tantalis-municipalities"
          target="_blank"
          rel="noopener noreferrer"
          >Municipality</a
        >,
        <a
          href="https://catalogue.data.gov.bc.ca/dataset/indian-reserves-band-names-administrative-boundaries"
          target="_blank"
          rel="noopener noreferrer"
          >First Nations</a
        >,
        <a
          href="https://catalogue.data.gov.bc.ca/dataset/school-district-trustee-electoral-areas"
          target="_blank"
          rel="noopener noreferrer"
          >School District Trustee Electoral Areas</a
        >, and
        <a
          href="https://catalogue.data.gov.bc.ca/dataset/tantalis-regional-districts"
          target="_blank"
          rel="noopener noreferrer"
          >Regional District</a
        >
        data acquired from
        <a href="https://www.data.gov.bc.ca/" target="_blank" rel="noopener noreferrer">DataBC</a>.
      </p>

      <p>
        Built on a
        <a href="https://leafletjs.com/" target="_blank" rel="noopener noreferrer">Leaflet</a> with
        all layers served using
        <a href="https://geojson.org/" target="_blank" rel="noopener noreferrer">GeoJSON</a>
        (markers) and
        <a href="https://github.com/topojson/topojson" target="_blank" rel="noopener noreferrer"
          >TopoJSON</a
        >
        (polygons). GeoJSON and TopoJSON validated using
        <a href="https://jsonlint.com/" target="_blank" rel="noopener noreferrer">JSONLint</a>.
      </p>

      <p>
        All school catchment layers digitized in
        <a href="https://www.qgis.org/en/site/" target="_blank" rel="noopener noreferrer">QGIS</a>
        and topology run through
        <a href="https://grass.osgeo.org/" target="_blank" rel="noopener noreferrer">GRASS</a> where
        geometry errors were detected.
      </p>

      <p>
        <strong>Report Bugs:</strong> Open an issue on
        <a
          href="https://github.com/danagerous/school-catchment/issues"
          target="_blank"
          rel="noopener noreferrer"
          >GitHub</a
        >.
      </p>

      <p>
        <strong>Developed by:</strong>
        <a href="https://danadiotte.com" title="Dana Diotte" target="_blank" rel="noopener noreferrer"
          >Dana Diotte</a
        >
      </p>
    </div>

    <template #footer>
      <Button label="Close" @click="$emit('update:visible', false)" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

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
</script>

<style scoped>
.about-content {
  line-height: 1.6;
}

.about-content p {
  margin-bottom: 1rem;
}

.about-content a {
  color: #0d6efd;
  text-decoration: none;
}

.about-content a:hover {
  text-decoration: underline;
}
</style>
