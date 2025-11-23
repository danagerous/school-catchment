import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Sidebar from 'primevue/sidebar'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import AutoComplete from 'primevue/autocomplete'
import InputText from 'primevue/inputtext'
import './style.css'
import App from './App.vue'

// Import PrimeIcons
import 'primeicons/primeicons.css'

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(PrimeVue)

// Register PrimeVue components globally
app.component('Sidebar', Sidebar)
app.component('Dialog', Dialog)
app.component('Button', Button)
app.component('Checkbox', Checkbox)
app.component('AutoComplete', AutoComplete)
app.component('InputText', InputText)

app.mount('#app')
