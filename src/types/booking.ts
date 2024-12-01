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
  paymentDetails: {
    paymentMode: {
      payNow: boolean;
      payLater: boolean;
    };
    cardDetails: {
      cardNumber: string;
      expiryDate: string;
      cvv: string;
    };
  };
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
