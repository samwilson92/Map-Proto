document.getElementById('file-input').addEventListener('change', handleFileSelect, false);

function handleFileSelect(event) {
    const reader = new FileReader();
    reader.onload = function(fileEvent) {
        const contents = fileEvent.target.result;
        
        // Parse the GPX data
        const gpx = new DOMParser().parseFromString(contents, "text/xml");
        const tracks = gpx.getElementsByTagName("trkpt");
        const points = [];
        let lat, lon;

        for (let i = 0; i < tracks.length; i++) {
            lat = parseFloat(tracks[i].getAttribute("lat"));
            lon = parseFloat(tracks[i].getAttribute("lon"));
            points.push([lat, lon]);
        }

        if (points.length === 0) {
            console.error('No points found in the GPX file.');
            return;
        }

        // Initialize the map
        const map = L.map('map');
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18
        }).addTo(map);

        // Calculate bounds and padding
        const bounds = L.latLngBounds(points);
        const padding = bounds.pad(0.1); // Adds 10% padding

        // Fit the map bounds to the heatmap with padding
        map.fitBounds(padding);

        // Create and display the heatmap
        L.heatLayer(points, {
            radius: 25,
            blur: 15,
            maxZoom: 17,
        }).addTo(map);
    };

    // Read the file as text
    reader.readAsText(event.target.files[0]);
}

// Leaflet's 'fitBounds' method automatically adjusts the view to contain the bounding box with padding
// This makes additional manual padding calculation unnecessary.
