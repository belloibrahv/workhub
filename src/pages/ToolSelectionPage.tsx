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
    { id: 'ram-4', value: '4GB', label: '4GB' },
    { id: 'ram-8', value: '8GB', label: '8GB' },
    { id: 'ram-16', value: '16GB', label: '16GB' },
    { id: 'ram-32', value: '32GB', label: '32GB' },
    { id: 'ram-64', value: '64GB', label: '64GB' },
  ],
  storage: [
    { id: 'hdd-320', value: '320GB', label: '320GB' },
    { id: 'hdd-500', value: '500GB', label: '500GB' },
    { id: 'hdd-1000', value: '1TB', label: '1TB' },
    { id: 'hdd-2000', value: '2TB', label: '2TB' },
  ],
  os: [
    { id: 'os-windows', value: 'Windows', label: 'Windows' },
    { id: 'os-linux', value: 'Linux', label: 'Linux' },
    { id: 'os-macos', value: 'MacOs', label: 'MacOS' },
  ],
};

const ToolSelectionPage: React.FC = () => {
  const { hubId } = useParams<{ hubId: string }>();
  const navigate = useNavigate();
  const { updateCurrentBooking } = useBookingStore();

  const [selectedConfig, setSelectedConfig] = useState({
    ram: '',
    storage: '',
    os: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const existingBooking = window.currentBookingInfo || {};
    const { configDetails = {}, hubDetails = {} } = existingBooking;

    setSelectedConfig({
      ram: configDetails.ram || '',
      storage: configDetails.storage || '',
      os: configDetails.os || '',
    });

    // Ensure global state is initialized
    window.currentBookingInfo = {
      ...existingBooking,
      hubDetails: hubDetails.id ? hubDetails : { id: hubId, name: `Hub ${hubId}` },
      configDetails: configDetails || {},
      isInFinalPage: false,
    };

    sessionStorage.setItem('currentBookingInfo', JSON.stringify(window.currentBookingInfo));
  }, [hubId]);

  useEffect(() => {
    // Real-time sync of selected config
    window.currentBookingInfo = {
      ...window.currentBookingInfo,
      configDetails: selectedConfig,
    };
    sessionStorage.setItem('currentBookingInfo', JSON.stringify(window.currentBookingInfo));
  }, [selectedConfig]);

  const handleSelect = (category: 'ram' | 'storage' | 'os', value: string) => {
    setSelectedConfig((prev) => ({
      ...prev,
      [category]: prev[category] === value ? '' : value, // Toggle selection
    }));
  };

  const handleSubmit = () => {
    if (!selectedConfig.ram || !selectedConfig.storage || !selectedConfig.os) {
      alert('Please select RAM, Storage, and Operating System.');
      return;
    }

    setLoading(true);
    try {
      // Finalize currentBooking state
      window.currentBookingInfo = {
        ...window.currentBookingInfo,
        configDetails: selectedConfig,
      };
      sessionStorage.setItem('currentBookingInfo', JSON.stringify(window.currentBookingInfo));

      updateCurrentBooking(window.currentBookingInfo);
      navigate('/confirmation');
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedLabel = (category: 'ram' | 'storage' | 'os') => {
    const selectedValue = selectedConfig[category];
    return CONFIGURATIONS[category].find((opt) => opt.value === selectedValue)?.label || 'Not Selected';
  };

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
