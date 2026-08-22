import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: 'demo@finbridge.dev', password: 'password123' });
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="mx-auto grid max-w-5xl gap-8 px-4 py-12 md:grid-cols-2">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-mint">Welcome back</p>
        <h1 className="mt-2 text-4xl font-extrabold">Login to FinBridge</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Demo login is prefilled after seeding. Use admin@finbridge.dev / admin123 for the admin dashboard.</p>
      </div>
      <form onSubmit={submit} className="panel p-6">
        <label className="text-sm font-semibold">Email</label>
        <input className="field mt-1" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <label className="mt-4 block text-sm font-semibold">Password</label>
        <input className="field mt-1" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
        <button className="btn-primary mt-5 w-full">Login</button>
        <p className="mt-4 text-center text-sm text-slate-600">New here? <Link className="font-bold text-mint" to="/register">Create an account</Link></p>
      </form>
    </section>
  );
}
