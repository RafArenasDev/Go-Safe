import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Mas from "./pages/Mas";
import Reportes from "./pages/reportes/Reportes";
import NuevoReporte from "./pages/reportes/NuevoReporte";
import DetalleReporte from "./pages/reportes/DetalleReporte";
import Checklist from "./pages/checklist/Checklist";
import Inspeccion from "./pages/inspeccion/Inspeccion";
import HistorialInspeccion from "./pages/inspeccion/HistorialInspeccion";
import Capacitacion from "./pages/capacitacion/Capacitacion";
import VerCapacitacion from "./pages/capacitacion/VerCapacitacion";
import Alertas from "./pages/alertas/Alertas";
import Indicadores from "./pages/indicadores/Indicadores";
import Documentos from "./pages/documentos/Documentos";
import Perfil from "./pages/perfil/Perfil";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner position="top-center" richColors theme="dark" />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/mas" element={<Mas />} />
              <Route path="/reportes" element={<Reportes />} />
              <Route path="/reportes/nuevo" element={<NuevoReporte />} />
              <Route path="/reportes/:id" element={<DetalleReporte />} />
              <Route path="/checklist" element={<Checklist />} />
              <Route path="/inspeccion" element={<Inspeccion />} />
              <Route path="/inspeccion/historial" element={<HistorialInspeccion />} />
              <Route path="/capacitacion" element={<Capacitacion />} />
              <Route path="/capacitacion/:id" element={<VerCapacitacion />} />
              <Route path="/alertas" element={<Alertas />} />
              <Route path="/indicadores" element={<Indicadores />} />
              <Route path="/documentos" element={<Documentos />} />
              <Route path="/perfil" element={<Perfil />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
