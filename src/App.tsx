import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import HubDetailPage from './pages/HubDetailPage';
import CheckinPage from './pages/CheckinPage';
import ToolSelectionPage from './pages/ToolSelectionPage';
import ConfirmationPage from './pages/ConfirmationPage';
import BookingHistoryPage from '@/pages/BookingHistoryPage';
import Footer from '@/components/Footer';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/hub/:hubId" element={<HubDetailPage />} />
          <Route path="/checkin/:hubId" element={<CheckinPage />} />
          <Route path="/tools/:hubId" element={<ToolSelectionPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/history" element={<BookingHistoryPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App;