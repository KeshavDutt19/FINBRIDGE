import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';

import './index.css';

import {
  AuthProvider,
  useAuth,
} from './context/AuthContext.jsx';

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

function LoadingScreen() {
  return (
    <div className="p-8 text-sm text-slate-500">
      Loading FinBridge...
    </div>
  );
}

function UserOnly({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login/user" replace />;
  }

  if (user.userType === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

function AdminOnly({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login/admin" replace />;
  }

  if (user.userType !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function ProtectedRedirect() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <Navigate
        to="/login/user"
        replace
        state={{ from: location }}
      />
    );
  }

  if (user.userType === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

ReactDOM.createRoot(
  document.getElementById('root')
).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AppLayout />}>

            {/* Landing */}
            <Route
              path="/"
              element={<Landing />}
            />

            {/* Login portals */}
            <Route
              path="/login"
              element={<ProtectedRedirect />}
            />

            <Route
              path="/login/user"
              element={<Login portal="user" />}
            />

            <Route
              path="/login/admin"
              element={<Login portal="admin" />}
            />

            {/* Registration */}
            <Route
              path="/register"
              element={<Register />}
            />

            {/* User routes */}
            <Route
              path="/dashboard"
              element={
                <UserOnly>
                  <Dashboard />
                </UserOnly>
              }
            />

            <Route
              path="/profile"
              element={
                <UserOnly>
                  <Profile />
                </UserOnly>
              }
            />

            <Route
              path="/scholarships"
              element={
                <UserOnly>
                  <Scholarships />
                </UserOnly>
              }
            />

            <Route
              path="/scholarships/:id"
              element={
                <UserOnly>
                  <ScholarshipDetail />
                </UserOnly>
              }
            />

            <Route
              path="/loans"
              element={
                <UserOnly>
                  <Loans />
                </UserOnly>
              }
            />

            <Route
              path="/loans/:category"
              element={
                <UserOnly>
                  <LoanCategory />
                </UserOnly>
              }
            />

            <Route
              path="/loans/:category/:bankId"
              element={
                <UserOnly>
                  <LoanDetail />
                </UserOnly>
              }
            />

            <Route
              path="/apply/:type/:id"
              element={
                <UserOnly>
                  <DemoApplication />
                </UserOnly>
              }
            />

            {/* Admin route */}
            <Route
              path="/admin"
              element={
                <AdminOnly>
                  <Admin />
                </AdminOnly>
              }
            />

            {/* Unknown route */}
            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />

          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);