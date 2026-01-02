import Link from "next/link";
import Script from "next/script";
import { ChevronRight, Home } from "lucide-react";
import { generateBreadcrumbSchema, generateJsonLdScript } from "@/lib/seo";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  // Dodaj Home na početak
  const allItems = [
    { name: "Početna", url: "/" },
    ...items,
  ];

  // Generiraj schema za structured data
  const breadcrumbSchema = generateBreadcrumbSchema(allItems);

  return (
    <>
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: generateJsonLdScript(breadcrumbSchema) }}
      />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-2 text-sm">
          {allItems.map((item, index) => (
            <li key={item.url} className="flex items-center gap-2">
              {index === 0 ? (
                <Link
                  href={item.url}
                  className="flex items-center gap-1 text-gf-text-secondary hover:text-gf-cta dark:text-neutral-400 dark:hover:text-gf-cta"
                  aria-label="Početna"
                >
                  <Home className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <ChevronRight className="h-4 w-4 text-gf-text-muted dark:text-neutral-500" />
                  {index === allItems.length - 1 ? (
                    <span className="font-medium text-gf-text-primary dark:text-neutral-100">
                      {item.name}
                    </span>
                  ) : (
                    <Link
                      href={item.url}
                      className="text-gf-text-secondary hover:text-gf-cta dark:text-neutral-400 dark:hover:text-gf-cta"
                    >
                      {item.name}
                    </Link>
                  )}
                </>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

