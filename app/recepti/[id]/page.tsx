import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import Script from "next/script";
import { Clock, Users, ArrowLeft, ChefHat, Utensils, Check } from "lucide-react";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { GallerySection } from "@/components/GallerySection";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import type { Recipe } from "@/types";
import { getAllRecipes } from "@/lib/recipeUtils";
import { generateRecipeMetadata } from "@/lib/metadata";
import { generateRecipeSchema, generateJsonLdScript } from "@/lib/seo";

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
  return generateRecipeMetadata(recipe);
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

  const recipeSchema = generateRecipeSchema(recipe);

  return (
    <div className="bg-gf-bg-card py-12 dark:bg-neutral-900">
      <Script
        id="recipe-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: generateJsonLdScript(recipeSchema) }}
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { name: "Recepti", url: "/recepti" },
            { name: recipe.title, url: `/recepti/${recipe.id}` },
          ]}
        />
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

          <div className="grid gap-8 lg:grid-cols-5">
            {/* Sastojci - lijeva strana */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 rounded-2xl border border-neutral-200 bg-gradient-to-br from-gf-cta/5 via-white to-gf-safe/5 p-6 shadow-sm dark:border-neutral-700 dark:from-gf-cta/10 dark:via-neutral-800 dark:to-gf-safe/10">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gf-cta to-gf-cta-hover shadow-lg shadow-gf-cta/25">
                    <Utensils className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gf-text-primary dark:text-neutral-100">
                    Sastojci
                  </h2>
                </div>
                
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-gf-safe/10 px-3 py-2 dark:bg-gf-safe/20">
                  <Users className="h-4 w-4 text-gf-safe" />
                  <span className="text-sm font-medium text-gf-safe">
                    Za {recipe.servings} {recipe.servings === 1 ? 'porciju' : recipe.servings < 5 ? 'porcije' : 'porcija'}
                  </span>
                </div>
                
                <ul className="space-y-2">
                  {recipe.ingredients && recipe.ingredients.length > 0 ? (
                    recipe.ingredients.map((ingredient, index) => (
                      <li
                        key={index}
                        className="group flex items-center gap-3 rounded-xl border border-transparent bg-white/60 px-4 py-3 transition-all hover:border-gf-cta/20 hover:bg-white hover:shadow-sm dark:bg-neutral-800/60 dark:hover:bg-neutral-800"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gf-cta/10 text-gf-cta transition-colors group-hover:bg-gf-cta group-hover:text-white dark:bg-gf-cta/20">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span className="text-gf-text-primary dark:text-neutral-200">{ingredient}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gf-text-secondary dark:text-neutral-400">Nema sastojaka</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Priprema - desna strana */}
            <div className="lg:col-span-3">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gf-safe to-emerald-500 shadow-lg shadow-gf-safe/25">
                  <ChefHat className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gf-text-primary dark:text-neutral-100">
                  Priprema
                </h2>
              </div>
              
              <ol className="relative space-y-6 border-l-2 border-gf-cta/20 pl-8 dark:border-gf-cta/30">
                {recipe.instructions && recipe.instructions.length > 0 ? (
                  recipe.instructions.map((instruction, index) => (
                    <li
                      key={index}
                      className="relative"
                    >
                      {/* Broj koraka na liniji */}
                      <span className="absolute -left-[41px] flex h-8 w-8 items-center justify-center rounded-full border-4 border-gf-bg-card bg-gradient-to-br from-gf-cta to-gf-cta-hover text-sm font-bold text-white shadow-lg dark:border-neutral-900">
                        {index + 1}
                      </span>
                      
                      {/* Sadržaj koraka */}
                      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-all hover:border-gf-cta/30 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800">
                        <div className="text-gf-text-primary dark:text-neutral-200 space-y-4" style={{ lineHeight: '1.75' }}>
                          {instruction.split('\n').map((paragraph, pIndex) => (
                            <p key={pIndex}>{paragraph}</p>
                          ))}
                        </div>
                      </div>
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

