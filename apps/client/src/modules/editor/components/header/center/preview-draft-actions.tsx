import { FundViewOutlined, PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { useEditorComponents, useEditorPermission } from "@/modules/editor/hooks";

function PreviewDraftActions() {
  const navigate = useNavigate();
  const { storeInLocalStorage } = useEditorComponents();
  const { can } = useEditorPermission();

  const handlePreview = () => {
    if (can("save_draft")) {
      storeInLocalStorage();
    }

    navigate("/preview");
  };

  return (
    <>
      <Button
        type="text"
        className="!h-7 !rounded-lg !px-2 !text-[11px] !text-slate-500 hover:!bg-slate-100 hover:!text-slate-900"
        onClick={handlePreview}
      >
        <FundViewOutlined /> 预览
      </Button>
      <Button
        type="text"
        className="!h-7 !rounded-lg !px-2 !text-[11px] !text-slate-500 hover:!bg-slate-100 hover:!text-slate-900"
        onClick={storeInLocalStorage}
        disabled={!can("save_draft")}
      >
        <PlusOutlined /> 草稿
      </Button>
    </>
  );
}

const PreviewDraftActionsComponent = observer(PreviewDraftActions);

export { PreviewDraftActionsComponent as PreviewDraftActions };
