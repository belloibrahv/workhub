import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tool } from '../types/Tool';

// Predefined tools for different hubs
const TOOLS: Record<string, Tool[]> = {
  'lekki': [
    { id: 'ram-8gb', name: 'RAM 8GB', type: 'hardware', quantity: 10 },
    { id: 'ram-16gb', name: 'RAM 16GB', type: 'hardware', quantity: 5 },
    { id: 'core-i5', name: 'Intel Core i5 Processor', type: 'hardware', quantity: 3 },
    { id: 'core-i7', name: 'Intel Core i7 Processor', type: 'hardware', quantity: 2 },
    { id: 'vscode', name: 'Visual Studio Code', type: 'software', quantity: 20 },
    { id: 'photoshop', name: 'Adobe Photoshop', type: 'software', quantity: 5 }
  ],
  'sango': [
    { id: 'ram-4gb', name: 'RAM 4GB', type: 'hardware', quantity: 8 },
    { id: 'ram-8gb', name: 'RAM 8GB', type: 'hardware', quantity: 5 },
    { id: 'core-i3', name: 'Intel Core i3 Processor', type: 'hardware', quantity: 4 },
    { id: 'github', name: 'GitHub Desktop', type: 'software', quantity: 15 },
    { id: 'figma', name: 'Figma', type: 'software', quantity: 10 }
  ]
};

const ToolSelectionPage: React.FC = () => {
  const { hubId } = useParams<{ hubId: string }>();
  const navigate = useNavigate();

  const [selectedTools, setSelectedTools] = useState<{[key: string]: number}>({});

  const availableTools = TOOLS[hubId || 'lekki'] || [];

  const handleToolSelect = (toolId: string, quantity: number) => {
    setSelectedTools(prev => ({
      ...prev,
      [toolId]: quantity
    }));
  };

  const handleSubmit = () => {
    // Prepare booking results for model training
    window.currentBookingInfo = {
      hubId,
      selectedTools: selectedTools,
      isInFinalPage: true
    };

    window.bookingResults = {
      status: 'success',
      hubId,
      selectedTools,
      timestamp: new Date().toISOString()
    };

    // Navigate to confirmation or next step
    navigate('/confirmation');
  };

  return (
    <div className="tool-selection-page">
      <h1>Select Your Tools</h1>
      <div className="tools-grid">
        {availableTools.map(tool => (
          <div key={tool.id} className="tool-card">
            <h3>{tool.name}</h3>
            <p>Type: {tool.type}</p>
            <p>Available: {tool.quantity}</p>
            <div className="tool-quantity-selector">
              <input
                type="number"
                min="0"
                max={tool.quantity}
                value={selectedTools[tool.id] || 0}
                onChange={(e) => handleToolSelect(tool.id, Number(e.target.value))}
              />
            </div>
          </div>
        ))}
      </div>
      <button 
        onClick={handleSubmit} 
        className="submit-tools-btn"
        disabled={Object.values(selectedTools).every(qty => qty === 0)}
      >
        Confirm Tool Selection
      </button>
    </div>
  );
};

export default ToolSelectionPage;
