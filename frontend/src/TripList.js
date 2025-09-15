import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import TripMap from './TripMap';
import TripLog from './TripLog';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoic2l6d2U3OCIsImEiOiJjbWZncWkwZnIwNDBtMmtxd3BkeXVtYjZzIn0.niS9m5pCbK5Kv-_On2mTcg';

function TripList() {
  const [trips, setTrips] = useState([]);
  const [stopRemarksMap, setStopRemarksMap] = useState({});
  const [loading, setLoading] = useState(true);

  const geocodeLocation = async (location) => {
    if (!location) return null;
    try {
      const res = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${location}.json`, {
        params: { access_token: MAPBOX_TOKEN, limit: 1 },
      });
      const coords = res.data.features[0]?.center;
      return coords && coords.length === 2
        ? { lng: coords[0], lat: coords[1] }
        : null;
    } catch (error) {
      console.error(`Geocoding failed for location "${location}":`, error);
      return null;
    }
  };

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/trips/`);
      const enrichedTrips = await Promise.all(
        res.data.map(async (trip) => {
          const originCoords = await geocodeLocation(trip.origin);
          const destCoords = await geocodeLocation(trip.destination);
          return { ...trip, originCoords, destCoords };
        })
      );
      setTrips(enrichedTrips);
    } catch (error) {
      console.error('Failed to fetch trips:', error.response ? error.response.data : error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const deleteTrip = async (id) => {
    try {
      const response = await axios.delete(`${process.env.REACT_APP_API_URL}/api/trips/${id}/`);
      console.log('Delete successful:', response);
      fetchTrips();
    } catch (error) {
      console.error('Failed to delete trip:', error.response ? error.response.data : error.message);
    }
  };

  // Use useCallback to memoize the function, preventing unnecessary re-renders of TripMap
  const handleStopsGenerated = useCallback((tripId, remarks) => {
    setStopRemarksMap(prev => ({ ...prev, [tripId]: remarks }));
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Trip Dashboard</h1>
      {loading ? (
        <p>Loading trips...</p>
      ) : trips.length === 0 ? (
        <p>No trips found. Please submit a trip from the Home tab.</p>
      ) : (
        trips.map((trip) => (
          <div key={trip.id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>
            <h3>{trip.driver_name}</h3>
            <p><strong>Origin:</strong> {trip.origin}</p>
            <p><strong>Destination:</strong> {trip.destination}</p>
            <p><strong>Current Location:</strong> {trip.current_location || 'N/A'}</p>
            <p><strong>Cycle Used:</strong> {trip.cycle_used !== null && trip.cycle_used !== undefined ? `${trip.cycle_used} hrs` : 'N/A'}</p>

            <button
              onClick={() => deleteTrip(trip.id)}
              style={{
                marginBottom: '1rem',
                backgroundColor: '#e74c3c',
                color: '#fff',
                border: 'none',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                borderRadius: '5px',
              }}
            >
              Delete Trip
            </button>

            {trip.originCoords && trip.originCoords.lng && trip.destCoords && trip.destCoords.lng ? (
              <>
                <TripMap
                  origin={trip.originCoords}
                  destination={trip.destCoords}
                  trip={trip}
                  onStopsGenerated={(remarks) => handleStopsGenerated(trip.id, remarks)}
                />
                <TripLog trip={trip} stopRemarks={stopRemarksMap[trip.id] || []} />
              </>
            ) : (
              <p>Map unavailable for this trip. Check console for geocoding errors.</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default TripList;
