export interface BookingResult {
  timestamp?: string;
  isInFinalPage;
  hubDetails: {
    id: number;
    name: string;
  };
  userDetails: {
    name: string;
    email: string;
    phone: string;
    // ageRange: string;
  };
  bookingDetails: {
    bookDate: string;
    bookStartTime: string;
    bookEndTime: string;
    totalBookPrice: string;
    totalBookHours: string;
    bookPrice: string;
  };
  configDetails: {
    ram: string;
    storage: string;
    os: string;
  };
  paymentDetails: {
    paymentMode: {
      payNow: boolean;
      payLater: boolean;
    };
    cardDetails?: {
      cardNumber: string;
      expiryDate: string;
      cvv: string;
    };
  };
}

export interface CurrentBookingInfo {
  hubDetails: {
    id: number;
    name: string;
  };
  userDetails: {
    name: string;
    email: string;
    phone: string;
  };
  bookingDetails: {
    bookDate: string;
    bookStartTime: string;
    bookEndTime: string;
    totalBookPrice?: string;
    totalBookHours?: string;
    bookPrice?: string;
  };
  configDetails: {
    ram: string;
    storage: string;
    os: string;
  };
  paymentDetails: {
    paymentMode: {
      payNow: boolean;
      payLater: boolean;
    };
    cardDetails?: {
      cardNumber: string;
      expiryDate: string;
      cvv: string;
    };
  };
  isInFinalPage: boolean;
}
