import { observer } from "mobx-react-lite";
import type { Widget } from "../types";
import { reportStore } from "../stores/reportStore";

export const TableWidget = observer(({ widget }: { widget: Widget }) => {
  const ds = reportStore.getDs(widget.config.dsId);

  return (
    <div className="w-full h-full overflow-auto">
      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr>
            {widget.config.columns?.map((c) => (
              <th
                key={c}
                className="px-2.5 py-1.5 text-left bg-zinc-50 text-zinc-500 font-semibold text-[10px] uppercase tracking-wide sticky top-0 border-b border-zinc-200"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ds.map((row, i) => (
            <tr key={i} className="hover:bg-zinc-50">
              {widget.config.columns?.map((c) => (
                <td key={c} className="px-2.5 py-1.5 border-t border-zinc-200 text-zinc-700">
                  {row[c as keyof typeof row]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});












