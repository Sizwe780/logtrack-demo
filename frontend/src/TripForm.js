import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
      await axios.post('http://127.0.0.1:8000/api/trips/', tripData);
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
    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
      <h2>Submit Trip Details</h2>
      <input type="text" placeholder="Origin" value={origin} onChange={(e) => setOrigin(e.target.value)} />
      <input type="text" placeholder="Destination" value={destination} onChange={(e) => setDestination(e.target.value)} />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <input type="text" placeholder="Driver Name" value={driverName} onChange={(e) => setDriverName(e.target.value)} />
      <input type="text" placeholder="Current Location" value={currentLocation} onChange={(e) => setCurrentLocation(e.target.value)} />
      <input type="number" placeholder="Current Cycle Used (hrs)" value={cycleUsed} onChange={(e) => setCycleUsed(e.target.value)} />
      <label>Departure Time:</label>
      <input
        type="datetime-local"
        value={departureTime}
        onChange={(e) => setDepartureTime(e.target.value)}
        required
      />
      <button type="submit">Submit Trip</button>
    </form>
  );
}

export default TripForm;
