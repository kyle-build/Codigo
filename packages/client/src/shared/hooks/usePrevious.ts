import { useRef, useEffect } from "react";

const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined);

  const prev = ref.current;

  useEffect(() => {
    ref.current = value;
  });

  return prev;
};

export default usePrevious;












