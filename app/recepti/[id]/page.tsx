import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Clock, Users, ArrowLeft } from "lucide-react";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { GallerySection } from "@/components/GallerySection";
import type { Recipe } from "@/types";
import { getAllRecipes } from "@/lib/recipeUtils";

export async function generateStaticParams() {
  const allRecipes = await getAllRecipes();
  return allRecipes.map((recipe) => ({
    id: recipe.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const allRecipes = await getAllRecipes();
  const recipe = allRecipes.find((r) => r.id === id);
  if (!recipe) {
    return {
      title: "Recept nije pronađen",
    };
  }
  return {
    title: `${recipe.title} | Gluten Freedom`,
    description: recipe.description,
  };
}

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const allRecipes = await getAllRecipes();
  const recipe = allRecipes.find((r) => r.id === id);

  if (!recipe) {
    notFound();
  }

  return (
    <div className="bg-gf-bg-card py-12 dark:bg-neutral-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/recepti"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gf-cta hover:text-gf-cta-hover dark:text-gf-cta dark:hover:text-gf-cta-hover"
        >
          <ArrowLeft className="h-4 w-4" />
          Natrag na recepte
        </Link>

        <article>
          <div className="mb-8 aspect-video w-full overflow-hidden rounded-2xl">
            <ImagePlaceholder
              imageUrl={recipe.image}
              alt={recipe.title}
              emoji="🍞"
              gradient="from-gf-cta/40 via-gf-safe/30 to-gf-cta/40"
            />
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-gf-text-secondary dark:text-neutral-400">
            <div className="flex items-center gap-1">
              <Clock className="h-5 w-5" />
              <span>Priprema: {recipe.prepTime} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-5 w-5" />
              <span>Kuhanje: {recipe.cookTime} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-5 w-5" />
              <span>{recipe.servings} porcija</span>
            </div>
            <span className="rounded-full bg-gf-safe/20 px-3 py-1 text-xs font-medium text-gf-safe dark:bg-gf-safe/30 dark:text-gf-safe">
              {recipe.difficulty}
            </span>
          </div>

          <h1 className="mb-4 text-4xl font-bold text-gf-text-primary dark:text-neutral-100">
            {recipe.title}
          </h1>

          <p className="mb-8 text-lg text-gf-text-secondary dark:text-neutral-400">
            {recipe.description}
          </p>

          <div className="mb-8 flex flex-wrap gap-2">
            {recipe.tags && recipe.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gf-safe/20 px-3 py-1 text-sm font-medium text-gf-safe dark:bg-gf-safe/30 dark:text-gf-safe"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="mb-4 text-2xl font-semibold text-gf-text-primary dark:text-neutral-100">
                Sastojci
              </h2>
              <ul className="space-y-2">
                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                  recipe.ingredients.map((ingredient, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-gf-text-primary dark:text-neutral-300"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gf-cta dark:bg-gf-cta" />
                      <span>{ingredient}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gf-text-secondary dark:text-neutral-400">Nema sastojaka</li>
                )}
              </ul>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-semibold text-gf-text-primary dark:text-neutral-100">
                Priprema
              </h2>
              <ol className="space-y-4">
                {recipe.instructions && recipe.instructions.length > 0 ? (
                  recipe.instructions.map((instruction, index) => (
                    <li
                      key={index}
                      className="flex gap-4 text-gf-text-primary dark:text-neutral-300"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gf-cta text-sm font-semibold text-white dark:bg-gf-cta">
                        {index + 1}
                      </span>
                      <span className="pt-1">{instruction}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gf-text-secondary dark:text-neutral-400">Nema uputa</li>
                )}
              </ol>
            </div>
          </div>

          {/* Galerija slika */}
          {recipe.gallery && recipe.gallery.length > 0 && (
            <GallerySection images={recipe.gallery} />
          )}
        </article>
      </div>
    </div>
  );
}

