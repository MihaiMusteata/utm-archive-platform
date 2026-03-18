import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../../app/providers/auth-context'
import { AdminLayout } from '../../features/layout/AdminLayout'
import { AccessDeniedPage } from '../../features/layout/AccessDeniedPage'
import { AuditPage } from '../../features/audit/pages/AuditPage'
import { LoginPage } from '../../features/auth/pages/LoginPage'
import { DashboardPage } from '../../features/dashboard/pages/DashboardPage'
import { DocumentsPage } from '../../features/documents/pages/DocumentsPage'
import { NomenclaturesPage } from '../../features/nomenclatures/pages/NomenclaturesPage'
import { RolesPage } from '../../features/roles/pages/RolesPage'
import { StudentDetailsPage } from '../../features/students/pages/StudentDetailsPage'
import { StudentsPage } from '../../features/students/pages/StudentsPage'
import { UsersPage } from '../../features/users/pages/UsersPage'
import { ProtectedRoute } from './ProtectedRoute'
import { defaultCatalogKey, getFirstAccessiblePath } from './route-config'

export function AppRouter() {
  const { user } = useAuth()
  const defaultProtectedPath = getFirstAccessiblePath(user)

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate replace to={defaultProtectedPath} />} />
        <Route path="/forbidden" element={<AccessDeniedPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute fallbackPath={defaultProtectedPath} requiredPermissions={['dashboard.view']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students"
          element={
            <ProtectedRoute fallbackPath={defaultProtectedPath} requiredPermissions={['students.view']}>
              <StudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students/:studentId"
          element={
            <ProtectedRoute fallbackPath={defaultProtectedPath} requiredPermissions={['students.view']}>
              <StudentDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <ProtectedRoute fallbackPath={defaultProtectedPath} requiredPermissions={['documents.view']}>
              <DocumentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nomenclatures"
          element={
            <ProtectedRoute fallbackPath={defaultProtectedPath} requiredPermissions={['nomenclatures.view']}>
              <Navigate replace to={`/nomenclatures/${defaultCatalogKey}`} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nomenclatures/:catalogKey"
          element={
            <ProtectedRoute fallbackPath={defaultProtectedPath} requiredPermissions={['nomenclatures.view']}>
              <NomenclaturesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute fallbackPath={defaultProtectedPath} requiredPermissions={['users.view']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/roles"
          element={
            <ProtectedRoute fallbackPath={defaultProtectedPath} requiredPermissions={['roles.view']}>
              <RolesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/audit"
          element={
            <ProtectedRoute fallbackPath={defaultProtectedPath} requiredPermissions={['audit.view']}>
              <AuditPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate replace to={defaultProtectedPath} />} />
      </Route>
      <Route path="*" element={<Navigate replace to={user ? defaultProtectedPath : '/login'} />} />
    </Routes>
  )
}
