import {
  CheckOutlined,
  FundViewOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { IComponent, PostReleaseRequest } from "@codigo/share";
import { useRequest } from "ahooks";
import { Button, Space, message } from "antd";
import { useNavigate } from "react-router-dom";
import { postRelease } from "@/modules/editor/api/low-code";
import { useStoreComponents, useStorePage } from "@/shared/hooks";

export default function Center() {
  const nav = useNavigate();
  const { store } = useStorePage();
  const {
    store: storeComponents,
    getComponentById,
    storeInLocalStorage,
  } = useStoreComponents();

  // 发布接口调用
  const { run, loading } = useRequest(
    async (values: PostReleaseRequest) => postRelease(values),
    {
      manual: true,
      onSuccess: ({ msg, data }) => {
        // 跳转发布之后的页面
        nav(`/release?id=${data}`);
        localStorage.setItem("release_time", String(Date.now()));
        message.success(msg);
      },
    }
  );

  // 预览按钮
  function handleGoPreview() {
    // 将配置的组件储存在 localStorage
    storeInLocalStorage();
    // 跳转预览页面
    nav("/preview");
  }

  // 发布按钮
  function handleGoRelease() {
    // 将前端的组件数据类型结构转成符合后端接口入参的类型结构
    const components = storeComponents.sortableCompConfig
      .map((comp) => getComponentById(comp))
      .map((comp) => ({
        type: comp.type,
        options: comp.props,
      })) as IComponent[];

    run({
      components,
      desc: store.description,
      page_name: store.title,
      tdk: store.tdk,
    });
  }

  return (
    <Space className="bg-white/5 p-1 rounded-lg border border-white/10">
      <Button
        type="text"
        className="flex items-center text-gray-400 hover:text-white hover:bg-white/10"
        onClick={handleGoPreview}
      >
        <FundViewOutlined /> 预览
      </Button>
      <div className="w-px h-4 bg-white/10"></div>
      <Button
        type="text"
        className="flex items-center text-gray-400 hover:text-white hover:bg-white/10"
        onClick={storeInLocalStorage}
      >
        <PlusOutlined /> 存至草稿
      </Button>
      <div className="w-px h-4 bg-white/10"></div>
      <Button
        loading={loading}
        className="flex items-center bg-emerald-500 hover:!bg-emerald-400 border-none text-white font-medium shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all"
        type="primary"
        onClick={handleGoRelease}
      >
        发布 <CheckOutlined />
      </Button>
    </Space>
  );
}
