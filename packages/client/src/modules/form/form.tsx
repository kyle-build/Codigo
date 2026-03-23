import { observer } from "mobx-react-lite";
import { useFormStore } from "./components/storeProvider";

export const FieldList = observer(() => {
  const store = useFormStore();

  return (
    <div>
      {store.fields.map((field) => (
        <div key={field.id}>{field.type}</div>
      ))}
    </div>
  );
});












