import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import CheckoutPage from './pages/CheckoutPage';
import BlogPost from './pages/BlogPost';
import AdminDashboard from './pages/AdminDashboard';
import BlogEditor from './pages/BlogEditor';
import GlobalFooter from './components/GlobalFooter';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/blog/:id" element={<BlogEditor />} />
            </Routes>
          </div>
          <GlobalFooter />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
