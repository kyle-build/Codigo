import { Brand } from "./Brand";
import { NavBar } from "./NavBar";

export function Topbar() {
  return (
    <header className="topbar">
      <Brand />

      <NavBar />

      <div className="topbar-meta">
        <span
          className="mono"
          style={{
            fontSize: 11,
            color: "var(--text3)",
          }}
        >
          v1.0
        </span>
      </div>
    </header>
  );
}












