import { useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { Button, Input, Switch, Typography } from "antd";
import { toJS } from "mobx";
import { ulid } from "ulid";
import type { TComponentTypes } from "@codigo/schema";
import { useStoreComponents } from "@/shared/hooks";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

type DraftComponent = {
  type: TComponentTypes;
  props?: Record<string, unknown>;
  styles?: Record<string, unknown>;
};

function parseOptions(prompt: string) {
  const matched = prompt.match(/选项[:：]\s*([^\n。；;]+)/);
  if (!matched) return [];
  return matched[1]
    .split(/[、,，/|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildRadioDraft(title: string, options: string[]): DraftComponent {
  const normalizedOptions = options.length > 0 ? options : ["选项1", "选项2"];
  const mappedOptions = normalizedOptions.map((value) => ({
    id: ulid(),
    value,
  }));

  return {
    type: "radio",
    props: {
      id: ulid(),
      title,
      options: mappedOptions,
      defaultRadio: mappedOptions[0]?.id ?? "",
    },
  };
}

function buildCheckboxDraft(title: string, options: string[]): DraftComponent {
  const normalizedOptions = options.length > 0 ? options : ["选项1", "选项2"];
  const mappedOptions = normalizedOptions.map((value) => ({
    id: ulid(),
    value,
  }));

  return {
    type: "checkbox",
    props: {
      id: ulid(),
      title,
      options: mappedOptions,
      defaultChecked: mappedOptions[0] ? [mappedOptions[0].id] : [],
    },
  };
}

function buildDraftByPrompt(prompt: string): DraftComponent[] {
  const next: DraftComponent[] = [];
  const options = parseOptions(prompt);
  const titleMatch = prompt.match(/标题[:：]?\s*([^\n，。；;]+)/);
  const pageTitle = titleMatch?.[1]?.trim();
  const normalized = prompt.toLowerCase();

  if (pageTitle) {
    next.push({
      type: "titleText",
      props: {
        title: pageTitle,
        size: "xl",
      },
    });
  }

  if (prompt.includes("图片") || prompt.includes("banner")) {
    next.push({
      type: "image",
      props: {
        name: "主图",
        height: 220,
      },
    });
  }

  if (
    prompt.includes("注意") ||
    prompt.includes("提示") ||
    prompt.includes("警告")
  ) {
    next.push({
      type: "alert",
      props: {
        title: "请根据页面提示完成填写",
        showIcon: true,
        showClose: false,
        type: "info",
      },
    });
  }

  const inputConfigs = [
    { keyword: "姓名", title: "姓名", placeholder: "请输入姓名" },
    { keyword: "手机号", title: "手机号", placeholder: "请输入手机号" },
    { keyword: "电话", title: "联系电话", placeholder: "请输入联系电话" },
    { keyword: "邮箱", title: "邮箱", placeholder: "请输入邮箱" },
    { keyword: "公司", title: "公司名称", placeholder: "请输入公司名称" },
  ];

  for (const config of inputConfigs) {
    if (!prompt.includes(config.keyword)) continue;
    next.push({
      type: "input",
      props: {
        title: config.title,
        placeholder: config.placeholder,
        text: "",
      },
    });
  }

  if (
    prompt.includes("描述") ||
    prompt.includes("留言") ||
    prompt.includes("建议") ||
    prompt.includes("备注")
  ) {
    next.push({
      type: "textArea",
      props: {
        title: "详细描述",
        placeholder: "请输入详细描述",
        text: "",
      },
    });
  }

  if (
    prompt.includes("单选") ||
    prompt.includes("radio") ||
    prompt.includes("选择一项")
  ) {
    next.push(buildRadioDraft("请选择一项", options));
  }

  if (prompt.includes("多选") || prompt.includes("checkbox")) {
    next.push(buildCheckboxDraft("可多选", options));
  }

  if (prompt.includes("列表") || prompt.includes("清单")) {
    next.push({
      type: "list",
      props: {
        items: [
          {
            id: ulid(),
            title: "列表项1",
            description: "这是列表说明",
            titleLink: "https://test.net",
            avatar: "https://sdfsdf.dev/50x50.png",
          },
        ],
      },
    });
  }

  if (prompt.includes("分割") || prompt.includes("分隔")) {
    next.push({
      type: "split",
      props: {},
    });
  }

  if (normalized.includes("问卷") || normalized.includes("表单")) {
    if (!next.some((item) => item.type === "titleText")) {
      next.unshift({
        type: "titleText",
        props: {
          title: "问卷信息收集",
          size: "lg",
        },
      });
    }
    if (!next.some((item) => item.type === "input")) {
      next.push({
        type: "input",
        props: {
          title: "姓名",
          placeholder: "请输入姓名",
          text: "",
        },
      });
    }
  }

  if (next.length === 0) {
    next.push(
      {
        type: "titleText",
        props: {
          title: "AI 生成页面",
          size: "lg",
        },
      },
      {
        type: "input",
        props: {
          title: "输入项",
          placeholder: "请输入",
          text: "",
        },
      },
    );
  }

  return next;
}

const { Text } = Typography;

export default observer(function AIChatPanel() {
  const { store, getComponentById, replaceByCode } = useStoreComponents();
  const [prompt, setPrompt] = useState("");
  const [appendMode, setAppendMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: ulid(),
      role: "assistant",
      content: "描述你的页面需求，我会直接生成到画布并保持源码同步。",
    },
  ]);

  const canSubmit = useMemo(() => prompt.trim().length > 0, [prompt]);

  function pushMessage(role: ChatRole, content: string) {
    setMessages((prev) => [...prev, { id: ulid(), role, content }]);
  }

  async function handleSubmit() {
    const userPrompt = prompt.trim();
    if (!userPrompt || submitting) return;

    setSubmitting(true);
    pushMessage("user", userPrompt);

    try {
      const aiDraft = buildDraftByPrompt(userPrompt);
      const current = appendMode
        ? store.sortableCompConfig
            .map((id) => getComponentById(id))
            .filter(
              (
                item,
              ): item is NonNullable<ReturnType<typeof getComponentById>> =>
                Boolean(item),
            )
            .map((item) => ({
              id: item.id,
              type: item.type,
              props: toJS(item.props),
              styles: toJS(
                (item as { styles?: Record<string, unknown> }).styles ?? {},
              ),
            }))
        : [];

      replaceByCode([...current, ...aiDraft]);
      pushMessage(
        "assistant",
        `已生成 ${aiDraft.length} 个组件，已同步到画布与源码。`,
      );
      setPrompt("");
    } catch (error) {
      pushMessage("assistant", `生成失败：${(error as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded border border-slate-200 bg-slate-50 p-2 space-y-2 max-h-64 overflow-auto">
        {messages.map((message) => (
          <div key={message.id}>
            <Text strong={message.role === "assistant"}>
              {message.role === "assistant" ? "AI" : "你"}
            </Text>
            <div className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">
              {message.content}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Text className="text-xs text-slate-500">追加到现有画布</Text>
        <Switch checked={appendMode} onChange={setAppendMode} />
      </div>

      <Input.TextArea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        autoSize={{ minRows: 5, maxRows: 8 }}
        placeholder="例如：生成一个活动报名表单，包含标题、姓名、手机号、单选项，选项: 学生、在职、自由职业"
      />

      <Button
        type="primary"
        block
        disabled={!canSubmit}
        loading={submitting}
        onClick={handleSubmit}
      >
        发送并渲染到画布
      </Button>
    </div>
  );
});












