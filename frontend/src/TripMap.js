import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import axios from 'axios';
import 'mapbox-gl/dist/mapbox-gl.css';

// Your Mapbox access token. Please replace with your own valid token.
mapboxgl.accessToken = 'pk.eyJ1Ijoic2l6d2U3OCIsImEiOiJjbWZncWkwZnIwNDBtMmtxd3BkeXVtYjZzIn0.niS9m5pCbK5Kv-_On2mTcg';

function TripMap({ origin, destination, trip, onStopsGenerated }) {
  const mapContainer = useRef(null);
  const map = useRef(null);

  const getLocationName = async (lng, lat) => {
    try {
      const res = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`, {
        params: { access_token: mapboxgl.accessToken },
      });
      return res.data.features[0]?.place_name || `${lat}, ${lng}`;
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
      return `${lat}, ${lng}`;
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours} hrs ${minutes} min`;
  };

  useEffect(() => {
    if (!origin || !destination || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [origin.lng, origin.lat],
      zoom: 4
    });

    map.current.on('load', async () => {
      try {
        const routeRes = await axios.get(`https://api.mapbox.com/directions/v5/mapbox/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}`, {
          params: {
            alternatives: false,
            geometries: 'geojson',
            steps: true,
            access_token: mapboxgl.accessToken,
          },
        });

        const route = routeRes.data.routes[0];
        const routeGeometry = route.geometry;
        const totalDistanceMiles = route.distance / 1609.34; // meters to miles
        const totalDurationSeconds = route.duration; // seconds

        const allStops = [];

        // Add pickup and drop-off points first
        allStops.push({
          type: 'pickup',
          location: origin,
          label: trip.origin,
          remark: `Pickup at ${trip.origin} - Estimated at 0 hrs 0 min`,
        });

        // Add a single rest stop at the midpoint of the route path
        const restStopIndex = Math.floor(routeGeometry.coordinates.length / 2);
        const [restLng, restLat] = routeGeometry.coordinates[restStopIndex];
        const restStopName = await getLocationName(restLng, restLat);
        const restStopDuration = (totalDurationSeconds / 2);
        allStops.push({
          type: 'rest',
          location: { lng: restLng, lat: restLat },
          label: 'Rest Stop',
          remark: `Rest stop near ${restStopName} - Estimated at ${formatTime(restStopDuration)}`,
        });

        // Add fuel stops every 1,000 miles
        const fuelStopsNeeded = Math.floor(totalDistanceMiles / 1000);
        if (fuelStopsNeeded > 0) {
          const coordinates = routeGeometry.coordinates;
          const segmentDistance = totalDistanceMiles / (fuelStopsNeeded + 1);
          let cumulativeDistance = 0;
          let currentCoordIndex = 0;
          for (let i = 1; i <= fuelStopsNeeded; i++) {
            const targetDistance = segmentDistance * i;
            let currentSegmentLength = 0;
            while (cumulativeDistance < targetDistance && currentCoordIndex < coordinates.length - 1) {
              const [prevLng, prevLat] = coordinates[currentCoordIndex];
              const [currLng, currLat] = coordinates[currentCoordIndex + 1];
              const segment = new mapboxgl.LngLat(prevLng, prevLat).distanceTo(new mapboxgl.LngLat(currLng, currLat)) / 1609.34;
              currentSegmentLength += segment;
              if (cumulativeDistance + currentSegmentLength >= targetDistance) {
                const [lng, lat] = coordinates[currentCoordIndex + 1];
                const locationName = await getLocationName(lng, lat);
                const fuelStopDuration = (totalDurationSeconds * ((cumulativeDistance + currentSegmentLength) / totalDistanceMiles));
                allStops.push({
                  type: 'fuel',
                  location: { lng, lat },
                  label: `Fuel Stop ${i}`,
                  remark: `Fuel stop near ${locationName} - Estimated at ${formatTime(fuelStopDuration)}`,
                });
                break;
              }
              cumulativeDistance += segment;
              currentCoordIndex++;
            }
          }
        }
        
        // Add drop-off point last
        allStops.push({
          type: 'dropoff',
          location: destination,
          label: trip.destination,
          remark: `Drop-off at ${trip.destination} - Estimated at ${formatTime(totalDurationSeconds)}`,
        });

        // Add the route line to the map
        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: routeGeometry,
            },
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#007bff',
            'line-width': 6,
          },
        });

        // Plot markers for all stops
        allStops.forEach(item => {
          let color;
          switch (item.type) {
            case 'pickup':
              color = '#4ade80'; // Green
              break;
            case 'dropoff':
              color = '#3b82f6'; // Blue
              break;
            case 'rest':
              color = '#ef4444'; // Red
              break;
            case 'fuel':
              color = '#f97316'; // Orange
              break;
            default:
              color = '#9ca3af'; // Gray
          }

          const el = document.createElement('div');
          el.className = 'marker';
          el.style.backgroundColor = color;
          el.style.width = '12px';
          el.style.height = '12px';
          el.style.borderRadius = '50%';
          el.style.border = '2px solid white';
          el.style.boxShadow = '0 0 5px rgba(0,0,0,0.5)';

          new mapboxgl.Marker(el)
            .setLngLat(item.location)
            .setPopup(new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div class="p-2 text-sm text-gray-800">
                  <h3 class="font-bold mb-1">${item.label}</h3>
                  <p>${item.remark}</p>
                </div>
              `))
            .addTo(map.current);
        });

        const bounds = new mapboxgl.LngLatBounds();
        allStops.forEach(item => bounds.extend(item.location));
        map.current.fitBounds(bounds, { padding: 50 });

        // Generate remarks for TripLog
        if (typeof onStopsGenerated === 'function') {
          const remarks = allStops.map(s => s.remark);
          onStopsGenerated(remarks);
        }

      } catch (error) {
        console.error('Route fetch failed:', error);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [origin, destination, trip, onStopsGenerated]);

  return (
    <div className="relative w-full h-96 rounded-xl overflow-hidden shadow-lg">
      <div ref={mapContainer} className="h-full w-full" />
    </div>
  );
}

export default TripMap;
