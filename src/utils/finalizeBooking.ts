export const finalizeBooking = (bookingResult: BookingResult) => {
  window.bookingResults = JSON.parse(sessionStorage.getItem('bookingResults') || '[]');
  window.bookingResults.push(bookingResult);
  window.currentBookingInfo = bookingResult;

  sessionStorage.setItem('bookingResults', JSON.stringify(window.bookingResults));
};

