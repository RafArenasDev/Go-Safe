import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import logo from "@/assets/logo-gosafe.png";
import { Loader2, Smartphone, ShieldCheck } from "lucide-react";
import { db } from "@/lib/storage";

export default function Login() {
  const { login, usuario } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (usuario) return <Navigate to="/dashboard" replace />;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      setLoading(false);
      if (res.ok === false) { setError(res.error); return; }

      const user = db.usuarios.list().find(u => u.email.toLowerCase() === email.toLowerCase().trim());
      const nombre = user ? user.nombre.split(" ")[0] : email.split("@")[0];

      toast.success(`Sesión iniciada. ¡Bienvenido, ${nombre}!`, {
        duration: 3000,
      });

      if (user && user.rol === 'conductor') {
        // Después del toast de bienvenida, muestra el de EPP
        setTimeout(() => {
          toast.warning("Recuerda usar tu EPP en toda la jornada", {
            description: "Casco, chaleco reflectivo y zapatos de seguridad obligatorios.",
            icon: <ShieldCheck className="w-5 h-5" />,
            duration: 5000,
          });
        }, 3500); // 3s del anterior + 0.5s de pausa

        // Después del toast de EPP, muestra el del celular
        setTimeout(() => {
          toast.error("No uses el celular mientras conduces", {
            description: "Es obligación legal en todo el territorio nacional.",
            icon: <Smartphone className="w-5 h-5" />,
            duration: 5000,
          });
        }, 9000); // 3.5s del anterior + 5s de duración + 0.5s de pausa
      }

      nav("/dashboard", { replace: true });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-black lg:grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col items-center justify-center p-12">
        <div className="w-full max-w-4xl">
          <img src={logo} alt="GoSafe Logo" className="w-full" />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen px-5 py-10">
        <div className="w-full max-w-lg lg:hidden mb-10">
          <img src={logo} alt="GoSafe Logo" className="w-full" />
        </div>

        <div className="w-full max-w-md lg:max-w-lg">
          <form onSubmit={onSubmit} className="gosafe-card p-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" required autoComplete="email" inputMode="email"
                placeholder="tu@gosafe.com" value={email} onChange={e => setEmail(e.target.value)}
                className="bg-background border-border h-11" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" required autoComplete="current-password"
                placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                className="bg-background border-border h-11" />
            </div>

            {error && (
              <div className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-md px-3 py-2" role="alert">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full h-12 text-base bg-primary hover:bg-primary-glow text-primary-foreground font-semibold">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ingresar"}
            </Button>

            <button type="button" className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors">
              ¿Olvidaste tu contraseña?
            </button>
          </form>

          <details className="mt-5 text-xs text-muted-foreground">
            <summary className="cursor-pointer hover:text-foreground">Cuentas de demostración</summary>
            <ul className="mt-2 space-y-1 pl-3">
              <li>conductor@gosafe.com / gosafe123</li>
              <li>bodega@gosafe.com / gosafe123</li>
              <li>supervisor@gosafe.com / gosafe123</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
}
