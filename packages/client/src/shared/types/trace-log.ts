type TraceDataTypeShared = {
  filePath: string; // 文件相对路径 e.g. page/index.tsx
  line: number; // 行号从1开始
  functionNames: string[]; // 函数名数组，可能有多个函数嵌套调用，[0] 是最外层函数名
};

type FunctionParam = {
  name?: string; // 函数参数名，有可能难以获取，可选
  value: unknown; // 函数参数值
};

type TraceDataTypeFunctionEntry =
  | TraceDataTypeShared
  | {
      type: "function-entry";
      params: FunctionParam[];
    };

type TraceDataTypeFunctionReturn =
  | TraceDataTypeShared
  | {
      type: "function-return";
      functionReturn: unknown;
    };

type TraceDataTypeUseEffect =
  | TraceDataTypeShared
  | {
      type: "useEffect";
      dependencies: unknown[]; // 依赖项数组
    };

type TraceDataTypeUseState =
  | TraceDataTypeShared
  | {
      type: "useState";
      name: string; // 状态变量名
      value: unknown; // 状态变量值
    };

type TraceDataType =
  | TraceDataTypeFunctionEntry
  | TraceDataTypeFunctionReturn
  | TraceDataTypeUseEffect
  | TraceDataTypeUseState;

type fullCodeTraceRunning = (data: TraceDataType) => void;

type TraceLog = {
  data: TraceDataType;
};

export type {
  TraceDataType,
  fullCodeTraceRunning,
  TraceLog,
  FunctionParam,
  TraceDataTypeShared,
  TraceDataTypeFunctionEntry,
  TraceDataTypeFunctionReturn,
  TraceDataTypeUseEffect,
  TraceDataTypeUseState,
};












