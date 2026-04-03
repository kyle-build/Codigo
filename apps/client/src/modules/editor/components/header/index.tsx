import { useStorePage } from "@/shared/hooks/useStorePage";
import Left from "./Left";
import { observer } from "mobx-react-lite";
import Center from "./Center";
import Right from "./Right";

const Header = observer(() => {
  const { store: storePage } = useStorePage();
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
});

export default Header;
