import React, { createContext, useContext } from "react";
import { FormStore } from "../stores/formStore";

const store = new FormStore();

const StoreContext = createContext<FormStore>(store);

export const StoreProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
};

export function useFormStore() {
  return useContext(StoreContext);
}












