import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Banknote, GraduationCap, LayoutDashboard, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const nav = [
  ['Dashboard', '/dashboard', LayoutDashboard],
  ['Scholarships', '/scholarships', GraduationCap],
  ['Loans', '/loans', Banknote],
  ['Profile', '/profile', UserRound],
  ['Admin', '/admin', ShieldCheck]
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cloud text-ink">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-ink text-white">FB</span>
            <span>FinBridge</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {user &&
              nav.map(([label, to, Icon]) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${isActive ? 'bg-slate-100 text-mint' : 'text-slate-600 hover:text-ink'}`
                  }
                >
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden text-sm font-semibold text-slate-600 sm:inline">{user.name}</span>
                <button
                  className="btn-secondary px-3"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  title="Log out"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link className="btn-secondary" to="/login">Login</Link>
                <Link className="btn-primary" to="/register">Register</Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
