import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { login, isAuthenticated, register } from '../lib/auth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { LogIn } from 'lucide-react';
import { useEffect } from 'react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [userRegister, setUserRegister] = useState('');
  const [emailRegister, setEmailRegister] = useState('');
  const [passwordRegister, setPasswordRegister] = useState('');

  const [error, setError] = useState('');
  const [errorRegister, setErrorRegister] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = await login(email, password);
    if (user) {
      navigate('/');
    } else {
      setError('Credenciales incorrectas.');
    }
  };
  const createAccountRef = useRef<HTMLButtonElement>(null);
  const formCreateAccountRef = useRef<HTMLDivElement>(null);

  function showCreateAccount() {
    createAccountRef.current?.classList.add("hidden");
    formCreateAccountRef.current?.classList.remove("hidden");
  }

  async function RegisterUser(e: React.FormEvent) {
    e.preventDefault();
    setErrorRegister('');
    const registered = await register(emailRegister, passwordRegister, userRegister);
    if (registered) {
      setError(registered.message);
      createAccountRef.current?.classList.remove("hidden");
      formCreateAccountRef.current?.classList.add("hidden");

      setEmail(emailRegister);
      setPassword(passwordRegister);

      handleSubmit(e);
    } else {
      setErrorRegister('Error al registrar el usuario. Por favor, intenta de nuevo.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-2">
            <LogIn className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}


            <Button type="submit" className="w-full">
              Ingresar
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Crear cuenta:</p>
            <div className="text-xs space-y-1 text-gray-700">
              <div>¿No tienes un usuario? crea tu cuenta aqui</div>
              <Button
                variant="link"
                id="create-account"
                ref={createAccountRef}
                onClick={showCreateAccount}
              >
                Crear cuenta
              </Button>
              <div
                className="text-xs text-muted-foreground hidden"
                id="form-create-account"
                ref={formCreateAccountRef}
              >
                <form onSubmit={RegisterUser} className="space-y-4">
                  <Label htmlFor="create-account">Nombre de Usuario</Label>
                  <Input
                    id="create-account"
                    type="text"
                    placeholder="Ingresa tu nombre de usuario"
                    value={userRegister}
                    onChange={(e) => setUserRegister(e.target.value)}
                  ></Input>
                  <Label htmlFor="create-account">Crear cuenta</Label>
                  <Input
                    id="create-account"
                    type="email"
                    placeholder="Ingresa tu correo electrónico"
                    value={emailRegister}
                    onChange={(e) => setEmailRegister(e.target.value)}
                  ></Input>

                  <Label htmlFor="create-password">Contraseña</Label>
                  <Input
                    id="create-password"
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    value={passwordRegister}
                    onChange={(e) => setPasswordRegister(e.target.value)}
                  ></Input>
                  {errorRegister && (
                    <Alert variant="destructive">
                      <AlertDescription>{errorRegister}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full mt-2">
                    Crear cuenta
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
