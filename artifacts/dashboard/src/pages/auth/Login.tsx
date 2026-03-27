import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("admin@literaku.id");
  const [password, setPassword] = useState("LiterakuAdmin2024!");
  const { login, isLoggingIn } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loginError, setLoginError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const result = await login({ email, password });
      localStorage.setItem("auth_token", result.token);
      toast({ title: "Welcome back!", description: `Logged in as ${result.user.name}` });
      if (result.user.role === "super_admin") {
        setLocation("/admin");
      } else {
        setLocation("/operator");
      }
    } catch (err: any) {
      setLoginError(err.message || "Login gagal. Periksa email dan password.");
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: err.message,
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/auth-bg.png`} 
          alt="Abstract Background" 
          className="w-full h-full object-cover opacity-60 mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent"></div>
      </div>

      <Card className="w-full max-w-md z-10 shadow-2xl shadow-primary/10 border-0 bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden">
        <div className="bg-primary p-8 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-black/10 mb-6">
            <BookOpen className="text-primary" size={36} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Literaku</h1>
          <p className="text-primary-foreground/80 mt-2 font-medium">Dashboard Management Portal</p>
        </div>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-semibold">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@literaku.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-white rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-semibold">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 bg-white rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 transition-all"
              />
            </div>
            {loginError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {loginError}
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-700">
            <p className="font-semibold mb-1">Demo credentials:</p>
            <p>Email: admin@literaku.id</p>
            <p>Password: LiterakuAdmin2024!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
