import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './index.css';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import AppLayout from './components/AppLayout.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import Scholarships from './pages/Scholarships.jsx';
import ScholarshipDetail from './pages/ScholarshipDetail.jsx';
import Loans from './pages/Loans.jsx';
import LoanCategory from './pages/LoanCategory.jsx';
import LoanDetail from './pages/LoanDetail.jsx';
import DemoApplication from './pages/DemoApplication.jsx';
import Admin from './pages/Admin.jsx';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-sm text-slate-500">Loading FinBridge...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/profile" element={<Protected><Profile /></Protected>} />
            <Route path="/scholarships" element={<Protected><Scholarships /></Protected>} />
            <Route path="/scholarships/:id" element={<Protected><ScholarshipDetail /></Protected>} />
            <Route path="/loans" element={<Protected><Loans /></Protected>} />
            <Route path="/loans/:category" element={<Protected><LoanCategory /></Protected>} />
            <Route path="/loans/:category/:bankId" element={<Protected><LoanDetail /></Protected>} />
            <Route path="/apply/:type/:id" element={<Protected><DemoApplication /></Protected>} />
            <Route path="/admin" element={<Protected><Admin /></Protected>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
