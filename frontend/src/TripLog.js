import React, { useEffect, useState } from 'react';

function TripLog({ trip, stopRemarks = [] }) {
  const [remarks, setRemarks] = useState([]);

  useEffect(() => {
    setRemarks(stopRemarks);
  }, [stopRemarks]);

  const drivingHours = typeof trip.cycle_used === 'number' ? trip.cycle_used : 0;
  const totalHours = drivingHours + 2;
  const sheetCount = Math.ceil(totalHours / 24);

  const downloadCSV = () => {
    const csvRows = [];
    const headers = ['Time', 'Status', 'Location'];
    csvRows.push(headers);

    let currentTime = trip.departure_time ? new Date(trip.departure_time).getTime() : new Date().getTime();

    for (let i = 0; i < totalHours; i++) {
      const row = [];
      const hourTime = new Date(currentTime + i * 60 * 60 * 1000);
      const status = 'Driving';
      const location = trip.current_location || 'N/A';
      row.push(hourTime.toLocaleString());
      row.push(status);
      row.push(location);
      csvRows.push(row);
    }

    const metadata = [
      ['Driver:', trip.driver_name || 'N/A'],
      ['Date:', trip.date ? new Date(trip.date).toLocaleDateString() : 'N/A'],
      ['Departure Time:', trip.departure_time ? new Date(trip.departure_time).toLocaleString() : 'N/A'],
      ['Origin → Destination:', `${trip.origin} → ${trip.destination}`],
      ['Current Location:', trip.current_location || 'N/A'],
      ['Cycle Used:', trip.cycle_used !== null && trip.cycle_used !== undefined ? `${trip.cycle_used} hrs` : 'N/A'],
      ['City:', 'Nelson Mandela Bay Metropolitan Municipality'],
      ['Remarks:', remarks.join(' | ')],
      [],
    ];

    const csvContent = [...metadata, ...csvRows]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `trip-log-${trip.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <h3>Daily Log Sheet</h3>
        {Array.from({ length: sheetCount }, (_, i) => (
          <div key={i} style={{ border: '1px solid black', margin: '1rem', padding: '1rem' }}>
            <h4>Day {i + 1}</h4>
            <p><strong>Remarks:</strong> {remarks.length > 0 ? remarks.join(' | ') : 'No remarks to display.'}</p>
            <p>This is a placeholder for the ELD log drawing. You would use a library like `react-konva` or a `canvas` element to draw the grid and fill in the status lines for each hour based on the trip data.</p>
          </div>
        ))}
        <button onClick={downloadCSV}>Download CSV Log</button>
      </div>
    </div>
  );
}

export default TripLog;