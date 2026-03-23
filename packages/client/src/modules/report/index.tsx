import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Canvas } from "./components/Canvas";
import { PropsPanel } from "./components/PropsPanel";
import { Toolbar } from "./components/Toolbar";
import { reportStore } from "./stores/reportStore";

const ReportDesigner = observer(() => {
  useEffect(() => {
    reportStore.initDefaultWidgets();
  }, []);

  return (
    <div className="flex flex-col h-full w-full">
      <Toolbar />
      <div className="flex-1 overflow-hidden flex">
        <Canvas />
        <PropsPanel />
      </div>
    </div>
  );
});

export default ReportDesigner;












