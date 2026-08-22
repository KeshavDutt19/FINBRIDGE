import {
  Banknote,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';

import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
} from 'react-router-dom';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const userNav = [
  ['Dashboard', '/dashboard', LayoutDashboard],
  ['Scholarships', '/scholarships', GraduationCap],
  ['Loans', '/loans', Banknote],
  ['Profile', '/profile', UserRound],
];

const adminNav = [
  ['Admin Dashboard', '/admin', ShieldCheck],
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);

  const currentNav =
    user?.userType === 'admin'
      ? adminNav
      : userNav;

  function handleLogout() {
    logout();
    setMobileOpen(false);
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-[#f4f1ea] text-[#11110f]">

      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f4f1ea]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-12">

          <Link
            to="/"
            className="group flex items-center gap-3"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#11110f] text-xs font-bold text-white transition group-hover:scale-105">
              FB
            </span>

            <span className="text-lg font-bold tracking-[-0.04em]">
              FINBRIDGE
            </span>
          </Link>

          {user && (
            <nav className="hidden items-center gap-1 lg:flex">
              {currentNav.map(([label, to, Icon]) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `
                    inline-flex items-center gap-2
                    rounded-full
                    px-4 py-2.5
                    text-sm
                    font-medium
                    transition
                    ${
                      isActive
                        ? 'bg-[#11110f] text-white'
                        : 'text-black/55 hover:bg-black/5 hover:text-black'
                    }
                    `
                  }
                >
                  <Icon size={15} />
                  {label}
                </NavLink>
              ))}
            </nav>
          )}

          <div className="hidden items-center gap-3 sm:flex">
            {user ? (
              <>
                <div className="hidden text-right md:block">
                  <p className="text-xs font-semibold text-black/40">
                    {user.userType === 'admin'
                      ? 'Administrator'
                      : 'Signed in'}
                  </p>

                  <p className="max-w-[160px] truncate text-sm font-semibold">
                    {user.name}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black/55 transition hover:bg-[#faf9f6] hover:text-black"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link
                  className="btn-secondary"
                  to="/login/user"
                >
                  User Login
                </Link>

                <Link
                  className="btn-primary"
                  to="/login/admin"
                >
                  Admin Portal
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white lg:hidden"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? (
              <X size={18} />
            ) : (
              <Menu size={18} />
            )}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-black/10 bg-[#f4f1ea] px-5 py-4 lg:hidden">
            {user ? (
              <div className="space-y-1">
                {currentNav.map(([label, to, Icon]) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `
                      flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium
                      ${
                        isActive
                          ? 'bg-[#11110f] text-white'
                          : 'text-black/60 hover:bg-black/5'
                      }
                      `
                    }
                  >
                    <Icon size={16} />
                    {label}
                  </NavLink>
                ))}

                <button
                  onClick={handleLogout}
                  className="mt-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </div>
            ) : (
              <div className="grid gap-2 pb-2">
                <Link
                  to="/login/user"
                  onClick={() => setMobileOpen(false)}
                  className="btn-secondary"
                >
                  User Login
                </Link>

                <Link
                  to="/login/admin"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary"
                >
                  Admin Portal
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      <Outlet />
    </div>
  );
}
