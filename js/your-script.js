// Elements from the DOM
const fileInput = document.getElementById('file-input');
const saveButton = document.getElementById('save-button');

// Global map variables
let map;
let heatmapLayer;
let gpxPoints = [];

// Event listener for file input change
fileInput.addEventListener('change', handleFileSelect, false);

// Initially hide the save button
saveButton.style.display = 'none';

// Handle file selection and read the file
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            parseGPX(e.target.result);
            initializeMap();
            document.getElementById('map-preview').style.display = 'block';
        };
        
        reader.readAsText(file);
    }
}

// Parse the GPX data
function parseGPX(gpxContents) {
    const parser = new DOMParser();
    const gpx = parser.parseFromString(gpxContents, "application/xml");
    const trkpts = gpx.querySelectorAll("trkpt");
    
    gpxPoints = []; // Clear previous points

    trkpts.forEach(trkpt => {
        const lat = parseFloat(trkpt.getAttribute("lat"));
        const lon = parseFloat(trkpt.getAttribute("lon"));
        gpxPoints.push([lat, lon]);
    });

    if (gpxPoints.length === 0) {
        console.error('No points found in the GPX file.');
        return;
    }

    // Enable the save button once the GPX is parsed
    saveButton.style.display = 'inline-block';
}

// Initialize the map
function initializeMap() {
    if (!map) {
        map = L.map('map').setView([51.505, -0.09], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
    }

    // Fit the map bounds to the GPX points with padding
    const bounds = L.latLngBounds(gpxPoints).pad(0.1);
    map.fitBounds(bounds);
}

// Event listener for the save button to create heatmap
saveButton.addEventListener('click', createHeatmap, false);

// Create and add the heatmap layer
function createHeatmap() {
    if (heatmapLayer) {
        heatmapLayer.remove(); // Remove the existing heatmap layer if present
    }
    
    heatmapLayer = L.heatLayer(gpxPoints, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
    }).addTo(map);
}
