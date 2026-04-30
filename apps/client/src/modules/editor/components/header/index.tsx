import { useEditorPage } from "@/modules/editor/hooks";
import { observer } from "mobx-react-lite";
import Left from "./left";
import Center from "./center";
import Right from "./right";

function Header() {
  const { store: storePage } = useEditorPage();
  return (
    <div className="flex w-full items-center gap-2.5 px-0.5 text-[13px]">
      <div className="min-w-0 flex-[1.1]">
        <Left title={storePage.title} />
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-center">
        <Center />
      </div>
      <div className="flex flex-[0.8] justify-end">
        <Right />
      </div>
    </div>
  );
}

const HeaderComponent = observer(Header);

export default HeaderComponent;
