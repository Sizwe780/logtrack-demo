// TripForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Home.css'; // Pulls in your upgraded styles

function TripForm() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [driverName, setDriverName] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [cycleUsed, setCycleUsed] = useState('');
  const [departureTime, setDepartureTime] = useState('');

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentLocation(`${latitude},${longitude}`);
      },
      (err) => console.error('Geolocation error:', err)
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tripData = {
      origin,
      destination,
      date,
      driver_name: driverName,
      current_location: currentLocation,
      cycle_used: Number(cycleUsed),
      departure_time: departureTime,
    };
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/trips/`, tripData);
      setOrigin('');
      setDestination('');
      setDate('');
      setDriverName('');
      setCurrentLocation('');
      setCycleUsed('');
      setDepartureTime('');
      alert('Trip submitted successfully!');
    } catch (error) {
      console.error('Submission failed:', error.response?.data || error.message);
      alert('Failed to submit trip.');
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Submit Trip Details</h2>
      <form className="trip-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Origin</label>
            <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Destination</label>
            <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Driver Name</label>
            <input type="text" value={driverName} onChange={(e) => setDriverName(e.target.value)} required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Current Location</label>
            <input type="text" value={currentLocation} onChange={(e) => setCurrentLocation(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Cycle Used (hrs)</label>
            <input type="number" value={cycleUsed} onChange={(e) => setCycleUsed(e.target.value)} required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Departure Time</label>
            <input type="datetime-local" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} required />
          </div>
        </div>
        <div className="form-row submit-row">
          <button type="submit">Submit Trip</button>
        </div>
      </form>
    </div>
  );
}

export default TripForm;