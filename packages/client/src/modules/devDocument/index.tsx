import { useTitle } from "ahooks";
import Header from "./components/Header";
import Center from "./components/Center";
import Footer from "./components/Footer";

export default function DevDoc() {
  useTitle("Codigo - 开发文档");

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <Center />
      <Footer />
    </div>
  );
}












