import { useTitle } from "ahooks";
import { HomePage } from "./components/layout/HomePage";

/** 渲染首页模块入口。 */
export default function Home() {
  useTitle("Codigo - 首页");
  
  return(
    <HomePage />
  )
}
