export interface BookingResult {
  hubLocation: string;
  bookingDate: string;
  timeSlot: string;
  userDetails: {
    name: string;
    email: string;
    occupation: string;
  };
  selectedTools: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
  totalPrice: number;
  bookingTime: string;
  bookingId: string;
}

export interface CurrentBookingInfo {
  isInFinalPage: boolean;
  currentStep: string;
  formData: {
    hubLocation?: string;
    bookingDate?: string;
    timeSlot?: string;
    userDetails?: {
      name?: string;
      email?: string;
      occupation?: string;
    };
    selectedTools?: Array<{
      id: string;
      name: string;
      quantity: number;
    }>;
  };
  isValid: boolean;
}
