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
    
        // Update localStorage and window.bookingResults with specific structure
        localStorage.setItem('bookingResults', JSON.stringify(updatedHistory));
        
        window.bookingResults = updatedHistory.map(booking => ({
          user: {
            name: booking.formData?.userDetails?.fullName || '',
            email: booking.formData?.userDetails?.email || '',
          },
          configuration: {
            RAM: booking.formData?.selectedTools?.find(tool => tool.type === 'ram')?.label || '4GB',
            Storage: booking.formData?.selectedTools?.find(tool => tool.type === 'storage')?.label || '500GB',
            'Operating system': booking.formData?.selectedTools?.find(tool => tool.type === 'os')?.label || 'windows',
          },
          PaymentMethod: {
            payNow: booking.formData?.payment?.payNow || false,
            payLater: !booking.formData?.payment?.payNow || false,
          },
          PaymentDetails: {
            'card number': booking.formData?.payment?.cardNumber || '',
            'expiry date': booking.formData?.payment?.expiryDate || '',
            cvv: booking.formData?.payment?.cvv || '',
          },
          IsFinalPage: booking.isInFinalPage || false,
        }));
    
        return { bookingHistory: updatedHistory };
      }), 
}));
