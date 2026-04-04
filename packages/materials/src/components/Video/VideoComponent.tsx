import React, { useMemo, useState } from "react";
import { getDefaultValueByConfig } from "..";
import { objectOmit } from "../..";
import { type IVideoComponentProps, videoComponentDefaultConfig } from ".";

/**
 * 渲染视频物料，并在元数据加载完成后同步设置初始播放时间。
 */
export default function VideoComponent(_props: IVideoComponentProps) {
  // 当配置属性发生变化，重置属性并且重新渲染
  const props = useMemo(() => {
    return {
      ...getDefaultValueByConfig(videoComponentDefaultConfig),
      ..._props,
    };
  }, [_props]);

  // 控制器的显示与否
  const [isReady, setIsReady] = useState(false);

  /**
   * 在视频元数据可用后打开控制器，并跳转到配置的起播时间。
   */
  function handleLoadedMetadata(
    event: React.SyntheticEvent<HTMLVideoElement, Event>
  ) {
    setIsReady(true);
    event.currentTarget.currentTime = props.startTime;
  }

  return (
    <video
      controls={!!_props || isReady}
      onLoadedMetadata={handleLoadedMetadata}
      className="w-full h-[200px] object-cover outline-none"
      {...objectOmit(props, ["startTime"])}
    />
  );
}
