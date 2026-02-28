'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Simple authentication logic
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('username', username);
      router.push('/admin');
    } else if (username === 'user' && password === 'user123') {
      localStorage.setItem('userRole', 'user');
      localStorage.setItem('username', username);
      router.push('/user');
    } else {
      setError('Username atau password salah!');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-fuchsia-600 via-purple-600 to-cyan-500 px-4 py-10 font-sans">
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-pink-400/40 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-cyan-300/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-indigo-500/40 blur-3xl" />

      <div className="relative mx-auto flex min-h-[85vh] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-white/30 bg-white/10 shadow-2xl backdrop-blur-xl lg:grid-cols-2">
          <div className="hidden flex-col justify-between bg-linear-to-br from-black/35 to-black/10 p-10 text-white lg:flex">
            <div>
              <p className="inline-flex rounded-full border border-white/40 bg-white/15 px-3 py-1 text-xs tracking-widest">
                SISTEM DIGITAL
              </p>
              <h1 className="mt-6 text-4xl font-bold leading-tight">
                Laporan Kegiatan
                <br />
                Humas Protokol
              </h1>
              <p className="mt-4 text-sm text-white/85">
                Platform pelaporan yang cepat, modern, dan real-time untuk pengelolaan kegiatan harian.
              </p>
            </div>

            <div className="space-y-3 text-sm text-white/90">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                Monitoring kegiatan terpusat
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                Integrasi data real-time
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-pink-300" />
                Rekap & dokumentasi visual
              </div>
            </div>
          </div>

          <div className="bg-white/95 p-8 sm:p-10">
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-slate-800">Selamat Datang</h2>
              <p className="mt-2 text-sm text-slate-600">Masuk untuk melanjutkan ke dashboard.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="username" className="mb-2 block text-sm font-medium text-slate-700">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-sm outline-none transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200"
                  placeholder="Masukkan username"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                  placeholder="Masukkan password"
                  required
                />
              </div>

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-linear-to-r from-fuchsia-600 to-cyan-500 py-3 font-semibold text-white shadow-lg transition hover:from-fuchsia-700 hover:to-cyan-600"
              >
                Login
              </button>
            </form>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-sm font-semibold text-slate-700">Demo Credentials</p>
              <div className="space-y-2 text-xs text-slate-600">
                <p>
                  Admin: <span className="rounded bg-slate-200 px-2 py-1 font-mono">admin</span> /{' '}
                  <span className="rounded bg-slate-200 px-2 py-1 font-mono">admin123</span>
                </p>
                <p>
                  User: <span className="rounded bg-slate-200 px-2 py-1 font-mono">user</span> /{' '}
                  <span className="rounded bg-slate-200 px-2 py-1 font-mono">user123</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
