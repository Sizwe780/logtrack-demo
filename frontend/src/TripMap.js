import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import axios from 'axios';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1Ijoic2l6d2U3OCIsImEiOiJjbWZncWkwZnIwNDBtMmtxd3BkeXVtYjZzIn0.niS9m5pCbK5Kv-_On2mTcg';

function TripMap({ origin, destination, currentLocation, trip, onStopsGenerated }) {
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

  useEffect(() => {
    if (!origin || !destination || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [origin.lng, origin.lat],
      zoom: 6,
    });

    map.current.on('load', () => {
      new mapboxgl.Marker({ color: 'green' })
        .setLngLat([origin.lng, origin.lat])
        .setPopup(new mapboxgl.Popup().setText('Origin'))
        .addTo(map.current);

      new mapboxgl.Marker({ color: 'blue' })
        .setLngLat([destination.lng, destination.lat])
        .setPopup(new mapboxgl.Popup().setText('Destination'))
        .addTo(map.current);

      if (currentLocation && typeof currentLocation === 'object') {
        const { latitude, longitude } = currentLocation;
        if (!isNaN(latitude) && !isNaN(longitude)) {
          new mapboxgl.Marker({ color: 'red' })
            .setLngLat([longitude, latitude])
            .setPopup(new mapboxgl.Popup().setText('Current Location'))
            .addTo(map.current);
        }
      }

      const fetchRoute = async () => {
        try {
          const res = await axios.get(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}`,
            {
              params: {
                geometries: 'geojson',
                access_token: mapboxgl.accessToken,
              },
            }
          );

          const route = res.data.routes[0].geometry;
          const distanceMeters = res.data.routes[0].distance || 0;
          const coordinates = route?.coordinates || [];

          map.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: route,
            },
          });

          map.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#3b9ddd',
              'line-width': 4,
            },
          });

          const restInterval = 8;
          const totalHours = typeof trip?.cycle_used === 'number' && trip.cycle_used > 0 ? trip.cycle_used : 24;
          const restStopsNeeded = totalHours > restInterval ? Math.floor(totalHours / restInterval) : 0;
          const stopRemarks = [];

          console.log('Rest Stop Debug:', { totalHours, restStopsNeeded, coordinatesLength: coordinates.length });

          if (coordinates.length > 0 && restStopsNeeded >= 1) {
            const stepSize = Math.floor(coordinates.length / (restStopsNeeded + 1));
            const usedIndices = new Set();
            for (let i = 1; i <= restStopsNeeded; i++) {
              const index = stepSize * i;
              if (usedIndices.has(index)) continue;
              usedIndices.add(index);
              const [lng, lat] = coordinates[index] || [];

              if (!isNaN(lat) && !isNaN(lng)) {
                const locationName = await getLocationName(lng, lat);
                new mapboxgl.Marker({ color: 'orange' })
                  .setLngLat([lng, lat])
                  .setPopup(new mapboxgl.Popup().setText(`Rest Stop ${i}: ${locationName}`))
                  .addTo(map.current);
                stopRemarks.push(`Rest Stop ${i}: ${locationName}`);
              } else {
                console.warn(`Invalid rest stop coordinates at index ${index}:`, coordinates[index]);
              }
            }
          } else {
            console.warn('No rest stops generated:', { totalHours, restStopsNeeded, coordinatesLength: coordinates.length });
          }

          const distanceMiles = distanceMeters / 1609.34;
          const fuelStopsNeeded = Math.floor(distanceMiles / 1000);
          if (coordinates.length > 0 && fuelStopsNeeded > 0) {
            for (let i = 1; i <= fuelStopsNeeded; i++) {
              const index = Math.floor((coordinates.length / (fuelStopsNeeded + 1)) * i);
              const [lng, lat] = coordinates[index] || [];
              if (!isNaN(lat) && !isNaN(lng)) {
                const locationName = await getLocationName(lng, lat);
                new mapboxgl.Marker({ color: 'purple' })
                  .setLngLat([lng, lat])
                  .setPopup(new mapboxgl.Popup().setText(`Fuel Stop ${i}: ${locationName}`))
                  .addTo(map.current);
                stopRemarks.push(`Fuel Stop ${i}: ${locationName}`);
              }
            }
          }

          if (stopRemarks.length > 0 && typeof onStopsGenerated === 'function') {
            trip.stopRemarks = stopRemarks;
            onStopsGenerated(stopRemarks);
          }

          if (totalHours > 70) {
            console.warn(`Driver exceeds 70 hours.`);
          }
        } catch (error) {
          console.error('Failed to fetch route:', error);
        }
      };

      fetchRoute();
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [origin, destination, currentLocation, trip, onStopsGenerated]);

  return (
    <div className="map-container">
      <div ref={mapContainer} style={{ height: '500px', width: '100%' }} />
    </div>
  );
}

export default TripMap;