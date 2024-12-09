import { BookingResult, CurrentBookingInfo } from './types/booking'

export {};

declare global {
  interface Window {
    bookingResults: BookingResult,
    currentBookingInfo: CurrentBookingInfo,
  }
}
