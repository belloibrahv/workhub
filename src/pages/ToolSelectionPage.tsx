import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBookingStore } from '../store/booking';
import { Box, Button, Typography, Card, CardContent, Stack, IconButton, CircularProgress } from '@mui/material';
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

  // Load previously selected configurations (if available)
  useEffect(() => {
    // Check if configDetails exist in current booking
    if (currentBooking?.configDetails) {
      setSelectedConfig({
        ram: currentBooking.configDetails.ram,
        storage: currentBooking.configDetails.storage,
        os: currentBooking.configDetails.os
      });
    }
  }, [currentBooking]);

  // Load previously selected configurations (if available)
  useEffect(() => {
    // Check if configDetails exist in current booking
    if (currentBooking?.configDetails) {
      setSelectedConfig({
        ram: currentBooking.configDetails.ram,
        storage: currentBooking.configDetails.storage,
        os: currentBooking.configDetails.os
      });
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
    // Load previously selected configurations (if available)
    useEffect(() => {
      // Check if configDetails exist in current booking
      if (currentBooking?.configDetails) {
        setSelectedConfig({
          ram: currentBooking.configDetails.ram,
          storage: currentBooking.configDetails.storage,
          os: currentBooking.configDetails.os
        });
      }
    }, [currentBooking]);
  
    // Submit the selected configuration
    const handleSubmit = async () => {
      // Comprehensive validation
      if (!selectedConfig.ram || !selectedConfig.storage || !selectedConfig.os) {
        alert('Please select RAM, Storage, and Operating System');
        return;
      }
  
      if (!hubId) {
        alert('Invalid hub selection. Please start your booking again.');
        navigate('/');
        return;
      }
  
      setLoading(true);
  
      try {
        // Prepare the updated booking info
        const updatedBooking = {
          ...currentBooking,
          configDetails: {
            ram: selectedConfig.ram,
            storage: selectedConfig.storage,
            os: selectedConfig.os
          },
          hubDetails: {
            ...currentBooking.hubDetails,
            id: hubId // Ensure hubId is preserved
          },
          isInFinalPage: false
        };
  
        // Validate booking before updating
  
        // Update the booking store
        updateCurrentBooking(updatedBooking);
        
        // Update the global currentBookingInfo 
        window.currentBookingInfo = updatedBooking;
  
        // Navigate to confirmation page
        navigate('/confirmation');
      } catch (error) {
        alert('An error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
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
                <Stack direction="row" spacing={1} alignItems="center">
                  <FontAwesomeIcon icon={faMemory} />
                  <Typography>RAM: {getSelectedLabel('ram')}</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <FontAwesomeIcon icon={faHdd} />
                  <Typography>Storage: {getSelectedLabel('storage')}</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <FontAwesomeIcon icon={faDesktop} />
                  <Typography>OS: {getSelectedLabel('os')}</Typography>
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