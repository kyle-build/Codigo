import { Canvas } from "./components/Canvas";
import { Toolbar } from "./components/Toolbar";

export default function ReportDesigner() {
  return (
    <div className="rd-layout">
      <Toolbar />

      <Canvas />
    </div>
  );
}
