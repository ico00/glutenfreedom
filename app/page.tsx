import { Hero } from "@/components/Hero";
import { LatestPosts } from "@/components/LatestPosts";
import { FeaturedRecipes } from "@/components/FeaturedRecipes";
import { RestaurantsPreview } from "@/components/RestaurantsPreview";
import { CTA } from "@/components/CTA";
import { Disclaimer } from "@/components/Disclaimer";

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <LatestPosts />
      <FeaturedRecipes />
      <RestaurantsPreview />
      <div className="bg-gf-bg-card py-8 dark:bg-neutral-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Disclaimer />
        </div>
      </div>
      <CTA />
    </div>
  );
}

