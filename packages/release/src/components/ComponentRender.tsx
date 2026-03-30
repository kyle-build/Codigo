"use client";

import {
  buildComponentTree,
  groupChildrenBySlot,
  type ComponentNode,
  type GetReleaseDataResponse,
  type TComponentTypes,
  getComponentByType,
  initBuiltinComponents,
} from "@codigo/materials";
import { useRequest } from "ahooks";
import { useImmer } from "use-immer";
import { useMemo, useState } from "react";
import { message, Button } from "antd";

initBuiltinComponents();

const usingInputType = ["input", "textArea", "radio", "checkbox"];

function generateComponent(
  conf: { id: string; type: TComponentTypes; props: Record<string, any> },
  onUpdate: (value: any) => void,
  slots?: Record<string, any[]>,
  editorNodeId?: string,
) {
  const Component = getComponentByType(conf.type);

  if (!usingInputType.includes(conf.type))
    return (
      <Component
        {...conf.props}
        key={conf.id}
        slots={slots}
        editorNodeId={editorNodeId}
      />
    );
  else
    return (
      <Component
        {...conf.props}
        key={conf.id}
        onUpdate={onUpdate}
        slots={slots}
        editorNodeId={editorNodeId}
      />
    );
}

function getQuestionComponentValueField(component: any) {
  switch (component.type) {
    case "input":
    case "textArea":
      return "text";
    case "radio":
      return "defaultRadio";
    case "checkbox":
      return "defaultChecked";
    default:
      return null;
  }
}

interface ComponentRenderType {
  id: string;
  data: GetReleaseDataResponse;
}

export default function ComponentRender({ data, id }: ComponentRenderType) {
  const [isPosted, setIsPosted] = useState(false);
  const [localData, setLocalData] = useImmer(
    JSON.parse(JSON.stringify(data)) as ComponentRenderType["data"],
  );
  const pageSchema = useMemo(() => {
    if (localData.schema?.components?.length) {
      return localData.schema.components;
    }

    return buildComponentTree(
      localData.components.map((component) => ({
        id: component.node_id,
        type: component.type,
        name: component.name,
        props: component.options ?? {},
        styles: component.styles,
        slot: component.slot ?? undefined,
        meta: component.meta,
        parentId: component.parent_node_id,
      })),
      localData.componentIds,
    );
  }, [localData.componentIds, localData.components, localData.schema]);

  const componentValueMap = useMemo(() => {
    return new Map(
      localData.components.map((component) => [component.node_id, component]),
    );
  }, [localData.components]);

  function renderNode(node: ComponentNode) {
    const sourceComponent = componentValueMap.get(node.id);
    const runtimeComponent = {
      id: node.id,
      type: node.type,
      props: sourceComponent?.options ?? node.props ?? {},
    };
    const renderedChildren =
      node.children?.map((child) => renderNode(child)) ?? [];
    const groupedSlots = groupChildrenBySlot(node);
    const slots = Object.fromEntries(
      Object.entries(groupedSlots).map(([slotName, nodes]) => [
        slotName,
        nodes.map((child) =>
          renderedChildren.find((item) => String(item.key) === child.id),
        ),
      ]),
    );

    return (
      <div
        key={node.id}
        className="relative"
        style={{
          ...(node.styles ?? {}),
        }}
      >
        {generateComponent(
          runtimeComponent,
          (value) => {
            setLocalData((draft) => {
              const target = draft.components.find(
                (item) => item.node_id === node.id,
              );
              if (!target) return;
              const questionComponentValueField =
                getQuestionComponentValueField(target);
              if (questionComponentValueField) {
                target.options[questionComponentValueField] = value;
              }
            });
          },
          slots,
          node.id,
        )}
      </div>
    );
  }

  useRequest(
    async () => {
      const _f = await fetch(
        `http://8.134.163.0:5000/api/pages/${data.id}/submissions/me`,
      );
      return _f.json() as Promise<{ data: boolean }>;
    },
    {
      onSuccess: ({ data }) => {
        if (data) {
          setIsPosted(true);
          message.open({ content: "�����ύ���ʾ�����л���Ĳ���" });
        }
      },
    },
  );

  const { run, loading } = useRequest(
    async () => {
      const isNotCompleted = localData.components.some((comp) => {
        const questionComponentValueField =
          getQuestionComponentValueField(comp);
        if (
          questionComponentValueField &&
          !comp.options[questionComponentValueField]
        )
          return !["defaultRadio", "defaultChecked"].includes(
            questionComponentValueField,
          );

        return false;
      });
      if (isNotCompleted) return { msg: "����д�����ʾ���Ϣ", data: false };

      const _f = await fetch(
        `http://8.134.163.0:5000/api/pages/${data.id}/submissions`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            props: localData.components
              .filter((comp) => usingInputType.includes(comp.type))
              .map((comp) => {
                return {
                  id: comp.id,
                  value: comp.options[getQuestionComponentValueField(comp)!],
                };
              }),
          }),
        },
      );

      return _f.json();
    },
    {
      manual: true,
      onSuccess: ({ msg, data }) => {
        if (data !== undefined) {
          message.warning(msg);
        } else {
          message.success(msg);
          setIsPosted(true);
        }
      },
    },
  );

  return (
    <div
      className={`${isPosted && "opacity-50 select-none pointer-events-none"}`}
    >
      {pageSchema.map((node) => renderNode(node))}

      {data.components.some((comp) => usingInputType.includes(comp.type)) && (
        <div className="flex items-center justify-center">
          <Button type="primary" onClick={run} loading={loading}>
            �ύ�ʾ�
          </Button>
        </div>
      )}
    </div>
  );
}
