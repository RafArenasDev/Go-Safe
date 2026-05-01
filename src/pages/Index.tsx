import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const { usuario } = useAuth();
  return <Navigate to={usuario ? "/dashboard" : "/login"} replace />;
}
