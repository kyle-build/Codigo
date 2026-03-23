import { useDebugValue, useState } from "react";

const useStateWithLabel = (initValue: unknown, label: string) => {
  const [value, setValue] = useState(initValue);
  useDebugValue(`${label} : ${value}`);
  return [value, setValue];
};

export default useStateWithLabel;












