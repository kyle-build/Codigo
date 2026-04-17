# Start Prompt

复制下面这段作为每次新会话的第一条消息：

```text
先读取并总结以下文件后再开始执行：
1) .trae/context/PROJECT_FACTS.md
2) .trae/context/DECISIONS.md
3) .trae/context/SESSION_HANDOFF.md

要求：
- 先用 5-10 条 bullet 复述当前上下文与未完成项。
- 明确“已完成 / 待完成 / 风险点 / 下一步”。
- 不重复已经完成的改动。
- 若信息不足，先提问澄清后再动手。
```
