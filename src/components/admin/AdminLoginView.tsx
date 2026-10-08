"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface AdminLoginViewProps {
  onSuccess: () => void;
}

export function AdminLoginView({ onSuccess }: AdminLoginViewProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "admin@kodeva.com" && password === "admin123") {
      sessionStorage.setItem("kodeva_admin_auth", "true");
      toast.success("Berhasil masuk sebagai Administrator");
      onSuccess();
    } else {
      setError("Email atau kata sandi tidak valid. Gunakan kredensial demo.");
    }
  };

  const handleDemoFill = () => {
    setEmail("admin@kodeva.com");
    setPassword("admin123");
    sessionStorage.setItem("kodeva_admin_auth", "true");
    toast.success("Kredensial demo terisi. Selamat datang!");
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl space-y-6 text-white">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl mx-auto shadow-lg shadow-indigo-600/30">
            K
          </div>
          <h1 className="text-xl font-bold">Portal Dashboard Admin Kodeva</h1>
          <p className="text-xs text-slate-400">
            Kelola landing page, publikasi artikel blog, dan pantau database leads UMKM.
          </p>
        </div>

        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Kredensial Demo Reviewer:
          </div>
          <div>
            Email: <code className="font-mono bg-black/40 px-1 rounded">admin@kodeva.com</code>
          </div>
          <div>
            Password: <code className="font-mono bg-black/40 px-1 rounded">admin123</code>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Email Administrator
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@kodeva.com"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-lg shadow-indigo-600/30 text-xs"
            >
              Masuk ke Dashboard
            </button>

            <button
              type="button"
              onClick={handleDemoFill}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold transition text-xs border border-slate-700"
            >
              Isi Kredensial Demo (1-Klik)
            </button>
          </div>
        </form>

        <div className="text-center pt-2">
          <Link
            href="/"
            className="text-slate-400 hover:text-indigo-400 text-xs inline-flex items-center gap-1 transition"
          >
            <span>← Kembali ke Halaman Utama</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
