import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import { appTheme } from './theme';
import keycloak from './keycloak';
import AppLayout from './components/Layout';
import Dashboard from './pages/Dashboard';

// Функция, вызываемая при успешной авторизации
const onTokens = (tokens: any) => {
  console.log('Tokens updated:', tokens);
};

// Обработка событий Keycloak
// const eventHandlers = {
//   onReady: (keycloak: any) => {
//     console.log('Keycloak initialized');
//   },
//   onAuthSuccess: () => {
//     console.log('User authenticated');
//   },
//   onAuthError: (error: any) => {
//     console.error('Authentication error:', error);
//   },
//   onAuthRefreshSuccess: () => {
//     console.log('Token refreshed successfully');
//   },
//   onAuthRefreshError: () => {
//     console.error('Token refresh failed');
//   },
//   onAuthLogout: () => {
//     console.log('User logged out');
//   },
// };

const App: React.FC = () => {
  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={{
        onLoad: 'login-required',
        checkLoginIframe: false,
        pkceMethod: 'S256',
      }}
      onTokens={onTokens}
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
              <Route index element={<Dashboard />} />
              <Route path="settings" element={<div>Страница настроек (в разработке)</div>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ConfigProvider>
    </ReactKeycloakProvider>
  );
};

export default App;