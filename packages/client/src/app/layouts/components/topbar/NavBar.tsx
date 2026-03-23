import { studioModules } from "@/app/studio/modules";
import { NavButton } from "./NavButton";

export function NavBar() {
  return (
    <nav className="topbar-nav">
      {studioModules.map((m) => (
        <NavButton key={m.name} name={m.name} label={m.label} path={m.path} />
      ))}
    </nav>
  );
}












