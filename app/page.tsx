import { partners } from "@/lib/partners";
import { PartnersClient } from "@/components/PartnersClient";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#1a3a2a] text-white px-4 pb-3 shadow-md">
        <div className="flex items-center gap-3 pt-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-base">
            🐴
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight">Voltige Partners</h1>
            <p className="text-[11px] text-green-200 leading-tight">
              Jouw aankoop steunt de vereniging
            </p>
          </div>
          <div className="ml-auto text-right">
            <span className="text-[11px] text-green-200 block">Partners</span>
            <span className="text-base font-bold">{partners.length}</span>
          </div>
        </div>
      </header>

      {/* Info banner */}
      <div className="mx-4 mt-3 p-3 bg-green-50 border border-green-100 rounded-xl text-xs text-green-800 leading-relaxed">
        <strong>Hoe werkt het?</strong> Zoek een winkel hieronder, klik op de kaart en koop normaal.
        De Voltige Vereniging ontvangt automatisch een kleine commissie — voor jou gratis!
      </div>

      {/* Search + filter + lijst */}
      <main className="flex-1 mt-2">
        <PartnersClient partners={partners} />
      </main>

      {/* Footer */}
      <footer className="text-center text-[10px] text-gray-400 pb-6 pt-2 px-4">
        Door via deze links te kopen steun je{" "}
        <strong className="text-gray-500">Voltigevereniging De Wittegheit</strong>.
        <br />
        Affiliate links via Daisycon · Publisher ID 419930
      </footer>
    </div>
  );
}
