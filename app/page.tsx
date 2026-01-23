import { Hero } from "@/components/Hero";
import { CeliacQuiz } from "@/components/CeliacQuiz";
import { LatestPosts } from "@/components/LatestPosts";
import { FeaturedRecipes } from "@/components/FeaturedRecipes";
import { RestaurantsPreview } from "@/components/RestaurantsPreview";

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <LatestPosts />
      <FeaturedRecipes />
      <RestaurantsPreview />
      <CeliacQuiz />
    </div>
  );
}

