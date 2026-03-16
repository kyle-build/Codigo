import { observer } from "mobx-react-lite";
import type { Widget } from "../types";
import { reportStore } from "../stores/reportStore";

export const TableWidget = observer(({ widget }: { widget: Widget }) => {
  const ds = reportStore.getDs(widget.config.dsId);

  return (
    <table className="tbl">
      <thead>
        <tr>
          {widget.config.columns?.map((c) => (
            <th key={c}>{c}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {ds.map((row, i) => (
          <tr key={i}>
            {widget.config.columns?.map((c) => (
              <td key={c}>{row[c as keyof typeof row]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
});
