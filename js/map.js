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
attribution: '&copy; <a href=”https://osm.org/copyright”>OpenStreetMap</a> contributors'
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
    return {color: feature.properties.stroke};
}

/*****************************/
/* start load TopoJSON file
/*****************************/
//start json
let checkboxStates
$.getJSON("data/catchment_sd8.topojson",function(data){
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