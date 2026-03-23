import { useCallback, useState } from "react";
const useToggler = (init: unknown) => {
  const [value, setValue] = useState(init);
  const toggleValue = useCallback(() => setValue((pre: unknown) => !pre), []);
  return [value, toggleValue];
};

export default useToggler;












