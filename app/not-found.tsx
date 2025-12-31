import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gf-bg-card dark:bg-neutral-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gf-text-primary dark:text-neutral-100">
          404
        </h1>
        <h2 className="mt-4 text-2xl font-semibold text-gf-text-primary dark:text-neutral-300">
          Stranica nije pronađena
        </h2>
        <p className="mt-2 text-gf-text-secondary dark:text-neutral-400">
          Stranica koju tražite ne postoji.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-lg bg-gf-cta px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gf-cta-hover dark:bg-gf-cta dark:hover:bg-gf-cta-hover"
        >
          Povratak na početnu
        </Link>
      </div>
    </div>
  );
}

