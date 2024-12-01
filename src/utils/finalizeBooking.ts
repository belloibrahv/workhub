export const finalizeBooking = (bookingResult: any) => {
  window.bookingResults = window.bookingResults || [];
  window.bookingResults.push(bookingResult);
  window.currentBookingInfo = bookingResult;

  // Save directly to localStorage
  localStorage.setItem('bookingResults', JSON.stringify(window.bookingResults));
};
