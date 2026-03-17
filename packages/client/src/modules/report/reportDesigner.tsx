import { Canvas } from "./components/Canvas";
import { Toolbar } from "./components/Toolbar";

export default function ReportDesigner() {
  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      <Toolbar />
      <div className="flex-1 overflow-hidden relative">
        {/* Grid Background */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        <Canvas />
      </div>
    </div>
  );
}
