import 'css/styles.css';
import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import StadiaMaps from 'ol/source/StadiaMaps.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';


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

// Declare map and heatmapLayer variables
let map, heatmapLayer;

// Initialize the map
function initializeMap() {
    if (!map) {
        // Create a new OpenLayers map
        map = new ol.Map({
            target: 'map', // The DOM element to attach the map to
            layers: [
                // Add a Tile layer using OpenStreetMap source
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                })
            ],
            view: new ol.View({
                center: ol.proj.fromLonLat([-0.09, 51.505]), // Map center in longitude and latitude
                zoom: 13 // Initial zoom level
            })
        });
    }

    // Fit the map bounds to the GPX points with padding
    const extent = ol.extent.boundingExtent(gpxPoints.map(p => ol.proj.fromLonLat([p[1], p[0]])));
    ol.extent.applyTransform(extent, ol.proj.getTransform("EPSG:4326", "EPSG:3857"));
    map.getView().fit(extent, { padding: [50, 50, 50, 50] }); // Add padding around the extent
}

// Create and add the heatmap layer
function createHeatmap() {
    if (heatmapLayer) {
        map.removeLayer(heatmapLayer); // Remove the existing heatmap layer if present
    }

    // Transform GPX points to the format required by OpenLayers
    const transformedPoints = gpxPoints.map(p => new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat([p[1], p[0]]))));

    // Create a vector source and add the transformed points
    const vectorSource = new ol.source.Vector({
        features: transformedPoints
    });

    // Create and add the heatmap layer
    heatmapLayer = new ol.layer.Heatmap({
        source: vectorSource,
        radius: 25, // Equivalent to Leaflet's radius
        blur: 15 // Equivalent to Leaflet's blur
    });

    map.addLayer(heatmapLayer);
}

