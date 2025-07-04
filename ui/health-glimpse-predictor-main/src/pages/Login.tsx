import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { User } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:5000';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginData.email, password: loginData.password })
      });
      const data = await res.json();

      if (res.ok) {
        toast({
          title: 'Autentificare reușită',
          description: 'Bun venit înapoi!'
        });
        localStorage.setItem('sessionToken', data.token);
        navigate('/');
      } else {
        toast({
          title: 'Autentificare eșuată',
          description: data.error || 'Date de autentificare invalide',
          variant: 'destructive'
        });
      }
    } catch {
      toast({
        title: 'Eroare',
        description: 'A apărut o eroare la autentificare',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: 'Parole nepotrivite',
        description: 'Parolele nu coincid',
        variant: 'destructive'
      });
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signupData.email, password: signupData.password, name: signupData.name })
      });
      const data = await res.json();

      if (res.ok) {
        toast({
          title: 'Cont creat',
          description: 'Cont creat cu succes! Te rugăm să te autentifici.'
        });
        navigate('/login');
      } else {
        toast({
          title: 'Înregistrare eșuată',
          description: data.error || 'Imposibil de creat cont',
          variant: 'destructive'
        });
      }
    } catch {
      toast({
        title: 'Eroare',
        description: 'A apărut o eroare la înregistrare',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Aplicație interactivă de depistare a diabetului și a afecțiunilor cardiace
          </h1>
          <p className="text-gray-600">
            Accesează evaluările personalizate ale riscurilor de sănătate
          </p>
        </div>

        <Card className="shadow-xl">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Autentificare</TabsTrigger>
              <TabsTrigger value="signup">Înregistrare</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <CardHeader>
                <CardTitle>Bun venit înapoi</CardTitle>
                <CardDescription>
                  Autentifică-te în cont pentru a continua
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Introdu email-ul"
                      value={loginData.email}
                      onChange={e => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password">Parolă</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Introdu parola"
                      value={loginData.password}
                      onChange={e => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Autentificare...' : 'Autentificare'}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            <TabsContent value="signup">
              <CardHeader>
                <CardTitle>Creează cont</CardTitle>
                <CardDescription>
                  Înregistrează-te pentru a începe călătoria către sănătate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-name">Nume complet</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Introdu numele complet"
                      value={signupData.name}
                      onChange={e => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Introdu email-ul"
                      value={signupData.email}
                      onChange={e => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-password">Parolă</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Creează o parolă"
                      value={signupData.password}
                      onChange={e => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">Confirmă parola</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirmă parola"
                      value={signupData.confirmPassword}
                      onChange={e => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Se creează contul...' : 'Creează cont'}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Prin utilizarea acestei platforme, ești de acord cu Termenii de utilizare și Politica de confidențialitate
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;