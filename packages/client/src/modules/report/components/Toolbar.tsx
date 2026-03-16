import { chartTemplates } from "../types/widgetTemplates";
import { reportStore } from "../stores/reportStore";

export function Toolbar() {
  return (
    <div>
      {chartTemplates.map((t) => (
        <button key={t.type} onClick={() => reportStore.addWidget(t)}>
          {t.label}
        </button>
      ))}

      <button onClick={() => reportStore.clearAll()}>清空</button>
    </div>
  );
}
