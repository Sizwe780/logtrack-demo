import React, { useState } from 'react';
import Home from './pages/Home';
import TripList from './TripList';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('submit');

  return (
    <div className="app-container">
      <nav className="top-nav">
        <span
          className={`tab ${activeTab === 'submit' ? 'active' : ''}`}
          onClick={() => setActiveTab('submit')}
        >
          Home
        </span>
        <span
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </span>
      </nav>

      {activeTab === 'submit' && <Home setActiveTab={setActiveTab} />}
      {activeTab === 'dashboard' && <TripList />}

    </div>
  );
}

export default App;