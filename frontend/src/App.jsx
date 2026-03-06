import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import IssuesPage from './pages/IssuesPage'
import AuditLogsPage from './pages/AuditLogsPage'
import AlertsPage from './pages/AlertsPage'
import Layout from './components/Layout'

function ProtectedRoute({ children, requiredRoles }) {
    const { user } = useAuth()
    if (!user) return <Navigate to="/login" replace />
    if (requiredRoles && !requiredRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />
    }
    return children
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="issues" element={<IssuesPage />} />
                        <Route
                            path="audit"
                            element={
                                <ProtectedRoute requiredRoles={['DepartmentAdmin', 'SuperAdmin']}>
                                    <AuditLogsPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="alerts"
                            element={
                                <ProtectedRoute requiredRoles={['SuperAdmin']}>
                                    <AlertsPage />
                                </ProtectedRoute>
                            }
                        />
                    </Route>
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App
