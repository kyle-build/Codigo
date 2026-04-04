import React, { useMemo } from "react";
import { Avatar, List } from "antd";
import { getDefaultValueByConfig } from "..";
import { listComponentDefaultConfig } from ".";
import type { IListComponentProps } from ".";

/**
 * 渲染列表物料，并支持普通链接与页面内锚点跳转。
 */
export default function ListComponent(_props: IListComponentProps) {
  const props = useMemo(() => {
    return {
      ...getDefaultValueByConfig(listComponentDefaultConfig),
      ..._props,
    };
  }, [_props]);

  /**
   * 根据链接类型返回标题节点，支持外链与页面内平滑滚动。
   */
  function renderTitle(title: string, titleLink: string) {
    if (!titleLink) return title;
    if (titleLink.startsWith("#")) {
      return (
        <a
          href={titleLink}
          onClick={(event) => {
            event.preventDefault();
            const element = document.getElementById(titleLink.slice(1));
            element?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          {title}
        </a>
      );
    }
    return <a href={titleLink}>{title}</a>;
  }

  return (
    <List
      itemLayout="horizontal"
      dataSource={props.items}
      renderItem={(item) => (
        <List.Item>
          <List.Item.Meta
            avatar={<Avatar src={item.avatar} />}
            title={renderTitle(item.title, item.titleLink)}
            description={item.description}
          />
        </List.Item>
      )}
    />
  );
}
