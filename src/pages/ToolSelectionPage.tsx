import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tool } from '../types/Tool';

const TOOLS: Record<string, Tool[]> = {
    lekki: [
        { id: 'ram-8gb', name: 'RAM 8GB', type: 'hardware', quantity: 10 },
        { id: 'core-i7', name: 'Intel Core i7 Processor', type: 'hardware', quantity: 2 },
        { id: 'vscode', name: 'Visual Studio Code', type: 'software', quantity: 20 },
    ],
    yaba: [
        { id: 'docker', name: 'Docker', type: 'software', quantity: 12 },
        { id: 'core-i3', name: 'Intel Core i3 Processor', type: 'hardware', quantity: 5 },
    ],
};

const ToolSelectionPage: React.FC = () => {
    const { hubId } = useParams<{ hubId: string }>();
    const navigate = useNavigate();
    const availableTools = TOOLS[hubId || 'lekki'] || [];
    const [filter, setFilter] = useState<'all' | 'hardware' | 'software'>('all');
    const [selectedTools, setSelectedTools] = useState<{ [key: string]: number }>({});

    // Filter tools based on the selected category
    const filteredTools = filter === 'all'
        ? availableTools
        : availableTools.filter(tool => tool.type === filter);

    const handleToolSelect = (toolId: string, maxQuantity: number, quantity: number) => {
        if (quantity < 0 || quantity > maxQuantity) return; // Ensure valid selection
        setSelectedTools((prev) => ({
            ...prev,
            [toolId]: quantity,
        }));
    };

    const handleSubmit = () => {
        const selectedToolsList = availableTools
            .filter(tool => selectedTools[tool.id] > 0)
            .map(tool => ({
                ...tool,
                selectedQuantity: selectedTools[tool.id],
            }));

        // Save selection to global state
        window.bookingResults = {
            ...window.currentBookingInfo,
            selectedTools: selectedToolsList,
            timestamp: new Date().toISOString(),
        };

        navigate('/confirmation');
    };

    return (
        <div className="tool-selection-page">
            <h1>Select Tools for Your Hub</h1>
            <div className="filter-bar">
                <button onClick={() => setFilter('all')}>All</button>
                <button onClick={() => setFilter('hardware')}>Hardware</button>
                <button onClick={() => setFilter('software')}>Software</button>
            </div>
            <div className="tools-grid">
                {filteredTools.map((tool) => (
                    <div key={tool.id} className="tool-card">
                        <h3>{tool.name}</h3>
                        <p><strong>Type:</strong> {tool.type}</p>
                        <p><strong>Available:</strong> {tool.quantity}</p>
                        <input
                            type="number"
                            min="0"
                            max={tool.quantity}
                            value={selectedTools[tool.id] || 0}
                            onChange={(e) =>
                                handleToolSelect(tool.id, tool.quantity, Number(e.target.value))
                            }
                        />
                    </div>
                ))}
            </div>
            <button
                onClick={handleSubmit}
                className="submit-tools-btn"
                disabled={Object.values(selectedTools).every((qty) => qty === 0)}
            >
                Confirm Selection
            </button>
        </div>
    );
};

export default ToolSelectionPage;
