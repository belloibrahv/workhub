import { create } from 'zustand';
import { BookingResult, CurrentBookingInfo } from '@/types/booking';

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
  bookingHistory: [],
  updateCurrentBooking: (data) =>
    set((state) => ({
      currentBooking: { ...state.currentBooking, ...data },
    })),
  addBookingResult: (result) =>
    set((state) => ({
      bookingHistory: [...state.bookingHistory, result],
    })),
}));
