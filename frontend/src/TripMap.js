import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import axios from 'axios';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1Ijoic2l6d2U3OCIsImEiOiJjbWZncWkwZnIwNDBtMmtxd3BkeXVtYjZzIn0.niS9m5pCbK5Kv-_On2mTcg';

function TripMap({ origin, destination, currentLocation, trip }) {
  const mapContainer = useRef(null);
  const map = useRef(null);

  const getLocationName = async (lng, lat) => {
    try {
      const res = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`, {
        params: {
          access_token: mapboxgl.accessToken,
        },
      });
      return res.data.features[0]?.place_name || `${lat}, ${lng}`;
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
      return `${lat}, ${lng}`;
    }
  };

  useEffect(() => {
    if (!origin || !destination) return;

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

      if (currentLocation) {
        const [lat, lng] = currentLocation.split(',').map(Number);
        if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
          new mapboxgl.Marker({ color: 'red' })
            .setLngLat([lng, lat])
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
          const totalHours = typeof trip?.cycle_used === 'number' ? trip.cycle_used : 0;
          const restStopsNeeded = Math.floor(totalHours / restInterval);
          const stopRemarks = [];

          if (coordinates.length > 0 && restStopsNeeded > 0) {
            for (let i = 1; i <= restStopsNeeded; i++) {
              const index = Math.floor((coordinates.length / (restStopsNeeded + 1)) * i);
              const [lng, lat] = coordinates[index] || [];

              if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
                const locationName = await getLocationName(lng, lat);
                new mapboxgl.Marker({ color: 'orange' })
                  .setLngLat([lng, lat])
                  .setPopup(new mapboxgl.Popup().setText(`Rest Stop ${i}: ${locationName}`))
                  .addTo(map.current);

                stopRemarks.push(`Rest Stop ${i}: ${locationName}`);
              }
            }
          }

          const distanceMiles = distanceMeters / 1609.34;
          const fuelStopsNeeded = Math.floor(distanceMiles / 1000);

          if (coordinates.length > 0 && fuelStopsNeeded > 0) {
            for (let i = 1; i <= fuelStopsNeeded; i++) {
              const index = Math.floor((coordinates.length / (fuelStopsNeeded + 1)) * i);
              const [lng, lat] = coordinates[index] || [];

              if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
                const locationName = await getLocationName(lng, lat);
                new mapboxgl.Marker({ color: 'purple' })
                  .setLngLat([lng, lat])
                  .setPopup(new mapboxgl.Popup().setText(`Fuel Stop ${i}: ${locationName}`))
                  .addTo(map.current);

                stopRemarks.push(`Fuel Stop ${i}: ${locationName}`);
              }
            }
          }

          if (Array.isArray(stopRemarks) && stopRemarks.length > 0) {
            trip.stopRemarks = stopRemarks;
          }

          if (totalHours > 70) {
            console.warn(`Driver exceeds 70hr/8-day limit: ${totalHours} hrs`);
          }

        } catch (error) {
          console.error('Route fetch failed:', error);
        }
      };

      fetchRoute();
    });

    return () => map.current.remove();
  }, [origin, destination, currentLocation, trip]);

  return <div ref={mapContainer} style={{ height: '400px' }} />;
}

export default TripMap;