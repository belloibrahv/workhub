export const initializeGlobalState = () => {
  // Initialize window.bookingResults
  if (!window.bookingResults) {
    window.bookingResults = [];
  }

  // Initialize window.currentBookingInfo
  if (!window.currentBookingInfo) {
    window.currentBookingInfo = {
      isInFinalPage: false,
      currentStep: 'location',
      formData: {},
      isValid: false,
    };
  }

  // Set up watchers for store changes
  useBookingStore.subscribe((state) => {
    // Update window.currentBookingInfo
    window.currentBookingInfo = {
      ...state.currentBooking,
      timestamp: new Date().toISOString(),
    };
  });

  // Update window.bookingResults when new booking is added
  useBookingStore.subscribe((state, prevState) => {
    if (state.bookingHistory.length > prevState.bookingHistory.length) {
      window.bookingResults = state.bookingHistory;
    }
  });
};
