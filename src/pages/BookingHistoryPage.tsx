import React, { useEffect, useState } from 'react';
import { useBookingStore } from '../store/booking';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faCalendarAlt, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const BookingHistoryPage: React.FC = () => {
  const { bookingHistory } = useBookingStore(); // Fetch bookings from zustand store
  const [filter, setFilter] = useState({
    hubId: 'all',
    paymentStatus: 'all',
    startDate: '',
    endDate: '',
  });
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Populate global variable for browser testing
  useEffect(() => {
    // Populate global variable for browser testing
    window.bookingResults = bookingHistory.map(booking => ({
      user: {
        name: booking.formData?.userDetails?.fullName || '',
        email: booking.formData?.userDetails?.email || '',
      },
      configuration: {
        RAM: booking.formData?.selectedTools?.find(tool => tool.type === 'ram' || tool.type.includes('ram'))?.label || '4GB',
        Storage: booking.formData?.selectedTools?.find(tool => tool.type === 'storage' || tool.type.includes('hdd'))?.label || '500GB',
        'Operating system': booking.formData?.selectedTools?.find(tool => tool.type === 'os' || tool.type.includes('os'))?.label || 'Windows',
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
    
  }, [bookingHistory]);
  const filteredBookings = bookingHistory
    .filter((booking) => {
      if (filter.hubId !== 'all' && booking.hubId !== filter.hubId) return false;
      if (filter.paymentStatus !== 'all' && Boolean(booking.payment) !== (filter.paymentStatus === 'Paid')) return false;
      if (filter.startDate && new Date(booking.timestamp) < new Date(filter.startDate)) return false;
      if (filter.endDate && new Date(booking.timestamp) > new Date(filter.endDate)) return false;
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return sortOrder === 'newest' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
    });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  // Refactor to display configuration in the key-value format
  const renderConfigurationDetails = (configurations: any[]) => {
    if (!configurations || configurations.length === 0) {
      return <p>No configuration details available.</p>;
    }
  
    // Create a map to easily lookup configurations
    const configMap = configurations.reduce((acc, config) => {
      // Normalize the type to match our expected types
      let type = config.type;
      if (type.includes('ram')) type = 'ram';
      if (type.includes('hdd')) type = 'storage';
      if (type.includes('os')) type = 'os';
  
      acc[type] = config.label;
      return acc;
    }, {} as Record<string, string>);
  
    return (
      <div className="formatted-configuration">
        <p><strong>RAM:</strong> <span>{configMap.ram || 'Not Selected'}</span></p>
        <p><strong>Storage:</strong> <span>{configMap.storage || 'Not Selected'}</span></p>
        <p><strong>Operating System:</strong> <span>{configMap.os || 'Not Selected'}</span></p>
      </div>
    );
  }; 

  return (
    <div className="booking-history-page">
      <h1>Your Booking History</h1>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <FontAwesomeIcon icon={faFilter} />
          <select name="hubId" value={filter.hubId} onChange={handleFilterChange}>
            <option value="all">All Hubs</option>
            <option value="lekki">Lekki</option>
            <option value="yaba">Yaba</option>
            <option value="sango">Sango</option>
          </select>
        </div>

        <div className="filter-group">
          <FontAwesomeIcon icon={faCheckCircle} />
          <select name="paymentStatus" value={filter.paymentStatus} onChange={handleFilterChange}>
            <option value="all">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <div className="filter-group">
          <FontAwesomeIcon icon={faCalendarAlt} />
          <input
            type="date"
            name="startDate"
            value={filter.startDate}
            onChange={handleFilterChange}
            placeholder="Start Date"
          />
          <input
            type="date"
            name="endDate"
            value={filter.endDate}
            onChange={handleFilterChange}
            placeholder="End Date"
          />
        </div>

        <select
          name="sortOrder"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
        >
          <option value="newest">Newest to Oldest</option>
          <option value="oldest">Oldest to Newest</option>
        </select>
      </div>

      {/* Booking List */}
      {filteredBookings.length > 0 ? (
        <ul className="booking-list">
          {filteredBookings.map((booking, index) => (
            <li key={index} className="booking-item">
              <div className="booking-header">
                <h2>{booking.hubId} Hub</h2>
                <p className="booking-date">
                  <strong>Date:</strong> {new Date(booking.timestamp).toLocaleString()}
                </p>
              </div>

              <h3>Selected Configuration</h3>
              {renderConfigurationDetails(booking.selectedTools)}

              <p>
                <strong>Payment Status: </strong>
                <span className={`payment-status ${booking.payment ? 'paid' : 'pending'}`}>
                  <FontAwesomeIcon icon={booking.payment ? faCheckCircle : faTimesCircle} />
                  {booking.payment ? ' Paid' : ' Pending'}
                </span>
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No bookings found.</p>
      )}
    </div>
  );
};

export default BookingHistoryPage;
