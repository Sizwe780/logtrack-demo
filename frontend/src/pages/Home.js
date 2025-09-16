import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Home.css';

function Home({ setActiveTab }) {
  const [driverName, setDriverName] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [origin, setOrigin] = useState('');
  const [cycleUsed, setCycleUsed] = useState('');
  const [destination, setDestination] = useState('');
  const [locationStatus, setLocationStatus] = useState('error');
  const [currentLocation, setCurrentLocation] = useState('');

  useEffect(() => {
    setDepartureTime(new Date().toISOString().slice(0, 16));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentLocation(`${latitude},${longitude}`);
        setLocationStatus('success');
      },
      () => setLocationStatus('error')
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tripData = {
      driver_name: driverName,
      departure_time: departureTime,
      origin,
      cycle_used: Number(cycleUsed),
      destination,
      current_location: currentLocation,
    };

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/trips/`, tripData);
      alert('Trip submitted successfully!');
      console.log('Trip submitted:', tripData);
      setDriverName('');
      setDepartureTime('');
      setOrigin('');
      setCycleUsed('');
      setDestination('');
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Submission failed:', error.response?.data || error.message);
      alert('Failed to submit trip.');
    }
  };

  return (
    <div className="home-container">
      <h1 className="welcome-message">
        Welcome, ready to log your trip? <span> ⭐ </span>
      </h1>
      <div className="form-container">
        <h2 className="form-title">Enter Trip Details</h2>
        <form className="trip-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Driver Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Departure Date & Time</label>
              <input
                type="datetime-local"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Origin</label>
              <input
                type="text"
                placeholder="Starting point"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Cycle Used (hrs)</label>
              <input
                type="number"
                placeholder="e.g. 2.5"
                value={cycleUsed}
                onChange={(e) => setCycleUsed(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Destination</label>
              <input
                type="text"
                placeholder="Where to?"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </div>
            <div className="form-group location-group">
              <label>Location</label>
              <div className={`location-indicator ${locationStatus}`}></div>
            </div>
          </div>
          <div className="form-row submit-row">
            <button type="submit">Submit</button>
          </div>
        </form>
      </div>
      <div className="contact-footer">
        <h3>Reach out... </h3>
        sizwe.ngwenya78@gmail.com
      </div>
    </div>
  );
}

export default Home;