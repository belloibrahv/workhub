import { create } from 'zustand';
import { BookingResult, CurrentBookingInfo } from '@/types/booking';

// Load initial data from localStorage
const loadBookingHistory = (): BookingResult[] => {
  const storedData = localStorage.getItem('bookingResults');
  return storedData ? JSON.parse(storedData) : [];
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
      const updatedHistory = [...state.bookingHistory, result];
      
      // Sync with storage and global variable
      localStorage.setItem('bookingResults', JSON.stringify(updatedHistory));
      window.bookingResults = updatedHistory;

      return { bookingHistory: updatedHistory };
    }),
}));
