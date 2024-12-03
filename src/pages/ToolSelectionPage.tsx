import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBookingStore } from '../store/booking';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Stack,
  CircularProgress,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMemory, faHdd, faDesktop } from '@fortawesome/free-solid-svg-icons';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

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
  const { currentBooking, updateCurrentBooking } = useBookingStore();

  const [selectedConfig, setSelectedConfig] = useState({
    ram: '',
    storage: '',
    os: '',
  });
  const [loading, setLoading] = useState(false);

  // Load existing configuration or initialize defaults
  useEffect(() => {
    const existingBooking = window.currentBookingInfo || {};
    const { configDetails = {} } = existingBooking;

    setSelectedConfig({
      ram: configDetails.ram || '',
      storage: configDetails.storage || '',
      os: configDetails.os || '',
    });

    // Ensure global variable includes hub and user details
    window.currentBookingInfo = {
      ...existingBooking,
      hubDetails: existingBooking.hubDetails || { id: hubId, name: `Hub ${hubId}` },
    };
  }, [hubId]);

  // Sync selected configuration to global variable in real-time
  useEffect(() => {
    window.currentBookingInfo = {
      ...window.currentBookingInfo,
      configDetails: selectedConfig,
    };
  }, [selectedConfig]);

  // Handle configuration selection
  const handleSelect = (category: 'ram' | 'storage' | 'os', value: string) => {
    setSelectedConfig((prev) => ({
      ...prev,
      [category]: prev[category] === value ? '' : value,
    }));
  };

  // Submit configuration and navigate to confirmation page
  const handleSubmit = async () => {
    if (!selectedConfig.ram || !selectedConfig.storage || !selectedConfig.os) {
      alert('Please select RAM, Storage, and Operating System.');
      return;
    }

    if (!hubId) {
      alert('Invalid hub selection. Please start your booking again.');
      navigate('/');
      return;
    }

    setLoading(true);
    try {
      const updatedBooking = {
        ...window.currentBookingInfo,
        configDetails: selectedConfig,
        isInFinalPage: false,
      };

      // Update store and global state
      updateCurrentBooking(updatedBooking);
      window.currentBookingInfo = updatedBooking;

      // Navigate to confirmation page
      navigate('/confirmation');
    } catch (error) {
      console.error('Error during submission:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get the label of a selected configuration
  const getSelectedLabel = (category: 'ram' | 'storage' | 'os') => {
    const selectedValue = selectedConfig[category];
    const option = CONFIGURATIONS[category].find((opt) => opt.value === selectedValue);
    return option ? option.label : 'Not Selected';
  };

  // Render configuration section
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
              textTransform: 'none',
            }}
            startIcon={
              <FontAwesomeIcon
                icon={category === 'ram' ? faMemory : category === 'storage' ? faHdd : faDesktop}
              />
            }
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
                <Typography>RAM: {getSelectedLabel('ram')}</Typography>
                <Typography>Storage: {getSelectedLabel('storage')}</Typography>
                <Typography>OS: {getSelectedLabel('os')}</Typography>
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
            disabled={loading}
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
