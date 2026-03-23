export type FieldType = "input" | "select" | "checkbox" | "date";

export interface FieldProps {
  [key: string]: any;
}

export interface Field {
  id: string;
  type: FieldType;
  props: FieldProps;
}

export interface FormSchema {
  fields: Field[];
}












