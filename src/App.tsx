import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { RecursosPage } from './pages/RecursosPage';
import { PrestamosPage } from './pages/PrestamosPage';
import { UsuariosPage } from './pages/UsuariosPage';
import { MultasPage } from './pages/MultasPage';
import { ActividadesPage } from './pages/ActividadesPage';
import { PortalPage } from './pages/PortalPage';
import { EstudiantePage } from './pages/EstudiantePage';
import { LoginPage } from './pages/LoginPage';
import { RequireRole } from './components/RequireRole';
import { AuthProvider } from './auth/AuthProvider';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<PortalPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/estudiante" element={(
            <RequireRole roles={['Estudiante', 'Profesor']}><EstudiantePage /></RequireRole>
          )} />
          <Route path="/bibliotecario" element={(
            <RequireRole roles={['Bibliotecario']}><Layout /></RequireRole>
          )}>
            <Route index element={<Dashboard />} />
            <Route path="recursos" element={<RecursosPage />} />
            <Route path="usuarios" element={<UsuariosPage />} />
            <Route path="prestamos" element={<PrestamosPage />} />
            <Route path="multas" element={<MultasPage />} />
            <Route path="actividades" element={<ActividadesPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;