import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:justify-items-center">
          <div>
            <h3 className="text-lg font-bold text-gf-text-primary dark:text-neutral-100">
              Bezglutenska sila
            </h3>
            <p className="mt-2 text-sm text-gf-text-secondary dark:text-neutral-400">
              Vaš vodič kroz svijet bez glutena
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gf-text-primary dark:text-neutral-100">
              Navigacija
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/recepti"
                  className="text-sm text-gf-text-secondary hover:text-gf-cta dark:text-neutral-400 dark:hover:text-gf-cta"
                >
                  Recepti
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-gf-text-secondary hover:text-gf-cta dark:text-neutral-400 dark:hover:text-gf-cta"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/restorani"
                  className="text-sm text-gf-text-secondary hover:text-gf-cta dark:text-neutral-400 dark:hover:text-gf-cta"
                >
                  Restorani
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gf-text-primary dark:text-neutral-100">
              Informacije
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/o-nama"
                  className="text-sm text-gf-text-secondary hover:text-gf-cta dark:text-neutral-400 dark:hover:text-gf-cta"
                >
                  O nama
                </Link>
              </li>
              <li>
                <Link
                  href="/kontakt"
                  className="text-sm text-gf-text-secondary hover:text-gf-cta dark:text-neutral-400 dark:hover:text-gf-cta"
                >
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-neutral-200 pt-8 dark:border-neutral-800">
          <p className="mb-4 text-center text-xs text-gf-text-secondary dark:text-neutral-400">
            <strong>Važno:</strong> Sadržaj na ovoj stranici temelji se na osobnim iskustvima i nije namijenjen kao medicinski savjet. 
            Ako sumnjaš da imaš celijakiju ili probleme s glutenom, obrati se liječniku za dijagnozu i liječenje. 
          </p>
          <p className="text-center text-sm text-gf-text-secondary dark:text-neutral-400">
            © {new Date().getFullYear()} Bezglutenska sila. Sva prava pridržana.
          </p>
        </div>
      </div>
    </footer>
  );
}

