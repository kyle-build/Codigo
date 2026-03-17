import { useNavigate } from "react-router-dom";
import { Button } from "antd";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded bg-emerald-500 text-white font-mono text-lg font-bold">
            C
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">
            Codigo DevDocs
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Button
            type="primary"
            className="bg-emerald-500 hover:bg-emerald-600"
            onClick={() => navigate("/editor")}
          >
            开始体验
          </Button>
        </div>
      </div>
    </header>
  );
}
