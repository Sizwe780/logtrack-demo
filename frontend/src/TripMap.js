import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import axios from 'axios';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1Ijoic2l6d2U3OCIsImEiOiJjbWZncWkwZnIwNDBtMmtxd3BkeXVtYjZzIn0.niS9m5pCbK5Kv-_On2mTcg';

function TripMap({ origin, destination, trip, onStopsGenerated }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);

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
    // Check if the map instance already exists to prevent re-initialization
    if (map.current) return; 

    if (!origin || !destination) {
      console.error('Origin or destination coordinates are missing.');
      return;
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [origin.lng, origin.lat],
      zoom: 5,
    });

    map.current.on('load', async () => {
      // Cleanup existing markers
      markers.current.forEach(marker => marker.remove());
      markers.current = [];

      try {
        const routeRes = await axios.get(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}`,
          {
            params: {
              access_token: mapboxgl.accessToken,
              geometries: 'geojson',
            },
          }
        );

        const route = routeRes.data.routes[0];

        if (!route) {
          console.error('Route not found in API response.');
          onStopsGenerated([]);
          return;
        }

        const routeGeoJSON = route.geometry;

        if (map.current.getSource('route')) {
          map.current.getSource('route').setData(routeGeoJSON);
        } else {
          map.current.addSource('route', {
            type: 'geojson',
            data: routeGeoJSON,
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
              'line-color': '#007bff',
              'line-width': 4,
            },
          });
        }

        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend([origin.lng, origin.lat]);
        bounds.extend([destination.lng, destination.lat]);
        map.current.fitBounds(bounds, { padding: 50 });

        const stopRemarks = [];
        const coordinates = routeGeoJSON.coordinates;
        const totalDistanceMiles = route.distance / 1609.34;
        const drivingHours = typeof trip.cycle_used === 'number' ? trip.cycle_used : 0;
        const departureTime = trip.departure_time ? new Date(trip.departure_time) : new Date();

        const addStop = (location, type, timeInMinutes = null) => {
          let remark = `${type} at ${location}`;
          if (timeInMinutes !== null) {
            remark += ` - Estimated at ${Math.floor(timeInMinutes / 60)} hrs ${Math.round(timeInMinutes % 60)} min`;
          }
          stopRemarks.push(remark);
        };

        const addMarker = (lng, lat, color, text) => {
          const marker = new mapboxgl.Marker({ color: color })
            .setLngLat([lng, lat])
            .setPopup(new mapboxgl.Popup().setText(text))
            .addTo(map.current);
          markers.current.push(marker);
        };

        // Pickup & Drop-off
        addMarker(origin.lng, origin.lat, '#28a745', `Pickup at ${trip.origin}`);
        addMarker(destination.lng, destination.lat, '#dc3545', `Drop-off at ${trip.destination}`);
        stopRemarks.push(`Pickup at ${trip.origin} at ${departureTime.toLocaleString()}`);
        stopRemarks.push(`Drop-off at ${trip.destination}`);

        // Rest Stops (every 16.6 hours of driving)
        const restInterval = 16.6;
        for (let i = 1; i <= Math.floor(drivingHours / restInterval); i++) {
          const restTimeInMinutes = i * restInterval * 60;
          const pointIndex = Math.floor((restTimeInMinutes / route.duration) * coordinates.length);
          const [lng, lat] = coordinates[pointIndex] || [];
          if (!isNaN(lat) && !isNaN(lng)) {
            const locationName = await getLocationName(lng, lat);
            addMarker(lng, lat, '#ffc107', `Rest Stop ${i}: ${locationName}`);
            addStop(locationName, 'Rest stop', restTimeInMinutes);
          }
        }

        // Fuel Stops (every 1000 miles, ~20 hours driving)
        const fuelIntervalHours = 1000 / 50;
        for (let i = 1; i <= Math.floor(drivingHours / fuelIntervalHours); i++) {
          const fuelTimeInMinutes = i * fuelIntervalHours * 60;
          const pointIndex = Math.floor((fuelTimeInMinutes / route.duration) * coordinates.length);
          const [lng, lat] = coordinates[pointIndex] || [];
          if (!isNaN(lat) && !isNaN(lng)) {
            const locationName = await getLocationName(lng, lat);
            addMarker(lng, lat, 'blue', `Fuel Stop ${i}: ${locationName}`);
            addStop(locationName, 'Fuel stop', fuelTimeInMinutes);
          }
        }
        
        onStopsGenerated(stopRemarks);

        const totalHours = totalDistanceMiles / 50;
        if (totalHours > 70) {
          console.warn(`Driver exceeds 70hr/8-day limit: ${totalHours} hrs`);
        }

      } catch (error) {
        console.error('Route fetch failed:', error);
        onStopsGenerated([]);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [origin, destination, trip, onStopsGenerated]);

  return <div ref={mapContainer} style={{ width: '100%', height: '400px' }} />;
}

export default TripMap;
