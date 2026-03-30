import React, { useMemo } from "react";
import { Avatar, List } from "antd";
import { getDefaultValueByConfig } from "..";
import { listComponentDefaultConfig } from ".";
import type { IListComponentProps } from ".";

export default function ListComponent(_props: IListComponentProps) {
  const props = useMemo(() => {
    return {
      ...getDefaultValueByConfig(listComponentDefaultConfig),
      ..._props,
    };
  }, [_props]);

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
