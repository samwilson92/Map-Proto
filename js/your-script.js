import 'css/styles.css';
import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import StadiaMaps from 'ol/source/StadiaMaps.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';

import {fromLonLat} from 'ol/proj.js';

// Elements from the DOM
const fileInput = document.getElementById('file-input');
const saveButton = document.getElementById('save-button');

// Global map variables
const map = new Map({
  layers: [
    // NOTE: Layers from Stadia Maps do not require an API key for localhost development or most production
    // web deployments. See https://docs.stadiamaps.com/authentication/ for details.
    new TileLayer({
      source: new StadiaMaps({
        layer: 'stamen_watercolor',
        // apiKey: 'OPTIONAL'
      }),
    }),
    new TileLayer({
      source: new StadiaMaps({
        layer: 'stamen_terrain_labels',
        // apiKey: 'OPTIONAL'
      }),
    }),
  ],
  target: 'map',
  view: new View({
    center: fromLonLat([-122.416667, 37.783333]),
    zoom: 12,
  }),
});

let heatmapLayer;
let gpxPoints = [];

// Event listener for file input change
fileInput.addEventListener('change', handleFileSelect, false);

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
}
