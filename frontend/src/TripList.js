import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import TripMap from './TripMap';
import TripLog from './TripLog';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoic2l6d2U3OCIsImEiOiJjbWZncWkwZnIwNDBtMmtxd3BkeXVtYjZzIn0.niS9m5pCbK5Kv-_On2mTcg';

function TripList() {
  const [trips, setTrips] = useState([]);
  const [stopRemarksMap, setStopRemarksMap] = useState({});

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
    } catch {
      return null;
    }
  };

  // Function to delete a trip
  const deleteTrip = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/trips/${id}/`);
      setTrips(trips.filter(trip => trip.id !== id));
      setStopRemarksMap(prevRemarks => {
        const newRemarks = { ...prevRemarks };
        delete newRemarks[id];
        return newRemarks;
      });
    } catch (error) {
      console.error('Failed to delete the trip:', error);
    }
  };

  const handleStopsGenerated = useCallback((tripId, remarks) => {
    setStopRemarksMap(prevRemarks => ({
      ...prevRemarks,
      [tripId]: remarks,
    }));
  }, []);

  // Corrected useEffect with fetchTrips defined inside
  useEffect(() => {
    const fetchTrips = async () => { // fetchTrips is now defined INSIDE useEffect
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
        console.error('Failed to fetch trips:', error);
      }
    };
    
    fetchTrips();
  }, []); // The empty dependency array means this effect runs only once on mount

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-4">Trip Dashboard</h2>
      {trips.length === 0 ? (
        <p>No trips to display. Submit a new trip on the Home page.</p>
      ) : (
        trips.map((trip) => (
          <div key={trip.id} className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold mb-2">{trip.origin} → {trip.destination}</h3>
            <p><strong>Driver:</strong> {trip.driver_name || 'N/A'}</p>
            <p><strong>Date:</strong> {trip.date || 'N/A'}</p>
            <p>
              <strong>Current Location:</strong>{' '}
              {trip.current_location
                ? `${trip.current_location.latitude}, ${trip.current_location.longitude}`
                : 'N/A'}
            </p>
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
                  onStopsGenerated={(remarks) => handleStopsGenerated(trip.id, remarks)}
                />
                <TripLog trip={trip} stopRemarks={stopRemarksMap[trip.id] || []} />
              </>
            ) : (
              <p>Map unavailable for this trip.</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default TripList;
