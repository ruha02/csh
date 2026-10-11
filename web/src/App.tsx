import { ReactKeycloakProvider } from '@react-keycloak/web';
import { ConfigProvider } from 'antd';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppLayout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRedirect from './components/RoleRedirect';
import keycloak from './keycloak';
import { appTheme } from './theme';

// Страницы кандидата
import CandidateFsp from './pages/candidate/Fsp';
import CandidateProfile from './pages/candidate/Profile';
import CandidateResume from './pages/candidate/Resume';
import CandidateSettings from './pages/candidate/Settings';
import CandidateSkills from './pages/candidate/Skills';
import CandidateTasks from './pages/candidate/Tasks';
import CandidateTests from './pages/candidate/Tests';
import CandidateVacancies from './pages/candidate/Vacancies';

// Страницы работодателя
import EmployerCandidates from './pages/employer/Candidates';
import EmployerCompanyProfile from './pages/employer/CompanyProfile';
import EmployerResponses from './pages/employer/Responses';
import EmployerSettings from './pages/employer/Settings';
import EmployerVacancies from './pages/employer/Vacancies';

// Страницы администратора
import AdminCandidates from './pages/admin/Candidates';
import AdminDictionaries from './pages/admin/Dictionaries';
import AdminEmployers from './pages/admin/Employers';

const App: React.FC = () => {
  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={{
        onLoad: 'login-required',
        checkLoginIframe: false,
        pkceMethod: 'S256',
      }}
      LoadingComponent={
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: '#1B1C21'
        }}>
          <div style={{ color: '#EDEDED', fontSize: '18px' }}>Загрузка системы...</div>
        </div>
      }
    >
      <ConfigProvider theme={appTheme}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              {/* Автоматический редирект на первый пункт меню в зависимости от роли */}
              <Route
                index
                element={
                  <ProtectedRoute allowedRoles={['candidats', 'employers', 'admins']}>
                    <RoleRedirect />
                  </ProtectedRoute>
                }
              />

              {/* Маршруты кандидата */}
              <Route
                path="candidate/profile"
                element={
                  <ProtectedRoute allowedRoles={['candidats']}>
                    <CandidateProfile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="candidate/skills"
                element={
                  <ProtectedRoute allowedRoles={['candidats']}>
                    <CandidateSkills />
                  </ProtectedRoute>
                }
              />
              <Route
                path="candidate/fsp"
                element={
                  <ProtectedRoute allowedRoles={['candidats']}>
                    <CandidateFsp />
                  </ProtectedRoute>
                }
              />
              <Route
                path="candidate/tests"
                element={
                  <ProtectedRoute allowedRoles={['candidats']}>
                    <CandidateTests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="candidate/resume"  // ← Добавьте этот маршрут
                element={
                  <ProtectedRoute allowedRoles={['candidats']}>
                    <CandidateResume />
                  </ProtectedRoute>
                }
              />
              <Route
                path="candidate/tasks"
                element={
                  <ProtectedRoute allowedRoles={['candidats']}>
                    <CandidateTasks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="candidate/vacancies"
                element={
                  <ProtectedRoute allowedRoles={['candidats']}>
                    <CandidateVacancies />
                  </ProtectedRoute>
                }
              />
              <Route
                path="candidate/settings"
                element={
                  <ProtectedRoute allowedRoles={['candidats']}>
                    <CandidateSettings />
                  </ProtectedRoute>
                }
              />

              {/* Маршруты работодателя */}
              <Route
                path="employer/company-profile"
                element={
                  <ProtectedRoute allowedRoles={['employers']}>
                    <EmployerCompanyProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="employer/vacancies"
                element={
                  <ProtectedRoute allowedRoles={['employers']}>
                    <EmployerVacancies />
                  </ProtectedRoute>
                }
              />
              <Route
                path="employer/candidates"
                element={
                  <ProtectedRoute allowedRoles={['employers']}>
                    <EmployerCandidates />
                  </ProtectedRoute>
                }
              />
              <Route
                path="employer/responses"
                element={
                  <ProtectedRoute allowedRoles={['employers']}>
                    <EmployerResponses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="employer/settings"
                element={
                  <ProtectedRoute allowedRoles={['employers']}>
                    <EmployerSettings />
                  </ProtectedRoute>
                }
              />

              {/* Маршруты администратора */}
              <Route
                path="admin/candidates"
                element={
                  <ProtectedRoute allowedRoles={['admins']}>
                    <AdminCandidates />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/employers"
                element={
                  <ProtectedRoute allowedRoles={['admins']}>
                    <AdminEmployers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/dictionaries"
                element={
                  <ProtectedRoute allowedRoles={['admins']}>
                    <AdminDictionaries />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </ConfigProvider>
    </ReactKeycloakProvider>
  );
};

export default App;