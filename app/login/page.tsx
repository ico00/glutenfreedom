"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Neispravni podaci za prijavu");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("Greška pri prijavi. Pokušaj ponovno.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gf-bg py-12 px-4 dark:bg-neutral-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gf-cta/10">
            <Lock className="h-8 w-8 text-gf-cta" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gf-text-primary dark:text-neutral-100">
            Admin prijava
          </h2>
          <p className="mt-2 text-center text-sm text-gf-text-secondary dark:text-neutral-400">
            Prijavi se za pristup admin panelu
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg bg-gf-risk/10 border border-gf-risk/20 p-3 text-sm text-gf-risk">
              {error}
            </div>
          )}
          
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
                Email adresa
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="h-5 w-5 text-gf-text-secondary" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-neutral-300 bg-white pl-10 pr-3 py-2 text-gf-text-primary placeholder-gf-text-secondary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  placeholder="admin@glutenfreedom.hr"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
                Lozinka
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="h-5 w-5 text-gf-text-secondary" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-neutral-300 bg-white pl-10 pr-10 py-2 text-gf-text-primary placeholder-gf-text-secondary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  placeholder="Unesi lozinku"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gf-text-secondary hover:text-gf-text-primary"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-lg bg-gf-cta px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-gf-cta-hover focus:outline-none focus:ring-2 focus:ring-gf-cta focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Prijava..." : "Prijavi se"}
            </button>
          </div>
          
          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-gf-text-secondary hover:text-gf-cta dark:text-neutral-400 dark:hover:text-gf-cta"
            >
              ← Natrag na početnu
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gf-bg dark:bg-neutral-900">
        <div className="text-gf-text-secondary dark:text-neutral-400">Učitavanje...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

