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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PortalPage />} />
        <Route path="/estudiante" element={<EstudiantePage />} />
        <Route path="/bibliotecario" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="recursos" element={<RecursosPage />} />
          <Route path="usuarios" element={<UsuariosPage />} />
          <Route path="prestamos" element={<PrestamosPage />} />
          <Route path="multas" element={<MultasPage />} />
          <Route path="actividades" element={<ActividadesPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;