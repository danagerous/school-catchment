/**
 * School Catchment Map Application
 * Modern ES6+ implementation with no jQuery dependencies
 */

// ============================================================================
// Constants & Configuration
// ============================================================================

const CONFIG = {
    map: {
        center: [49.624889, -116.962890],
        zoom: 8
    },
    geocoder: {
        apiUrl: 'https://geocoder.api.gov.bc.ca/',
        minScore: 50,
        maxResults: 3,
        minLength: 3
    },
    data: {
        schools: 'data/schools.geojson',
        catchments: 'data/catchment_sd8_2023.topojson'
    }
};

// ============================================================================
// TopoJSON Layer Extension
// ============================================================================

L.TopoJSON = L.GeoJSON.extend({
    addData: function(jsonData) {
        if (jsonData.type === "Topology") {
            for (const key in jsonData.objects) {
                const geojson = topojson.feature(jsonData, jsonData.objects[key]);
                L.GeoJSON.prototype.addData.call(this, geojson);
            }
        } else {
            L.GeoJSON.prototype.addData.call(this, jsonData);
        }
    }
});

// ============================================================================
// Application State
// ============================================================================

const AppState = {
    map: null,
    layers: {
        schoolMarkers: null,
        catchmentLayer: null,
        geocodeResults: null
    },
    data: {
        catchmentData: null
    },
    checkboxStates: {
        catchments: [],
        boundaries: []
    },
    autocomplete: {
        debounceTimer: null,
        currentFocus: -1
    }
};

// ============================================================================
// Map Initialization
// ============================================================================

/**
 * Initialize the Leaflet map
 */
function initializeMap() {
    AppState.map = L.map('map').setView(CONFIG.map.center, CONFIG.map.zoom);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(AppState.map);

    // Add locate control
    L.control.locate({
        position: 'topleft',
        drawCircle: false,
        setView: true,
        keepCurrentZoomLevel: false,
        strings: {
            title: "Show my location"
        }
    }).addTo(AppState.map);

    // Initialize geocode results layer
    AppState.layers.geocodeResults = L.layerGroup().addTo(AppState.map);
}

// ============================================================================
// School Markers
// ============================================================================

/**
 * Custom school icon
 */
const schoolIcon = L.icon({
    iconUrl: 'images/school.png',
    iconSize: [32, 37],
    iconAnchor: [15, 35],
    popupAnchor: [1, -30]
});

/**
 * Load and display school markers
 */
async function loadSchools() {
    try {
        const response = await fetch(CONFIG.data.schools);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Initialize marker cluster group
        AppState.layers.schoolMarkers = L.markerClusterGroup({
            showCoverageOnHover: false
        });

        // Create school layer
        const schoolLayer = L.geoJson(data, {
            pointToLayer: (feature, latlng) => {
                return L.marker(latlng, { icon: schoolIcon });
            },
            onEachFeature: (feature, featureLayer) => {
                const popupContent = `<b>${feature.properties.SCHOOL_NAM}</b><br>${feature.properties.SCHOOL_PHY}`;
                featureLayer.bindPopup(popupContent);
            }
        });

        AppState.layers.schoolMarkers.addLayer(schoolLayer);
        AppState.map.addLayer(AppState.layers.schoolMarkers);
        AppState.map.fitBounds(AppState.layers.schoolMarkers.getBounds());

    } catch (error) {
        console.error('Error loading schools:', error);
        showError('Failed to load school data. Please refresh the page.');
    }
}

/**
 * Toggle school markers visibility
 */
function toggleSchools() {
    if (AppState.map.hasLayer(AppState.layers.schoolMarkers)) {
        AppState.map.removeLayer(AppState.layers.schoolMarkers);
    } else {
        AppState.map.addLayer(AppState.layers.schoolMarkers);
        AppState.map.fitBounds(AppState.layers.schoolMarkers.getBounds());
    }
}

// ============================================================================
// Catchment Boundaries
// ============================================================================

/**
 * Style function for TopoJSON polygons
 */
function getFeatureStyle(feature) {
    return {
        color: feature.properties.stroke || '#3388ff',
        fillColor: feature.properties.fill || '#3388ff',
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.3
    };
}

/**
 * Update checkbox states from DOM
 */
function updateCheckboxStates() {
    AppState.checkboxStates.catchments = [];
    AppState.checkboxStates.boundaries = [];

    document.querySelectorAll('input[type="checkbox"]').forEach(input => {
        if (input.checked) {
            if (input.classList.contains('catchment')) {
                AppState.checkboxStates.catchments.push(input.value);
            } else if (input.classList.contains('bndry')) {
                AppState.checkboxStates.boundaries.push(input.value);
            }
        }
    });
}

/**
 * Filter function for catchment layer
 */
function filterCatchments(feature) {
    const isCatchmentChecked = AppState.checkboxStates.catchments.includes(feature.properties.SCHOOL);
    const isBoundaryChecked = AppState.checkboxStates.boundaries.includes(feature.properties.Name);
    return isCatchmentChecked || isBoundaryChecked;
}

/**
 * Load and display catchment boundaries
 */
async function loadCatchments() {
    try {
        const response = await fetch(CONFIG.data.catchments);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        AppState.data.catchmentData = data;

        // Create catchment layer
        AppState.layers.catchmentLayer = new L.TopoJSON(null, {
            filter: filterCatchments,
            onEachFeature: (feature, featureLayer) => {
                let popupContent = '';
                if (feature.properties.CATCHMENT) {
                    popupContent = `<b>Catchment:</b> ${feature.properties.CATCHMENT}<br><b>School:</b> ${feature.properties.SCHOOL}`;
                } else if (feature.properties.Name) {
                    popupContent = feature.properties.Name;
                }
                if (popupContent) {
                    featureLayer.bindPopup(popupContent);
                }
            },
            style: getFeatureStyle
        }).addTo(AppState.map);

        // Initial data load
        updateCheckboxStates();
        AppState.layers.catchmentLayer.addData(data);

        // Setup checkbox listeners
        setupCheckboxListeners();

    } catch (error) {
        console.error('Error loading catchments:', error);
        showError('Failed to load catchment data. Please refresh the page.');
    }
}

/**
 * Setup checkbox change listeners
 */
function setupCheckboxListeners() {
    document.querySelectorAll('input[type="checkbox"]').forEach(input => {
        input.addEventListener('change', () => {
            if (!AppState.layers.catchmentLayer || !AppState.data.catchmentData) return;

            AppState.layers.catchmentLayer.clearLayers();
            updateCheckboxStates();
            AppState.layers.catchmentLayer.addData(AppState.data.catchmentData);
            AppState.map.addLayer(AppState.layers.catchmentLayer);

            if (AppState.layers.catchmentLayer.getBounds().isValid()) {
                AppState.map.fitBounds(AppState.layers.catchmentLayer.getBounds());
            }
        });
    });
}

// ============================================================================
// Geocoding (Address Search)
// ============================================================================

/**
 * Format address for display
 */
function formatAddress(properties) {
    return properties.fullAddress;
}

/**
 * Search for an address and display result
 */
async function geocodeAddress(address) {
    if (!address || address.trim() === '') return;

    const url = `${CONFIG.geocoder.apiUrl}addresses.json?addressString=${encodeURIComponent(address)}&minScore=80&maxResults=1`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        AppState.layers.geocodeResults.clearLayers();

        if (data.features && data.features.length > 0) {
            const feature = data.features[0];
            const coordinates = feature.geometry.coordinates;
            const latlng = L.latLng(coordinates[1], coordinates[0]);

            const marker = L.marker(latlng).addTo(AppState.map);
            marker.bindPopup(formatAddress(feature.properties)).openPopup();
            AppState.layers.geocodeResults.addLayer(marker);
            AppState.map.setView(latlng, 13);
        } else {
            showError('Address not found. Please try a different address.');
        }
    } catch (error) {
        console.error('Geocoding error:', error);
        showError('An error occurred during geocoding. Please try again.');
    }
}

/**
 * Fetch autocomplete suggestions
 */
async function fetchAutocompleteSuggestions(searchTerm) {
    const params = new URLSearchParams({
        minScore: CONFIG.geocoder.minScore,
        maxResults: CONFIG.geocoder.maxResults,
        echo: 'false',
        brief: 'true',
        autoComplete: 'true',
        addressString: searchTerm
    });

    try {
        const response = await fetch(`${CONFIG.geocoder.apiUrl}addresses.json?${params}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.features || [];
    } catch (error) {
        console.error('Autocomplete error:', error);
        return [];
    }
}

/**
 * Display autocomplete suggestions
 */
function displayAutocompleteSuggestions(suggestions) {
    const autocompleteList = document.getElementById('autocomplete-list');
    autocompleteList.innerHTML = '';

    if (suggestions.length === 0) {
        autocompleteList.style.display = 'none';
        return;
    }

    suggestions.forEach((feature, index) => {
        const div = document.createElement('div');
        div.classList.add('autocomplete-item');
        div.textContent = feature.properties.fullAddress;
        div.dataset.index = index;
        div.dataset.address = feature.properties.fullAddress;

        div.addEventListener('click', () => {
            document.getElementById('geocodeField').value = feature.properties.fullAddress;
            geocodeAddress(feature.properties.fullAddress);
            autocompleteList.innerHTML = '';
            autocompleteList.style.display = 'none';
        });

        autocompleteList.appendChild(div);
    });

    autocompleteList.style.display = 'block';
}

/**
 * Handle autocomplete input
 */
async function handleAutocompleteInput(searchTerm) {
    if (searchTerm.length < CONFIG.geocoder.minLength) {
        document.getElementById('autocomplete-list').innerHTML = '';
        document.getElementById('autocomplete-list').style.display = 'none';
        return;
    }

    // Debounce the API call
    clearTimeout(AppState.autocomplete.debounceTimer);
    AppState.autocomplete.debounceTimer = setTimeout(async () => {
        const suggestions = await fetchAutocompleteSuggestions(searchTerm);
        displayAutocompleteSuggestions(suggestions);
    }, 300);
}

// ============================================================================
// UI Event Handlers
// ============================================================================

/**
 * Setup all UI event handlers
 */
function setupEventHandlers() {
    // School toggle checkbox
    const schoolsCheckbox = document.getElementById('schools');
    if (schoolsCheckbox) {
        schoolsCheckbox.addEventListener('change', toggleSchools);
    }

    // Geocode search button
    const geocodeBtn = document.getElementById('geocodeBtn');
    if (geocodeBtn) {
        geocodeBtn.addEventListener('click', () => {
            const address = document.getElementById('geocodeField').value;
            geocodeAddress(address);
        });
    }

    // Geocode field - Enter key
    const geocodeField = document.getElementById('geocodeField');
    if (geocodeField) {
        geocodeField.addEventListener('keydown', (e) => {
            const autocompleteList = document.getElementById('autocomplete-list');
            const items = autocompleteList.querySelectorAll('.autocomplete-item');

            if (e.key === 'Enter') {
                e.preventDefault();

                // If an autocomplete item is focused, use that
                if (AppState.autocomplete.currentFocus >= 0 && items[AppState.autocomplete.currentFocus]) {
                    items[AppState.autocomplete.currentFocus].click();
                } else if (geocodeField.value.trim() !== '') {
                    // Otherwise search for the typed address
                    geocodeAddress(geocodeField.value.trim());
                    autocompleteList.innerHTML = '';
                    autocompleteList.style.display = 'none';
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                AppState.autocomplete.currentFocus++;
                addActiveClass(items);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                AppState.autocomplete.currentFocus--;
                addActiveClass(items);
            } else if (e.key === 'Escape') {
                autocompleteList.innerHTML = '';
                autocompleteList.style.display = 'none';
            }
        });

        // Autocomplete input
        geocodeField.addEventListener('input', (e) => {
            handleAutocompleteInput(e.target.value);
        });
    }

    // Clear address button
    const addressClearBtn = document.getElementById('addressClear');
    if (addressClearBtn) {
        addressClearBtn.addEventListener('click', () => {
            AppState.layers.geocodeResults.clearLayers();
            document.getElementById('geocodeField').value = '';
            document.getElementById('autocomplete-list').innerHTML = '';
            document.getElementById('autocomplete-list').style.display = 'none';
        });
    }

    // Reset map button
    const resetBtn = document.getElementById('reset');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            // Remove catchment layer
            if (AppState.layers.catchmentLayer) {
                AppState.map.removeLayer(AppState.layers.catchmentLayer);
            }

            // Uncheck all catchment and boundary checkboxes
            document.querySelectorAll('input.catchment, input.bndry').forEach(checkbox => {
                checkbox.checked = false;
            });

            // Fit map to school markers
            if (AppState.layers.schoolMarkers) {
                AppState.map.fitBounds(AppState.layers.schoolMarkers.getBounds());
            }
        });
    }

    // Close autocomplete when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.address-search')) {
            document.getElementById('autocomplete-list').innerHTML = '';
            document.getElementById('autocomplete-list').style.display = 'none';
        }
    });
}

/**
 * Add active class to autocomplete items
 */
function addActiveClass(items) {
    if (!items || items.length === 0) return;

    removeActiveClass(items);

    if (AppState.autocomplete.currentFocus >= items.length) {
        AppState.autocomplete.currentFocus = 0;
    }
    if (AppState.autocomplete.currentFocus < 0) {
        AppState.autocomplete.currentFocus = items.length - 1;
    }

    items[AppState.autocomplete.currentFocus].classList.add('autocomplete-active');
}

/**
 * Remove active class from all autocomplete items
 */
function removeActiveClass(items) {
    items.forEach(item => item.classList.remove('autocomplete-active'));
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Display error message to user
 */
function showError(message) {
    // Create a simple alert for now (could be enhanced with a modal or toast)
    alert(message);
}

// ============================================================================
// Application Initialization
// ============================================================================

/**
 * Initialize the application
 */
async function initializeApp() {
    try {
        initializeMap();
        setupEventHandlers();

        // Load data
        await Promise.all([
            loadSchools(),
            loadCatchments()
        ]);

        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
        showError('Failed to initialize the application. Please refresh the page.');
    }
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
