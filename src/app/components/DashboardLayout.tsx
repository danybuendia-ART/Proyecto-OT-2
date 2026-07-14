import { Outlet, useNavigate, useLocation } from 'react-router';
import { getCurrentUser, logout } from '../lib/auth';
import { Button } from './ui/button';
import logo from '../img/SIR-PROJECTS2.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { LogOut, User, BarChart3, CalendarDays, FolderOpen, ChartNoAxesCombined, ShoppingCart, Users, Menu } from 'lucide-react';

const NAV_LINKS = [
  { to: '/', label: 'Proyectos', icon: FolderOpen },
  { to: '/dashboard', label: 'Avance porcentual', icon: ChartNoAxesCombined },
  { to: '/calendar', label: 'Calendario', icon: CalendarDays },
  { to: '/purchases', label: 'Compras', icon: ShoppingCart },
  { to: '/human-capital', label: 'Capital Humano', icon: Users },
];

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user: any = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname === to || location.pathname.startsWith(to + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <button
            className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-shrink-0"
            onClick={() => navigate('/')}
          >
            <div className="w-32 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <img src={logo} alt='logo' className='w-100 h-20'/>
            </div>
            <div className="text-left hidden sm:block">
              <h1 className="font-semibold text-sm leading-tight">Sistema Manteniniento OT SIRAGS</h1>
              <p className="text-xs text-gray-400">Bienvenid@ {user[0]?.nombre}</p>
            </div>
          </button>

          {/* Main nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive(to)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                `}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>

          {/* Mobile menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="sm:hidden flex items-center gap-2">
                <Menu className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Ir a</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                <DropdownMenuItem
                  key={to}
                  onClick={() => navigate(to)}
                  className={isActive(to) ? 'bg-blue-50 text-blue-700' : ''}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/account')}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Mi cuenta
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <span className="hidden sm:inline text-sm">{user[0]?.nombre}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-gray-500 text-xs" disabled>
                {user?.correo}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/account')}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Analíticas y rendimiento
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="min-h-[70vh] overflow-hidden sm:overflow-visible">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
