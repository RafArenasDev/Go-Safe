import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { useEffect } from "react";

export function AppLayout() {
  const { usuario } = useAuth();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

  if (!usuario) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen flex w-full bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 md:ml-60">
        <main key={location.pathname} className="flex-1 fade-in pb-24 md:pb-8 px-4 md:px-8 pt-5 md:pt-8 max-w-5xl w-full mx-auto">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}