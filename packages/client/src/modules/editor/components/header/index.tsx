import { useStorePage } from "@/shared/hooks/useStorePage";
import Left from "./Left";
import { observer } from "mobx-react-lite";
import Center from "./Center";
import Right from "./Right";

const Header = observer(({}) => {
  const { store: storePage } = useStorePage();
  return (
    <div className="flex items-center mx-6">
      <div className="flex-1">
        <Left title={storePage.title} />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <Center />
      </div>
      <div className="flex-1 flex justify-end">
        <Right />
      </div>
    </div>
  );
});

export default Header;












