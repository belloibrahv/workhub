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
    isInFinalPage: false,
    currentStep: 'location',
    formData: {},
    isValid: false,
  },
  bookingHistory: loadBookingHistory(), // Initialize with localStorage data
  updateCurrentBooking: (data) =>
    set((state) => ({
      currentBooking: { ...state.currentBooking, ...data },
    })),
    addBookingResult: (result) =>
      set((state) => {
        const existingBookingIndex = state.bookingHistory.findIndex(
          (booking) =>
            booking.formData?.userDetails?.email === result.formData?.userDetails?.email &&
            booking.formData?.hubId === result.formData?.hubId &&
            booking.timestamp === result.timestamp
        );
    
        // If booking already exists, replace it; otherwise, add new booking
        const updatedHistory =
          existingBookingIndex >= 0
            ? state.bookingHistory.map((booking, index) =>
                index === existingBookingIndex ? result : booking
              )
            : [...state.bookingHistory, result];
    
        // Format and store bookings
        const formattedHistory = updatedHistory.map((booking) => ({
          ...booking,
          formData: {
            ...booking.formData,
            selectedTools: booking.formData?.selectedTools || [],
          },
        }));
    
        // Sync with storage or global variable
        localStorage.setItem('bookingResults', JSON.stringify(formattedHistory));
        window.bookingResults = formattedHistory;
    
        return { bookingHistory: formattedHistory };
      }),
    
}));
