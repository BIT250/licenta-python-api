import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DiabetesForm from '@/components/DiabetesForm';
import HeartForm from '@/components/HeartForm';
import { User } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE = 'http://127.0.0.1:5000';

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('sessionToken');
    if (!token) {
      navigate('/login');
      return;
    }

    fetch(`${API_BASE}/auth/session`, {
      method: 'GET',
      headers: { 'Authorization': token }
    })
      .then(res => {
        if (!res.ok) {
          navigate('/login');
          throw new Error('Invalid session');
        }
        return res.json();
      })
      .then(data => {
        localStorage.setItem('userId', data.userId.toString());
        setIsLoggedIn(true);
      })
      .catch(() => {
        navigate('/login');
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Aplicație interactivă de depistare a diabetului și a afecțiunilor cardiace
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Obține predicții instantanee AI pentru riscul de diabet și afecțiuni cardiace pe baza parametrilor tăi de sănătate
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/profile">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                <User className="mr-2 h-5 w-5" />
                Profilul meu
              </Button>
            </Link>
            {isLoggedIn ? (
              <Button
                variant="outline"
                size="lg"
                onClick={handleLogout}
                className="px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                Deconectare
              </Button>
            ) : (
              <Link to="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Autentificare \/ Înregistrare
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold">Evaluare risc de diabet</CardTitle>
            <CardDescription className="text-blue-100">
              Introdu parametrii tăi de sănătate pentru a evalua riscul de diabet
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <DiabetesForm />
          </CardContent>
        </Card>

        {/* Heart card: now red */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold">Evaluare risc de afecțiuni cardiace</CardTitle>
            <CardDescription className="text-red-100">
              Introdu parametrii cardiaci pentru a evalua riscul de afecțiuni cardiace
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <HeartForm />
          </CardContent>
        </Card>
        </div>

        <div className="text-center mt-16 py-8 border-t border-gray-200">
          <p className="text-gray-600">
            \* Acest instrument oferă evaluări de risc doar în scop informativ. Consultă întotdeauna profesioniști din domeniul sănătății pentru sfaturi medicale.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;