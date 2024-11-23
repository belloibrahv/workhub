import React, { useState } from 'react';
import { useBookingStore } from '../store/booking';

const BookingHistoryPage: React.FC = () => {
    const { bookingHistory } = useBookingStore();
    const [filter, setFilter] = useState({
        hubId: 'all',
        paymentStatus: 'all',
        startDate: '',
        endDate: '',
    });
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

    // Filtered bookings based on criteria
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

    return (
        <div className="booking-history-page">
            <h1>Your Booking History</h1>
            <div className="filter-bar">
                <select name="hubId" value={filter.hubId} onChange={handleFilterChange}>
                    <option value="all">All Hubs</option>
                    <option value="lekki">Lekki</option>
                    <option value="yaba">Yaba</option>
                    <option value="sango">Sango</option>
                </select>
                <select name="paymentStatus" value={filter.paymentStatus} onChange={handleFilterChange}>
                    <option value="all">All Status</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                </select>
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
                <select name="sortOrder" value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}>
                    <option value="newest">Newest to Oldest</option>
                    <option value="oldest">Oldest to Newest</option>
                </select>
            </div>
            <ul className="booking-list">
                {filteredBookings.map((booking, index) => (
                    <li key={index} className="booking-item">
                        <h2>Hub: {booking.hubId}</h2>
                        <p><strong>Date:</strong> {new Date(booking.timestamp).toLocaleString()}</p>
                        <h3>Tools Selected:</h3>
                        <ul>
                            {booking.selectedTools.map((tool: any) => (
                                <li key={tool.id}>
                                    {tool.name} (x{tool.selectedQuantity})
                                </li>
                            ))}
                        </ul>
                        <p><strong>Payment Status:</strong> {booking.payment ? "Paid" : "Pending"}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BookingHistoryPage;
