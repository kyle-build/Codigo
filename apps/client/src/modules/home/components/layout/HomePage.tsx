import { ParticleBackground } from "../background/ParticleBackground";
import { HomeFeatureGrid } from "../sections/HomeFeatureGrid";
import { HomeHeroSection } from "../sections/HomeHeroSection";
import { HomeFooter } from "./HomeFooter";
import { HomeHeader } from "./HomeHeader";

/** 组合首页布局与营销区块。 */
export function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white font-sans text-slate-900">
      <HomeHeader />
      <ParticleBackground />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.05),transparent_45%)]" />
      <main className="relative z-10 pt-28">
        <HomeHeroSection />
        <HomeFeatureGrid />
      </main>
      <HomeFooter />
    </div>
  );
}
