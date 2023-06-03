/*******************************/
/* TopoJSON-aware Leaflet layer 
/*******************************/
L.TopoJSON = L.GeoJSON.extend({
    addData: function(jsonData) {    
        if (jsonData.type === "Topology") {
        for (key in jsonData.objects) {
            geojson = topojson.feature(jsonData, jsonData.objects[key]);
            L.GeoJSON.prototype.addData.call(this, geojson);
            }
        }    
        else {
            L.GeoJSON.prototype.addData.call(this, jsonData);
        }
    }  
});// End TopoJSON-aware Leaflet layer

var map = L.map('map').setView([49.624889, -116.962890], 8);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


/*******************************/
/* Start BC Geocoder 
/*******************************/
var geocodeLayer = null;
var searchInput = document.getElementById('geocodeField');
var results = L.layerGroup().addTo(map);

function searchAddress() {
    var address = searchInput.value.trim();
    geocodeAddress(address);
}

function geocodeAddress() {
    var address = searchInput.value.trim();
    if (address !== '') {
        var url = 'https://geocoder.api.gov.bc.ca/addresses.json?addressString=' + encodeURIComponent(address) + '&minScore=80&maxResults=1';

        fetch(url)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                results.clearLayers();
                geocodeLayer = results;
                if (data.features.length > 0) {
                    var feature = data.features[0];
                    var coordinates = feature.geometry.coordinates;
                    var latlng = L.latLng(coordinates[1], coordinates[0]);
                    var marker = L.marker(latlng).addTo(map);
                    marker.bindPopup(formatAddress(feature.properties)).openPopup();
                    results.addLayer(marker);
                    map.setView(latlng, 13);
                } else {
                    alert('Address not found');
                }
            })
            .catch(function (error) {
                console.error('Error:', error);
                alert('An error occurred during geocoding');
            });
    }
}

var gcApi = "https://geocoder.api.gov.bc.ca/";

// Geocode Address autocomplete
$('#geocodeField').autocomplete({
    minLength: 3,
    source: function (request, response) {
        var params = {
            minScore: 50,
            maxResults: 3,
            echo: 'false',
            brief: true,
            autoComplete: true,
            addressString: request.term
        };
        $.ajax({
            url: gcApi + "addresses.json",
            data: params,
            success: function (data) {
                var list = [];
                if (data.features && data.features.length > 0) {
                    list = data.features.map(function (item) {
                        return {
                            value: item.properties.fullAddress,
                            data: item
                        };
                    });
                }
                response(list);
            },
            error: function () {
                response([]);
            }
        });
    },
    select: function (evt, ui) {
        $('#output').text(JSON.stringify(ui.item.data, null, 4));
        geocodeAddress(); // Geocode the selected address
    }
});

function formatAddress(properties) {
    var address = properties.fullAddress;
    return address;
}

document.getElementById('geocodeField').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        geocodeAddress();
    }
});

$('#addressClear').on("click", function() {
    if(geocodeLayer) {
        map.removeLayer(geocodeLayer);
        geocodeLayer = null;
    }
    results.clearLayers(); // Clear the results layer group
    $('#geocodeField').val(''); // Clear the geocodeField value
});

$('#geocodeBtn').on("click", function() {
    searchAddress(); // Call the searchAddress() function

});// End BC Geocoder

// Create the locate control and add it to the map
var locateControl = L.control.locate({
    position: 'topleft',  // Change the position of the control
    drawCircle: false,     // Disable drawing a circle indicating accuracy
    setView: true,         // Automatically sets the map view to the user's location
    keepCurrentZoomLevel: false,  // Do not keep the current zoom level when displaying the user's location
    strings: {
        title: "Show my location"  // Change the title of the control
    }
}).addTo(map);

// Cluster school markers
var markers = L.markerClusterGroup({
    showCoverageOnHover:false
    }
);

// Custom School Icon
var schoolIcon = L.icon({
    iconUrl: 'images/school.png',
    iconSize:     [32, 37], // size of the icon
    iconAnchor:   [15, 35], // point of the icon which will correspond to marker's location
    popupAnchor:  [1, -30] // point from which the popup should open relative to the iconAnchor
});

/******************************/
/* load school GeoJSON file
/******************************/
// start json
$.getJSON("data/schools.geojson",function(data){
    // L.geoJson function is used to parse geojson file and load on to map 
    const schoolLayer = L.geoJson(data ,{
        pointToLayer: function(feature, latlng) {
            console.log(latlng, feature);
            return L.marker(latlng, {
            icon: schoolIcon
            })
        },
        onEachFeature: function(feature, featureLayer) {
            featureLayer.bindPopup('<b>' + feature.properties.SCHOOL_NAM + '</b>' + '<br />'
                        + feature.properties.SCHOOL_PHY);
        }
    })

    markers.addLayer(schoolLayer);
    map.addLayer(markers);
    map.fitBounds(markers.getBounds());

});//end json

// Function to add schools
function addSchools(){
    map.addLayer(markers);
    // Fit to school markers bounds if clicked off/on
    map.fitBounds(markers.getBounds());
};

// Function to remove schools
function removeSchools(){
    map.removeLayer(markers);
};

// Function to toggle schools
function toggleSchools(){
    if(map.hasLayer(markers)){
        removeSchools();
    } else {
        addSchools();
    }
};

// Use $("elementID") and the jQuery click listener method to toggle schools
$("#schools").click(function() {
    toggleSchools();
});
// end school GeoJSON file

// Set style function for TopoJSON polygon style properties
function style(feature) {
    return {
        color: feature.properties.stroke,
        // weight: feature.properties.stroke-width,
        // opacity: feature.properties.stroke-opacity,
        fillColor: feature.properties.fill,
        // fillOpacity: feature.properties.fill-opacity
    };
}

/*****************************/
/* start load TopoJSON file
/*****************************/
//start json
let checkboxStates
$.getJSON("data/catchment_sd8_2023.topojson",function(data){
    const catchmentLayer = new L.TopoJSON(null,{
        filter: (feature) => {
            const isCatchmentChecked = checkboxStates.catchments.includes(feature.properties.SCHOOL)
            const isBndryChecked = checkboxStates.boundaries.includes(feature.properties.Name)
            return isCatchmentChecked || isBndryChecked 
        },
        onEachFeature: function(feature, featureLayer) {
            if (feature.properties.CATCHMENT) {
                featureLayer.bindPopup('<b>' + "Catchment: " + '</b>' + feature.properties.CATCHMENT +  '<br />'
                    + '<b>' + "School: " + '</b>' + feature.properties.SCHOOL);
            }
            else if (feature.properties.Name) {
                featureLayer.bindPopup(feature.properties.Name);
            }
        },
        style: style
    }).addTo(map)

    function updateCheckboxStates() {
        checkboxStates = {
        catchments: [],
        boundaries: []
    }    
        for (let input of document.querySelectorAll('input')) {
            if(input.checked) {
                switch (input.className) {
                    case 'catchment': checkboxStates.catchments.push(input.value); break
                    case 'bndry': checkboxStates.boundaries.push(input.value); break
                }
            }
        }
    }

    for (let input of document.querySelectorAll('input')) {
    //Listen to 'change' event of all inputs
        input.onchange = (e) => {
            catchmentLayer.clearLayers()
            updateCheckboxStates()
            catchmentLayer.addData(data)
            map.addLayer(catchmentLayer)
            map.fitBounds(catchmentLayer.getBounds())
        }
    }

    // Remove polygon layers with reset button
    function removePolys(){
        map.removeLayer(catchmentLayer);
    };

    // Use $("elementID") and the jQuery click listener method to reset map
    $("#reset").click(function() {
        removePolys();
        // Uncheck polygon checkboxes
        $('input[name=bndry]').prop("checked", false);
        $('input[name=catchment]').prop("checked", false);
        map.fitBounds(markers.getBounds());
    });

    /****** INIT ******/
    updateCheckboxStates()
    catchmentLayer.addData(data)
    
});//end json
//end load catchment TopoJSON file