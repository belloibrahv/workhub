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
        const updatedHistory = [...state.bookingHistory, result];
    
        // Ensure selectedTools are stored correctly
        const formattedHistory = updatedHistory.map((booking) => ({
          ...booking,
          formData: {
            ...booking.formData,
            selectedTools: booking.formData?.selectedTools || [],
          },
        }));
    
        localStorage.setItem('bookingResults', JSON.stringify(formattedHistory));
        window.bookingResults = formattedHistory;
    
        return { bookingHistory: formattedHistory };
      }),
}));
