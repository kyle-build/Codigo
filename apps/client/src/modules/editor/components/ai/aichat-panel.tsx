import { useEffect, useMemo, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { Avatar, Button, Input, Switch } from "antd";
import { toJS } from "mobx";
import { ulid } from "ulid";
import type { TComponentTypes } from "@codigo/schema";
import { useEditorComponents } from "@/modules/editor/hooks";
import { BASE_URL } from "@/shared/utils/request";
import { storeAuth } from "@/shared/hooks/use-store-auth";
import { DeleteOutlined } from "@ant-design/icons";
import { RobotOutlined } from "@ant-design/icons";

/**
 * 聊天角色
 */
type ChatRole = "user" | "assistant";

/**
 * 聊天消息
 */
type ChatMessage = {
  content: string;
  id: string;
  role: ChatRole;
  createdAt: number;
};

/**
 * 草稿组件
 */
type DraftComponent = {
  type: TComponentTypes;
  props?: Record<string, unknown>;
  styles?: Record<string, unknown>;
};

type SSEEvent = {
  event: string;
  data: string;
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

  if (prompt.includes("注意") || prompt.includes("提示") || prompt.includes("警告")) {
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

  if (prompt.includes("单选") || prompt.includes("radio") || prompt.includes("选择一项")) {
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

function AIChatPanel() {
  const { store, getComponentById, replaceByCode } = useEditorComponents();
  const [prompt, setPrompt] = useState("");
  const [appendMode, setAppendMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const storageKey = useMemo(
    () => `codigo_ai_chat_v1:${store.activePageId ?? "unknown"}`,
    [store.activePageId],
  );
  const initialMessages = useMemo<ChatMessage[]>(
    () => [
      {
        content: "描述你想生成的页面结构，我会把结果同步到当前画布。",
        id: ulid(),
        role: "assistant",
        createdAt: Date.now(),
      },
    ],
    [],
  );
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const messagesViewportRef = useRef<HTMLDivElement | null>(null);
  const stickToBottomRef = useRef(true);
  const persistTimerRef = useRef<number | null>(null);
  const streamStateRef = useRef(
    new Map<string, { jsonStarted: boolean; jsonHintShown: boolean }>(),
  );
  const userAvatar = storeAuth.details?.head_img || "";
  const userName = storeAuth.details?.username || "你";

  const canSubmit = useMemo(() => prompt.trim().length > 0, [prompt]);

  function pushMessage(role: ChatRole, content: string) {
    setMessages((prev) => [
      ...prev,
      { id: ulid(), role, content, createdAt: Date.now() },
    ]);
  }

  function createAssistantMessage(initialContent = "") {
    const id = ulid();
    setMessages((prev) => [
      ...prev,
      {
        id,
        role: "assistant",
        content: initialContent,
        createdAt: Date.now(),
      },
    ]);
    return id;
  }

  function appendAssistantMessage(messageId: string, delta: string) {
    if (!delta) return;
    setMessages((prev) =>
      prev.map((item) =>
        item.id === messageId
          ? { ...item, content: item.content + delta }
          : item,
      ),
    );
  }

  function appendAssistantMessageFiltered(messageId: string, delta: string) {
    if (!delta) return;
    const state = streamStateRef.current.get(messageId) ?? {
      jsonStarted: false,
      jsonHintShown: false,
    };

    const normalized = delta.trimStart();
    const looksLikeJsonChunk =
      normalized.startsWith("{") ||
      normalized.startsWith("[") ||
      normalized.includes('"draft"') ||
      normalized.includes('{"draft"');

    if (!state.jsonStarted && looksLikeJsonChunk) {
      state.jsonStarted = true;
      streamStateRef.current.set(messageId, state);
    }

    if (state.jsonStarted) {
      if (!state.jsonHintShown) {
        state.jsonHintShown = true;
        streamStateRef.current.set(messageId, state);
        appendAssistantMessage(messageId, "\n(结构化结果生成中...)\n");
      }
      return;
    }

    appendAssistantMessage(messageId, delta);
  }

  function parseSSEBlock(block: string): SSEEvent | null {
    const lines = block
      .split("\n")
      .map((line) => line.replace(/\r$/, ""))
      .filter(Boolean);

    let event = "message";
    const dataLines: string[] = [];
    for (const line of lines) {
      if (line.startsWith(":")) continue;
      if (line.startsWith("event:")) {
        event = line.slice(6).trim();
        continue;
      }
      if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).trimStart());
      }
    }

    const data = dataLines.join("\n");
    if (!data) return null;
    return { event, data };
  }

  function removeMessage(messageId: string) {
    setMessages((prev) => prev.filter((item) => item.id !== messageId));
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        setMessages(initialMessages);
        return;
      }
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        setMessages(initialMessages);
        return;
      }
      const restored = parsed
        .filter((item) => item && typeof item === "object")
        .map((item) => item as Partial<ChatMessage>)
        .filter((item) => typeof item.id === "string" && typeof item.role === "string")
        .map((item) => ({
          id: item.id as string,
          role: item.role as ChatRole,
          content: typeof item.content === "string" ? item.content : "",
          createdAt: typeof item.createdAt === "number" ? item.createdAt : Date.now(),
        }));
      setMessages(restored.length > 0 ? restored : initialMessages);
    } catch {
      setMessages(initialMessages);
    }
  }, [storageKey, initialMessages]);

  useEffect(() => {
    if (persistTimerRef.current) {
      window.clearTimeout(persistTimerRef.current);
    }
    persistTimerRef.current = window.setTimeout(() => {
      const sliced = messages.slice(-200);
      localStorage.setItem(storageKey, JSON.stringify(sliced));
    }, 350);
    return () => {
      if (persistTimerRef.current) {
        window.clearTimeout(persistTimerRef.current);
      }
    };
  }, [messages, storageKey]);

  useEffect(() => {
    if (!stickToBottomRef.current) return;
    const viewport = messagesViewportRef.current;
    if (!viewport) return;
    viewport.scrollTop = viewport.scrollHeight;
  }, [messages.length]);

  async function handleSubmit() {
    const userPrompt = prompt.trim();
    if (!userPrompt || submitting) return;

    setSubmitting(true);
    pushMessage("user", userPrompt);

    try {
      const activePage = store.pages.find((page) => page.id === store.activePageId);
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

      const assistantMessageId = createAssistantMessage("正在连接 AI 服务...\n");
      streamStateRef.current.set(assistantMessageId, {
        jsonStarted: false,
        jsonHintShown: false,
      });

      const response = await fetch(`${BASE_URL}/api/ai/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          ...(storeAuth.token ? { Authorization: storeAuth.token } : {}),
        },
        body: JSON.stringify({
          prompt: userPrompt,
          current: appendMode ? current : [],
          page: activePage
            ? {
                id: activePage.id,
                path: activePage.path,
                name: activePage.name,
              }
            : undefined,
        }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || `请求失败：${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("当前环境不支持流式响应");
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let draftFromServer: DraftComponent[] | null = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const evt = parseSSEBlock(part);
          if (!evt) continue;
          if (evt.event === "delta") {
            try {
              const payload = JSON.parse(evt.data) as { text?: string };
              appendAssistantMessageFiltered(assistantMessageId, payload.text ?? "");
            } catch {
              appendAssistantMessageFiltered(assistantMessageId, evt.data);
            }
          } else if (evt.event === "result") {
            const payload = JSON.parse(evt.data) as { draft?: DraftComponent[] };
            draftFromServer = payload.draft ?? [];
          } else if (evt.event === "error") {
            const payload = JSON.parse(evt.data) as { message?: string };
            throw new Error(payload.message || "生成失败");
          }
        }
      }

      const nextDraft = draftFromServer ?? buildDraftByPrompt(userPrompt);
      replaceByCode([...current, ...nextDraft]);
      appendAssistantMessage(
        assistantMessageId,
        `\n已生成 ${nextDraft.length} 个组件，已同步到画布与源码。`,
      );
      setPrompt("");
    } catch (error) {
      pushMessage("assistant", `生成失败：${(error as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-full w-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--ide-sidebar-bg)]">
      <div
        ref={messagesViewportRef}
        onScroll={() => {
          const viewport = messagesViewportRef.current;
          if (!viewport) return;
          const distanceToBottom =
            viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
          stickToBottomRef.current = distanceToBottom < 24;
        }}
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-1 py-1 scrollbar-thin scrollbar-thumb-[var(--ide-border)] hover:scrollbar-thumb-[var(--ide-text-muted)] scrollbar-track-transparent"
      >
        <div className="space-y-3 px-3 py-2">
          {messages.map((message) => {
            const isUser = message.role === "user";
            const bubbleStyles = isUser
              ? "bg-[var(--ide-hover)] text-[var(--ide-text)] border border-[var(--ide-border)]"
              : "border border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)] text-[var(--ide-text)]";
            return (
              <div
                key={message.id}
                className="group flex w-full min-w-0 items-start gap-2 justify-start"
              >
                <div className="pt-0.5">
                  {isUser ? (
                    <Avatar
                      size={28}
                      src={userAvatar || undefined}
                      className="shrink-0 border border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)] text-[var(--ide-text)]"
                    >
                      {(userName || "你").slice(0, 1).toUpperCase()}
                    </Avatar>
                  ) : (
                    <Avatar
                      size={28}
                      icon={<RobotOutlined />}
                      className="shrink-0 border border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)] text-[var(--ide-text-muted)]"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 px-1 text-[10px] text-[var(--ide-text-muted)]">
                    {isUser ? userName : "AI"}
                  </div>
                  <div className="flex min-w-0 items-start gap-1">
                    <div className="inline-block max-w-[100%] min-w-0">
                      <div
                        className={`rounded-2xl px-3 py-2 text-[12px] leading-relaxed shadow-sm ${bubbleStyles}`}
                      >
                        <div className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                          {message.content}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMessage(message.id)}
                      title="删除消息"
                      className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--ide-border)] bg-[var(--ide-bg)] text-[var(--ide-text-muted)] opacity-0 shadow-sm transition-opacity hover:text-[var(--ide-text)] group-hover:opacity-100"
                    >
                      <DeleteOutlined className="text-[12px]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="shrink-0 border-t border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)] px-3 py-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] text-[var(--ide-text-muted)]">追加到现有画布</span>
          <Switch checked={appendMode} onChange={setAppendMode} />
        </div>
        <Input.TextArea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          autoSize={{ minRows: 2, maxRows: 6 }}
          placeholder="例如：生成一个活动报名表单，包含标题、姓名、手机号、单选项，选项: 学生、在职、自由职业"
        />

        <div className="mt-2 flex items-center">
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
      </div>
    </div>
  );
}

const AIChatPanelComponent = observer(AIChatPanel);

export default AIChatPanelComponent;
