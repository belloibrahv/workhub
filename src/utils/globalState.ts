import { useBookingStore } from '../store/booking';

export const initializeGlobalState = () => {
  if (!window.bookingResults) {
    window.bookingResults = [];
  }
  if (!window.currentBookingInfo) {
    window.currentBookingInfo = {
      isInFinalPage: false,
      hubDetails: { id: 0, name: '' },
      userDetails: { name: '', email: '', phone: '' },
      bookingDetails: {
        bookDate: '',
        bookStartTime: '',
        bookEndTime: '',
      },
      configDetails: { ram: '', storage: '', os: '' },
      paymentDetails: {
        paymentMode: {
          payNow: false,
          payLater: false,
        },
      },
    };
  }

  // TypeScript will now recognize useBookingStore
  const store = useBookingStore;
  
  store.subscribe((state) => {
    window.currentBookingInfo = {
      ...state.currentBooking,
      timestamp: new Date().toISOString(),
    };
  });

  store.subscribe((state, prevState) => {
    if (state.bookingHistory.length > prevState.bookingHistory.length) {
      window.bookingResults = state.bookingHistory;
    }
  });
};