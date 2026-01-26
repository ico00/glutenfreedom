import { Metadata } from "next";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";

export const metadata: Metadata = {
  title: "O nama | Bezglutenska sila",
  description: "Saznajte više o nama i našoj misiji pomoći ljudima koji žive bez glutena.",
};

export default function ONamaPage() {
  return (
    <main className="min-h-screen bg-gf-bg-card py-12 dark:bg-neutral-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-4xl font-bold text-gf-text-primary dark:text-neutral-100">
          O nama
        </h1>

        {/* Featured Image - identično kao na blogu */}
        <div className="mb-8 aspect-video w-full overflow-hidden rounded-2xl">
          <ImagePlaceholder
            imageUrl="/images/o-nama-hero.jpg"
            alt="O nama - Bezglutenska sila"
            emoji="🌾"
            gradient="from-gf-safe/40 via-gf-cta/30 to-gf-safe/40"
            priority
          />
        </div>
        
        <div className="space-y-6 text-gf-text-secondary dark:text-neutral-300">
          <p className="text-lg leading-relaxed">
            Dobrodošli na <strong>Bezglutensku silu</strong> – crtice iz mog bezglutenskog života!
          </p>
          
          <p className="leading-relaxed">
            Ova stranica nastala je iz više Notesa na mom iPhoneu, iz raznih tablica, guglanja i jednostavno nakon životnih iskustava. 
            Ne želim vam niti pametovati niti vam govoriti što i kako nego samo podijeliti svoja iskustva, svoje recepte i stvari koje sam doživio.
          </p>
          
          <p className="leading-relaxed">
            Nisam doktor, nisam nutricionist, magistar farmacije, kuhar...samo pokušavam preživjeti bez glutena i dijeliti svoja iskustva koja vam možda pomognu. 
          </p>

          <p className="leading-relaxed">
            Vjerojatno i ja puno toga još uvijek krivo radim, nešto svjesno, nešto nesvjesno, pa sam otvoren i za vaša iskustva i savjete. 
          </p>


          <p className="mt-8 rounded-lg bg-amber-50 p-4 text-sm dark:bg-amber-900/20">
            <strong>Napomena:</strong> Sadržaj na ovoj stranici temelji se na osobnim iskustvima 
            i nije namijenjen kao medicinski savjet. Ako sumnjate da imate celijakiju ili 
            probleme s glutenom, obratite se liječniku za dijagnozu i liječenje.
          </p>
        </div>
      </div>
    </main>
  );
}
