import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { studioStore } from "@/app/stores/studioStore";

interface Props {
  name: string;
  label: string;
  path: string;
}

export const NavButton = observer(({ name, label, path }: Props) => {
  const navigate = useNavigate();

  const active = studioStore.currentModule === name;

  function handleClick() {
    studioStore.setModule(name);
    navigate(path);
  }

  return (
    <button
      className={`nav-btn ${active ? "active" : ""}`}
      onClick={handleClick}
    >
      {label}
    </button>
  );
});












