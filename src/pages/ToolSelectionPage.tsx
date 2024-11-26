import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBookingStore } from '../store/booking';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMemory, faHdd, faDesktop } from '@fortawesome/free-solid-svg-icons';

const CONFIGURATIONS = {
  ram: [
    { id: 'ram-4', value: '4', label: '4GB' },
    { id: 'ram-8', value: '8', label: '8GB' },
    { id: 'ram-16', value: '16', label: '16GB' },
    { id: 'ram-32', value: '32', label: '32GB' },
    { id: 'ram-64', value: '64', label: '64GB' },
  ],
  storage: [
    { id: 'hdd-320', value: '320', label: '320GB' },
    { id: 'hdd-500', value: '500', label: '500GB' },
    { id: 'hdd-1000', value: '1', label: '1TB' },
    { id: 'hdd-2000', value: '2', label: '2TB' },
  ],
  os: [
    { id: 'os-windows', value: 'windows', label: 'Windows' },
    { id: 'os-linux', value: 'linux', label: 'Linux' },
    { id: 'os-macos', value: 'macos', label: 'MacOS' },
  ],
};

const ToolSelectionPage: React.FC = () => {
  const { hubId } = useParams<{ hubId: string }>();
  const navigate = useNavigate();
  const { currentBooking, updateCurrentBooking, addBookingResult } = useBookingStore();

  const [selectedConfig, setSelectedConfig] = useState({
    ram: '',
    storage: '',
    os: '',
  });

  // Load previously selected configurations (if available)
  useEffect(() => {
    if (currentBooking?.formData?.selectedTools) {
      const previousSelection = currentBooking.formData.selectedTools.reduce((acc, tool) => {
        acc[tool.type] = tool.value;
        return acc;
      }, {} as Record<string, string>);
      setSelectedConfig(previousSelection);
    }
  }, [currentBooking]);

  // Handle configuration selection
  const handleSelect = (category: 'ram' | 'storage' | 'os', value: string) => {
    setSelectedConfig((prev) => ({
      ...prev,
      [category]: prev[category] === value ? '' : value,
    }));
  };

  // Submit the selected configuration
  const handleSubmit = () => {
    const selectedConfiguration = [
      CONFIGURATIONS.ram.find(r => r.value === selectedConfig.ram),
      CONFIGURATIONS.storage.find(s => s.value === selectedConfig.storage),
      CONFIGURATIONS.os.find(o => o.value === selectedConfig.os)
    ].filter(Boolean).map(config => ({
      type: config.id.split('-')[0], // 'ram', 'hdd', 'os'
      label: config.label,
      value: config.value
    }));
  
    if (!hubId) {
      alert('Invalid hub selection. Redirecting to home.');
      navigate('/');
      return;
    }
  
    const updatedBooking = {
      ...currentBooking,
      formData: {
        ...currentBooking.formData,
        selectedTools: selectedConfiguration,
      },
      currentStep: 'confirmation',
      isInFinalPage: false,
    };
  
    // Save the booking to global state and localStorage
    updateCurrentBooking(updatedBooking);
    addBookingResult(updatedBooking);
  
    // Update the global variable for browser debugging
    window.currentBookingInfo = updatedBooking;
  
    navigate('/confirmation');
  };

  // Get the label of the selected configuration option
  const getSelectedLabel = (category: 'ram' | 'storage' | 'os') => {
    const selectedValue = selectedConfig[category];
    const option = CONFIGURATIONS[category].find((opt) => opt.value === selectedValue);
    return option ? option.label : 'Not Selected';
  };

  // Render configuration sections
  const renderConfigSection = (title: string, options: typeof CONFIGURATIONS.ram, category: 'ram' | 'storage' | 'os') => (
    <div className="config-section">
      <h3 className="section-title">{title}</h3>
      <div className="options-grid">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(category, option.value)}
            className={`option-button ${selectedConfig[category] === option.value ? 'selected' : ''}`}
          >
            <FontAwesomeIcon icon={category === 'ram' ? faMemory : category === 'storage' ? faHdd : faDesktop} />
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="configuration-selection-page">
      <h1>Select Configuration</h1>
      <div className="main-container">
        <div className="preview-section">
          <div className="preview-content">
            <h2>Your Configuration</h2>
            <div className="preview-details">
              <div className="preview-item">
                <FontAwesomeIcon icon={faMemory} className="preview-icon" />
                <div className="preview-info">
                  <label>Memory</label>
                  <span>{getSelectedLabel('ram')}</span>
                </div>
              </div>
              <div className="preview-item">
                <FontAwesomeIcon icon={faHdd} className="preview-icon" />
                <div className="preview-info">
                  <label>Storage</label>
                  <span>{getSelectedLabel('storage')}</span>
                </div>
              </div>
              <div className="preview-item">
                <FontAwesomeIcon icon={faDesktop} className="preview-icon" />
                <div className="preview-info">
                  <label>Operating System</label>
                  <span>{getSelectedLabel('os')}</span>
                </div>
              </div>
            </div>
            <div className="preview-summary">
              {Object.values(selectedConfig).every((value) => value) ? (
                <div className="complete-message">Configuration Complete!</div>
              ) : (
                <div className="incomplete-message">
                  Please select {3 - Object.values(selectedConfig).filter(Boolean).length} more options
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="options-container">
          {renderConfigSection('RAM', CONFIGURATIONS.ram, 'ram')}
          {renderConfigSection('Storage', CONFIGURATIONS.storage, 'storage')}
          {renderConfigSection('Operating System', CONFIGURATIONS.os, 'os')}
          <button
            onClick={handleSubmit}
            disabled={!selectedConfig.ram || !selectedConfig.storage || !selectedConfig.os}
            className="submit-button"
          >
            Confirm Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToolSelectionPage;
