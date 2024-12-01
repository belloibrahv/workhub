import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBookingStore } from '../store/booking';
import { Box, Button, Typography, Card, CardContent, Divider, Stack, IconButton, Chip, CircularProgress } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMemory, faHdd, faDesktop } from '@fortawesome/free-solid-svg-icons';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Hub } from '../types/Hub';

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
  const [loading, setLoading] = useState(false);

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
  const handleSubmit = async () => {
    setLoading(true);
  
    // Map selected configurations to tools array
    const selectedConfiguration = [
      CONFIGURATIONS.ram.find((r) => r.value === selectedConfig.ram),
      CONFIGURATIONS.storage.find((s) => s.value === selectedConfig.storage),
      CONFIGURATIONS.os.find((o) => o.value === selectedConfig.os),
    ].filter(Boolean).map((config) => ({
      type: config.id.split('-')[0], // Extract type ('ram', 'storage', 'os')
      label: config.label,
      value: config.value,
    }));
  
    if (!hubId) {
      alert('Invalid hub selection. Redirecting to home.');
      navigate('/');
      return;
    }
  
    // Update currentBooking state
    const updatedBooking = {
      ...currentBooking,
      formData: {
        ...currentBooking.formData,
        selectedTools: selectedConfiguration,
      },
      currentStep: 'confirmation',
      isInFinalPage: false,
    };
  
    // Save to global `currentBookingInfo` and local state
    updateCurrentBooking(updatedBooking);
    window.currentBookingInfo = updatedBooking;  // For debugging and finalization
  
    setLoading(false);
    navigate('/confirmation');
  };
  

  // Get the label of the selected configuration option
  const getSelectedLabel = (category: 'ram' | 'storage' | 'os') => {
    const selectedValue = selectedConfig[category];
    const option = CONFIGURATIONS[category].find((opt) => opt.value === selectedValue);
    return option ? option.label : 'Not Selected';
  };

  // Render configuration sections
  const renderConfigSection = (
    title: string,
    options: typeof CONFIGURATIONS.ram,
    category: 'ram' | 'storage' | 'os'
  ) => (
    <Box sx={{ marginBottom: 4 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Stack direction="row" spacing={2} flexWrap="wrap">
        {options.map((option) => (
          <Button
            key={option.id}
            variant={selectedConfig[category] === option.value ? 'contained' : 'outlined'}
            color={selectedConfig[category] === option.value ? 'primary' : 'default'}
            onClick={() => handleSelect(category, option.value)}
            sx={{
              minWidth: 120,
              height: 50,
              borderRadius: 3,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              textTransform: 'none',
            }}
            startIcon={<FontAwesomeIcon icon={category === 'ram' ? faMemory : category === 'storage' ? faHdd : faDesktop} />}
          >
            {option.label}
          </Button>
        ))}
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Select Your Tools Configuration
      </Typography>
      <Box sx={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" gutterBottom>
            Your Current Configuration
          </Typography>
          <Card>
            <CardContent>
              <Stack direction="column" spacing={2}>
                <Stack direction="row" spacing={1}>
                  <FontAwesomeIcon icon={faMemory} />
                  <Typography>{getSelectedLabel('ram')}</Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <FontAwesomeIcon icon={faHdd} />
                  <Typography>{getSelectedLabel('storage')}</Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <FontAwesomeIcon icon={faDesktop} />
                  <Typography>{getSelectedLabel('os')}</Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: 2 }}>
          {renderConfigSection('RAM', CONFIGURATIONS.ram, 'ram')}
          {renderConfigSection('Storage', CONFIGURATIONS.storage, 'storage')}
          {renderConfigSection('Operating System', CONFIGURATIONS.os, 'os')}

          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            fullWidth
            disabled={!selectedConfig.ram || !selectedConfig.storage || !selectedConfig.os || loading}
            sx={{ marginTop: 3 }}
            endIcon={loading ? <CircularProgress size={24} color="inherit" /> : <ArrowForwardIcon />}
          >
            {loading ? 'Submitting...' : 'Confirm Configuration'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ToolSelectionPage;
