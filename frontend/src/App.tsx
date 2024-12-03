import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HomePage } from './pages/home/HomePage';
import { DetectionPage } from './pages/detection/DetectionPage';
import { ReductionPage } from './pages/reduction/ReductionPage';
import { MembershipPage } from './pages/membership/MembershipPage';
import { OrderListPage } from './pages/order/OrderListPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { AuthProvider } from './providers/AuthProvider';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/detection" element={<DetectionPage />} />
        <Route path="/reduction" element={<ReductionPage />} />
        <Route path="/membership" element={<MembershipPage />} />
        <Route path="/orders" element={<OrderListPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;