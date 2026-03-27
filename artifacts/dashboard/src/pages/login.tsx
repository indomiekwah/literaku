import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { mockApi } from '@/lib/mock-api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await mockApi.login(email, password);
      login(user);
      toast.success('Login successful');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const autofillAdmin = () => { setEmail('admin@literaku.com'); setPassword('admin123'); };
  const autofillOperator = () => { setEmail('operator@literaku.com'); setPassword('operator123'); };

  return (
    <div className="min-h-screen flex w-full bg-slate-50">
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-primary items-center justify-center">
        <img 
          src={`${import.meta.env.BASE_URL}images/login-bg.png`} 
          alt="Abstract 3D Wave" 
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="relative z-10 p-12 text-white max-w-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-display font-bold">Literaku</h1>
          </div>
          <h2 className="text-5xl font-display font-bold mb-6 leading-tight">Empowering education through digital literacy.</h2>
          <p className="text-xl text-white/80">Manage institutions, operators, and student reading progress in one unified platform.</p>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 backdrop-blur-xl">
          <CardHeader className="space-y-3 pb-8">
            <div className="flex items-center gap-2 mb-2 lg:hidden text-primary">
              <BookOpen className="w-8 h-8" />
              <span className="font-display font-bold text-2xl">Literaku</span>
            </div>
            <CardTitle className="text-3xl font-display">Welcome back</CardTitle>
            <CardDescription className="text-base">Enter your credentials to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  required 
                  className="h-12 text-base"
                  placeholder="admin@literaku.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-sm text-primary hover:underline font-medium">Forgot password?</a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  className="h-12 text-base"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <div className="mt-8 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground">Demo Accounts</span></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" type="button" onClick={autofillAdmin} className="h-auto py-3">Admin</Button>
                <Button variant="outline" type="button" onClick={autofillOperator} className="h-auto py-3">Operator</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
