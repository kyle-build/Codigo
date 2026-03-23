import { HomeHeader } from "./components/homeHeader/homeHeader";
import { HomeCenter } from "./components/homeCenter/homeCenter";
import { HomeFooter } from "./components/homeFooter/homeFooter";
import { ParticleBackground } from "./components/background/ParticleBackground";
import { Outlet } from "react-router-dom";

export default function Home() {
  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-white text-slate-900 font-sans">
        <HomeHeader />
        <ParticleBackground />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.05),transparent_45%)]" />
        <main className="relative z-10 pt-28">
          <HomeCenter />
        </main>
        <HomeFooter />
      </div>
      <Outlet />
    </>
  );
}












