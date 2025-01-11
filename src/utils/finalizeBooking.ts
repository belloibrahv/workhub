import { BookingResult } from "@/types";

export const finalizeBooking = (bookingResult: BookingResult) => {
  // Retrieve existing booking results from sessionStorage
  const existingResults = JSON.parse(sessionStorage.getItem('bookingResults') || '[]');

  // Destructure the bookingResult to get hubDetails and remove the `id` from hubDetails
  const { hubDetails , ...restBookingData } = bookingResult;

  // Remove `id` from `hubDetails`
  const { id, ...hubDetailsWithoutId } = hubDetails;

  // Create the new booking result object without the `id` in `hubDetails`
  const updatedBookingResult = {
    ...restBookingData,
    hubDetails: hubDetailsWithoutId, // Exclude the id here
  };

  // Add the updated booking result to the existing results
  existingResults.push(updatedBookingResult);

  // Update window.bookingResults and window.currentBookingInfo
  window.bookingResults = existingResults;
  window.currentBookingInfo = bookingResult; // Retain `id` in currentBookingInfo

  // Persist the updated results and booking information to sessionStorage
  sessionStorage.setItem('bookingResults', JSON.stringify(window.bookingResults));
  sessionStorage.setItem('currentBookingInfo', JSON.stringify(window.currentBookingInfo));
};
