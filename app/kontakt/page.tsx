"use client";

import { useState } from "react";
import { Send, CheckCircle, AlertCircle } from "lucide-react";

export default function KontaktPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("https://formspree.io/f/mqeqqekz", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        setSubmitStatus("success");
        form.reset();
      } else {
        setSubmitStatus("error");
      }
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gf-bg-card py-12 dark:bg-neutral-900">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-4 text-4xl font-bold text-gf-text-primary dark:text-neutral-100">
          Kontakt
        </h1>
        <p className="mb-8 text-gf-text-secondary dark:text-neutral-300">
          Imate pitanje, prijedlog ili želite podijeliti svoje iskustvo? Slobodno me kontaktirajte!
        </p>

        {submitStatus === "success" ? (
          <div className="rounded-xl bg-green-50 p-6 dark:bg-green-900/20">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-300">
                  Poruka uspješno poslana!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Hvala na poruci. Odgovorit ću vam čim prije.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSubmitStatus("idle")}
              className="mt-4 text-sm font-medium text-green-700 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
            >
              Pošalji novu poruku
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-200"
              >
                Ime
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-gf-text-primary placeholder-neutral-400 transition-colors focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
                placeholder="Vaše ime"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-200"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-gf-text-primary placeholder-neutral-400 transition-colors focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
                placeholder="vasa@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="subject"
                className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-200"
              >
                Naslov
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-gf-text-primary placeholder-neutral-400 transition-colors focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
                placeholder="O čemu se radi?"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-200"
              >
                Poruka
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                className="w-full resize-none rounded-lg border border-neutral-300 bg-white px-4 py-3 text-gf-text-primary placeholder-neutral-400 transition-colors focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
                placeholder="Vaša poruka..."
              />
            </div>

            {submitStatus === "error" && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <p className="text-sm text-red-700 dark:text-red-400">
                  Došlo je do greške. Molimo pokušajte ponovno.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gf-cta px-6 py-3 font-semibold text-white transition-colors hover:bg-gf-cta-hover disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gf-cta dark:hover:bg-gf-cta-hover"
            >
              {isSubmitting ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Šaljem...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Pošalji poruku
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
