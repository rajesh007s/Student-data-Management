import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentDetails from './pages/StudentDetails';
import StudentForm from './pages/StudentForm';
import Faculty from './pages/Faculty';
import Courses from './pages/Courses';
import Attendance from './pages/Attendance';
import Marks from './pages/Marks';
import Fees from './pages/Fees';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />

                <Route
                  path="/students"
                  element={
                    <ProtectedRoute roles={['admin', 'faculty']}>
                      <Students />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/students/new"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <StudentForm mode="create" />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/students/:id"
                  element={
                    <ProtectedRoute roles={['admin', 'faculty', 'student']}>
                      <StudentDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/students/:id/edit"
                  element={
                    <ProtectedRoute roles={['admin', 'faculty']}>
                      <StudentForm mode="edit" />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/faculty"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <Faculty />
                    </ProtectedRoute>
                  }
                />

                <Route path="/courses" element={<Courses />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/marks" element={<Marks />} />

                <Route
                  path="/fees"
                  element={
                    <ProtectedRoute roles={['admin', 'student']}>
                      <Fees />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute roles={['admin', 'faculty']}>
                      <Reports />
                    </ProtectedRoute>
                  }
                />

                <Route path="/notifications" element={<Notifications />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
