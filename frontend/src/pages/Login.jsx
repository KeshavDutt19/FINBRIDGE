import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, ArrowRight, LogIn } from 'lucide-react';

import { useAuth } from '../context/AuthContext.jsx';

export default function Login({ portal = 'user' }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = portal === 'admin';

  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();

    setError('');
    setSubmitting(true);

    try {
      const loggedInUser = await login(
        form.email,
        form.password,
        portal
      );

      if (loggedInUser.userType === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(
          location.state?.from?.pathname || '/dashboard',
          { replace: true }
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-2 lg:py-20">
      <div className="flex flex-col justify-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#596d3f]">
          {isAdmin ? 'Secure administration' : 'Welcome back'}
        </p>

        <h1 className="mt-4 text-5xl font-medium tracking-[-0.05em] sm:text-6xl">
          {isAdmin ? 'Admin Portal' : 'User Portal'}
        </h1>

        <p className="mt-6 max-w-xl text-base leading-7 text-black/55">
          {isAdmin
            ? 'Manage users, monitor financial activity, review platform analytics and maintain FinBridge data.'
            : 'Discover scholarships, compare loans and manage your financial opportunities from one place.'}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {!isAdmin && (
            <Link
              to="/login/admin"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-black/5"
            >
              <ShieldCheck size={16} />
              Admin Portal
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/login/user"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-black/5"
            >
              <LogIn size={16} />
              User Portal
            </Link>
          )}
        </div>
      </div>

      <form
        onSubmit={submit}
        className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_30px_90px_rgba(0,0,0,0.08)] sm:p-8"
      >
        <div className="rounded-2xl bg-[#f5f2ec] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
            Signing into
          </p>

          <p className="mt-1 text-lg font-semibold">
            {isAdmin ? 'FinBridge Admin' : 'FinBridge User'}
          </p>
        </div>

        <label className="mt-6 block text-sm font-semibold">
          Email
          <input
            className="field mt-1"
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm({
                ...form,
                email: event.target.value
              })
            }
            required
          />
        </label>

        <label className="mt-4 block text-sm font-semibold">
          Password
          <input
            className="field mt-1"
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm({
                ...form,
                password: event.target.value
              })
            }
            required
          />
        </label>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary mt-6 w-full"
        >
          {submitting ? (
            'Signing in...'
          ) : (
            <>
              {isAdmin
                ? 'Enter Admin Dashboard'
                : 'Enter FinBridge'}
              <ArrowRight size={16} />
            </>
          )}
        </button>

        {!isAdmin && (
          <p className="mt-5 text-center text-sm text-black/50">
            New to FinBridge?{' '}
            <Link
              className="font-semibold text-[#596d3f]"
              to="/register"
            >
              Create an account
            </Link>
          </p>
        )}
      </form>
    </section>
  );
}
