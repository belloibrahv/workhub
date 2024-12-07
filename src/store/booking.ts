import { create } from 'zustand';
import { BookingResult, CurrentBookingInfo } from '@/types/booking';

// Load initial data from sessionStorage and initialize window.bookingResults
const loadBookingHistory = (): BookingResult[] => {
  const storedData = sessionStorage.getItem('bookingResults');
  const parsedData = storedData ? JSON.parse(storedData) : [];
  window.bookingResults = parsedData; // Synchronize with global variable
  return parsedData;
};

interface BookingStore {
  currentBooking: CurrentBookingInfo;
  bookingHistory: BookingResult[];
  updateCurrentBooking: (data: Partial<CurrentBookingInfo>) => void;
  addBookingResult: (result: BookingResult) => void;
}

export const useBookingStore = create<BookingStore>((set) => ({
  currentBooking: {
    hubDetails: { id: 0, name: '' },
    userDetails: { name: '', email: '', phone: '', ageRange: '' },
    bookingDetails: { bookDate: '', bookStartTime: '', bookEndTime: '' },
    configDetails: { ram: '', storage: '', os: '' },
    paymentDetails: {
      paymentMode: { payNow: false, payLater: false },
      cardDetails: { cardNumber: '', expiryDate: '', cvv: '' }
    },
    isInFinalPage: false,
  },
  bookingHistory: loadBookingHistory(),
  updateCurrentBooking: (data) =>
    set((state) => ({
      currentBooking: { ...state.currentBooking, ...data },
    })),
  addBookingResult: (result) =>
    set((state) => {
      const isDuplicate = window.bookingResults.some(
        (existingBooking: BookingResult) =>
          existingBooking.hubDetails.id === result.hubDetails.id &&
          existingBooking.bookingDetails.bookDate === result.bookingDetails.bookDate &&
          existingBooking.bookingDetails.bookStartTime === result.bookingDetails.bookStartTime &&
          existingBooking.bookingDetails.bookEndTime === result.bookingDetails.bookEndTime
      );

      if (!isDuplicate) {
        window.bookingResults.push(result);
        sessionStorage.setItem('bookingResults', JSON.stringify(window.bookingResults));
      }

      const updatedHistory = [...state.bookingHistory, result];
      sessionStorage.setItem('bookingResults', JSON.stringify(updatedHistory));
      return { bookingHistory: updatedHistory };
    }),
}));
