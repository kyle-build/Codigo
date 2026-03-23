import { makeAutoObservable } from "mobx";
import type { Field } from "../types/formSchema";
import { genId, deepClone } from "../utils/index";
import { History } from "../hostory/hostory";

export class FormStore {
  fields: Field[] = [];
  selectedId: string | null = null;
  previewMode = false;
  formData: Record<string, any> = {};

  history = new History<Field[]>([]);

  constructor() {
    makeAutoObservable(this);
  }

  // ---------- computed ----------

  get selectedField(): Field | undefined {
    return this.fields.find((f) => f.id === this.selectedId);
  }

  get canUndo() {
    return this.history.canUndo();
  }

  get canRedo() {
    return this.history.canRedo();
  }

  // ---------- history ----------

  snapshot() {
    this.history.snapshot(this.fields);
  }

  undo() {
    const state = this.history.undo();
    if (state) this.fields = state;
  }

  redo() {
    const state = this.history.redo();
    if (state) this.fields = state;
  }

  // ---------- operations ----------

  addField(def: { type: string; defaultProps: any }, atIndex?: number) {
    const field: Field = {
      id: genId(),
      type: def.type as any,
      props: deepClone(def.defaultProps),
    };

    if (atIndex !== undefined) {
      this.fields.splice(atIndex, 0, field);
    } else {
      this.fields.push(field);
    }

    this.selectedId = field.id;
    this.snapshot();
  }

  removeField(id: string) {
    const idx = this.fields.findIndex((f) => f.id === id);

    if (idx !== -1) {
      this.fields.splice(idx, 1);
    }

    if (this.selectedId === id) {
      this.selectedId = null;
    }

    this.snapshot();
  }

  moveField(fromId: string, toIndex: number) {
    const fromIdx = this.fields.findIndex((f) => f.id === fromId);
    if (fromIdx === -1) return;

    const [field] = this.fields.splice(fromIdx, 1);

    const insertIndex = toIndex > fromIdx ? toIndex - 1 : toIndex;

    this.fields.splice(Math.max(0, insertIndex), 0, field);

    this.snapshot();
  }

  updateProp(id: string, key: string, value: any) {
    const field = this.fields.find((f) => f.id === id);

    if (!field) return;

    field.props[key] = value;

    this.snapshot();
  }

  clearAll() {
    this.fields = [];
    this.selectedId = null;
    this.snapshot();
  }

  exportSchema() {
    const blob = new Blob([JSON.stringify({ fields: this.fields }, null, 2)], {
      type: "application/json",
    });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "schema.json";
    a.click();
  }
}












