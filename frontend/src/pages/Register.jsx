import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', userType: 'student' });
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-extrabold">Create your FinBridge profile</h1>
      <form onSubmit={submit} className="panel mt-6 grid gap-4 p-6 md:grid-cols-2">
        {['name', 'email', 'phone'].map(key => (
          <label className="text-sm font-semibold" key={key}>{key[0].toUpperCase() + key.slice(1)}
            <input className="field mt-1" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
          </label>
        ))}
        <label className="text-sm font-semibold">Password
          <input className="field mt-1" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        </label>
        <label className="text-sm font-semibold md:col-span-2">User type
          <select className="field mt-1" value={form.userType} onChange={e => setForm({ ...form, userType: e.target.value })}>
            <option value="student">Student</option><option value="parent">Parent</option><option value="professional">Professional</option>
          </select>
        </label>
        {error && <p className="text-sm font-semibold text-red-600 md:col-span-2">{error}</p>}
        <button className="btn-primary md:col-span-2">Register</button>
      </form>
    </section>
  );
}
