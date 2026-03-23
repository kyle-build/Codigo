import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["./src/index"], // 打包入口
  outDir: "./dist",           // 输出目录
  declaration: true,        // 生成 .d.ts 类型声明
  rollup:{
    emitCJS:true
  },
  externals: [
    "react",
    "react-dom",
    "antd",
    "@ant-design/icons",
  ], // 排除外部依赖，外部已经下载
});
