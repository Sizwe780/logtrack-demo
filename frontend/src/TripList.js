import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TripMap from './TripMap';
import TripLog from './TripLog';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoic2l6d2U3OCIsImEiOiJjbWZncWkwZnIwNDBtMmtxd3BkeXVtYjZzIn0.niS9m5pCbK5Kv-_On2mTcg';

function TripList() {
  const [trips, setTrips] = useState([]);
  const [stopRemarksMap, setStopRemarksMap] = useState({}); // ✅ Store remarks per trip

  const geocodeLocation = async (location) => {
    if (!location) return null;
    try {
      const res = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${location}.json`, {
        params: {
          access_token: MAPBOX_TOKEN,
          limit: 1
        }
      });
      const coords = res.data.features[0]?.center;
      return coords && coords.length === 2
        ? { lng: coords[0], lat: coords[1] }
        : null;
    } catch (error) {
      console.error('Geocoding failed:', error);
      return null;
    }
  };

  const fetchTrips = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/trips/');
      const enrichedTrips = await Promise.all(res.data.map(async (trip) => {
        const originCoords = await geocodeLocation(trip.origin);
        const destCoords = await geocodeLocation(trip.destination);
        return { ...trip, originCoords, destCoords };
      }));
      setTrips(enrichedTrips);
    } catch (error) {
      console.error('Failed to fetch trips:', error);
    }
  };

  const deleteTrip = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/trips/${id}/`);
      setTrips((prev) => prev.filter((trip) => trip.id !== id));
      setStopRemarksMap((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    } catch (error) {
      console.error('Failed to delete trip:', error);
      alert('Could not delete trip.');
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleStopsGenerated = (tripId, remarks) => {
    setStopRemarksMap((prev) => ({
      ...prev,
      [tripId]: remarks
    }));
  };

  return (
    <div>
      <h2>Submitted Trips</h2>
      {trips.map((trip) => (
        <div key={trip.id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '2rem' }}>
          <p><strong>Driver:</strong> {trip.driver_name || 'N/A'}</p>
          <p><strong>Date:</strong> {trip.date ? new Date(trip.date).toLocaleDateString() : 'N/A'}</p>
          <p><strong>Departure Time:</strong> {trip.departure_time ? new Date(trip.departure_time).toLocaleString() : 'N/A'}</p>
          <p><strong>Origin → Destination:</strong> {trip.origin} → {trip.destination}</p>
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
              cursor: 'pointer'
            }}
          >
            Delete Trip
          </button>

          {trip.originCoords && trip.destCoords ? (
            <>
              <TripMap
                origin={trip.originCoords}
                destination={trip.destCoords}
                currentLocation={trip.current_location}
                trip={trip}
                onStopsGenerated={(remarks) => handleStopsGenerated(trip.id, remarks)} // ✅
              />
              <TripLog trip={trip} stopRemarks={stopRemarksMap[trip.id] || []} /> {/* ✅ */}
            </>
          ) : (
            <p>Map unavailable for this trip.</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default TripList;