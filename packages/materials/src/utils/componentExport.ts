import type { ComponentType } from "react";
import type { TComponentTypes } from "@codigo/schema";
import { builtinComponentDefinitions } from "../components/registry";

export const componentList = Object.fromEntries(
  builtinComponentDefinitions.map((item) => [item.type, item.render]),
) as Record<TComponentTypes, ComponentType<any>>;
