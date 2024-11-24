import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const CONFIGURATIONS = [
  { id: 'ram-8gb', name: 'RAM 8GB', maxQuantity: 10 },
  { id: 'hdd-1tb', name: 'HDD 1TB', maxQuantity: 15 },
  { id: 'os-linux', name: 'Linux OS', maxQuantity: 20 },
];

const ToolSelectionPage: React.FC = () => {
  const { hubId } = useParams<{ hubId: string }>();
  const navigate = useNavigate();
  const [selectedConfig, setSelectedConfig] = useState<{ [key: string]: number }>({});

  const handleConfigSelect = (configId: string) => {
    setSelectedConfig((prev) => ({
      ...prev,
      [configId]: prev[configId] ? 0 : 1, // Toggle between selected (1) and unselected (0)
    }));
  };

  const handleSubmit = () => {
    const selectedConfiguration = CONFIGURATIONS.filter(
      (config) => selectedConfig[config.id] > 0
    ).map((config) => ({
      ...config,
      selectedQuantity: 1, // Always 1, as we are toggling selection
    }));

    if (!hubId) {
      alert('Invalid hub selection. Redirecting to home.');
      navigate('/');
      return;
    }

    // Save selection to global state
    const currentBooking = {
      hubId,
      selectedConfiguration,
      timestamp: new Date().toISOString(),
    };

    window.currentBookingInfo = currentBooking;
    window.bookingResults = currentBooking;

    navigate('/confirmation');
  };

  return (
    <div className="configuration-selection-page">
      <h1>Select Configuration</h1>
      <div className="configuration-grid">
        {CONFIGURATIONS.map((config) => (
          <div
            key={config.id}
            className={`configuration-card ${selectedConfig[config.id] ? 'selected' : ''}`}
            onClick={() => handleConfigSelect(config.id)}
          >
            <h3>{config.name}</h3>
            <p><strong>Available:</strong> {config.maxQuantity}</p>
            <p>{selectedConfig[config.id] ? 'Selected' : 'Click to Select'}</p>
          </div>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        className="submit-configuration-btn"
        disabled={Object.values(selectedConfig).every((qty) => qty === 0)}
      >
        Confirm Configuration
      </button>
    </div>
  );
};

export default ToolSelectionPage;
