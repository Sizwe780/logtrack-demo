import React, { useEffect, useState } from 'react';

function TripLog({ trip, stopRemarks = [] }) {
  const [remarks, setRemarks] = useState([]);

  const drivingHours = typeof trip.cycle_used === 'number' ? trip.cycle_used : 0;
  const totalHours = drivingHours + 2;
  const sheetCount = Math.ceil(totalHours / 24);
  const startHour = trip.departure_time ? new Date(trip.departure_time).getHours() : 0;

  const restInterval = 16.6;
  const restStopHours = [];
  for (let i = 1; i <= Math.floor(drivingHours / restInterval); i++) {
    restStopHours.push(startHour + i * Math.round(restInterval));
  }

  const fuelInterval = 5;
  const fuelStopHours = [];
  for (let i = 1; i <= Math.floor(drivingHours / fuelInterval); i++) {
    fuelStopHours.push(startHour + i * fuelInterval);
  }

  useEffect(() => {
    const remarks = [...stopRemarks];

    const pickupTime = trip.departure_time ? new Date(trip.departure_time).toLocaleString() : 'Unknown time';
    remarks.push(`Pickup at ${trip.origin} at ${pickupTime}`);
    remarks.push(`Drop-off at ${trip.destination}`);

    restStopHours.forEach(hour => {
      remarks.push(`Rest stop at [Location ${hour}] at ${hour}:00`);
    });

    fuelStopHours.forEach(hour => {
      remarks.push(`Fuel stop at [Location ${hour}] at ${hour}:00`);
    });

    setRemarks(remarks);
  }, [trip, stopRemarks]);

  const getRemarkForHour = (hour) => {
    if (hour === startHour) return `Pickup at ${trip.origin}`;
    if (hour === startHour + drivingHours + 1) return `Drop-off at ${trip.destination}`;
    if (restStopHours.includes(hour)) return `Rest stop at [Location ${hour}]`;
    if (fuelStopHours.includes(hour)) return `Fuel stop at [Location ${hour}]`;
    if (hour > startHour && hour <= startHour + drivingHours) return `Driving`;
    return `Off Duty`;
  };

  const renderLogSheet = (day) => {
    const generateLogRows = () => {
      const rows = [];
      const dayOffset = (day - 1) * 24;

      for (let hour = 0; hour < 24; hour++) {
        const globalHour = dayOffset + hour;
        let offDuty = 'X';
        let sleeper = '';
        let driving = '';
        let onDuty = '';

        const isPickup = globalHour === startHour;
        const isDropoff = globalHour === startHour + drivingHours + 1;
        const isRestStop = restStopHours.includes(globalHour);
        const isFuelStop = fuelStopHours.includes(globalHour);

        if (isPickup || isDropoff || isFuelStop) {
          onDuty = 'X';
          offDuty = '';
        }

        if (isRestStop) {
          offDuty = 'X';
        }

        if (
          globalHour > startHour &&
          globalHour <= startHour + drivingHours &&
          !isRestStop &&
          !isFuelStop
        ) {
          driving = 'X';
          offDuty = '';
        }

        rows.push(
          <tr key={hour}>
            <td>{hour}:00</td>
            <td><select defaultValue={offDuty}><option></option><option>X</option></select></td>
            <td><select defaultValue={sleeper}><option></option><option>X</option></select></td>
            <td><select defaultValue={driving}><option></option><option>X</option></select></td>
            <td><select defaultValue={onDuty}><option></option><option>X</option></select></td>
          </tr>
        );
      }

      return rows;
    };

    return (
      <div key={day} style={{ marginBottom: '2rem' }}>
        <h4>Day {day}</h4>
        <table>
          <thead>
            <tr>
              <th>Hour</th>
              <th>Off Duty</th>
              <th>Sleeper</th>
              <th>Driving</th>
              <th>On Duty</th>
            </tr>
          </thead>
          <tbody>{generateLogRows()}</tbody>
        </table>
      </div>
    );
  };

  const exportLogToCSV = () => {
    const headers = ['Hour', 'Off Duty', 'Sleeper', 'Driving', 'On Duty', 'Remarks'];
    const csvRows = [];

    for (let day = 1; day <= sheetCount; day++) {
      const dayOffset = (day - 1) * 24;

      csvRows.push([`Day ${day}`]);
      csvRows.push(headers);

      for (let hour = 0; hour < 24; hour++) {
        const globalHour = dayOffset + hour;
        const hourLabel = `${hour}:00`;

        let offDuty = 'X';
        let sleeper = '';
        let driving = '';
        let onDuty = '';

        const isPickup = globalHour === startHour;
        const isDropoff = globalHour === startHour + drivingHours + 1;
        const isRestStop = restStopHours.includes(globalHour);
        const isFuelStop = fuelStopHours.includes(globalHour);

        if (isPickup || isDropoff || isFuelStop) {
          onDuty = 'X';
          offDuty = '';
        }

        if (isRestStop) {
          offDuty = 'X';
        }

        if (
          globalHour > startHour &&
          globalHour <= startHour + drivingHours &&
          !isRestStop &&
          !isFuelStop
        ) {
          driving = 'X';
          offDuty = '';
        }

        const hourRemark = getRemarkForHour(globalHour);
        csvRows.push([hourLabel, offDuty, sleeper, driving, onDuty, hourRemark]);
      }

      csvRows.push([]);
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
        <h4>Trip Remarks</h4>
        <ul>
          {remarks.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      </div>

      {[...Array(sheetCount)].map((_, i) => renderLogSheet(i + 1))}
      <button onClick={exportLogToCSV}>Export CSV</button>
    </div>
  );
}

export default TripLog;
