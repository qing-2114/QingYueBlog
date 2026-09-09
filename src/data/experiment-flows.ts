export type FlowNode = { id: string; label: string; tag: string; x: number; y: number; detail: string; file: string; kind?: string };
export type FlowRoute = { id: string; from: string; to: string; d: string; kind: 'main' | 'loop' | 'finish'; label?: string; x?: number; y?: number };
export type ExperimentMethod = { name: string; detail: string };
export type ExperimentFlow = { id: string; title: string; eyebrow: string; summary: string; status: string; note: string; record: string; methods?: ExperimentMethod[]; legend?: { main: string; loop: string; finish: string }; nodes: FlowNode[]; routes: FlowRoute[]; sequence: string[] };

export const planFlow: ExperimentFlow = {
  id: 'plan-solve', title: 'Plan-and-Solve 规划与求解链路', eyebrow: '4-EXPERIMENT / PLAN-AND-SOLVE',
  summary: '先拆解问题，再按计划逐步求解；每一步都带上之前的结果，直到返回最后一步答案。',
  status: '已实现 · 源码流程演示',
  note: '蓝色是规划与执行主链，靛蓝回环把历史结果带入下一步；计划无效时终止，有效计划执行完后返回答案。',
  record: '2026.09.06 · Planner / Executor 已接入共享 LLM 客户端；默认示例为三天苹果销量题，尚未附真实运行记录。',
  nodes: [
    { id: 'input', label: '接收问题', tag: 'INPUT', x: 40, y: 90, detail: 'run(question) 接收原始问题，由同一个 LLM 客户端连接规划器与执行器。', file: 'Plan-and-Solve/agent.py' },
    { id: 'plan', label: '生成步骤计划', tag: 'PLANNER', x: 230, y: 90, detail: '把问题填入规划提示词，调用模型生成 Python 字符串列表形式的行动计划。', file: 'planner.py · prompts.py' },
    { id: 'parse', label: '解析有效计划', tag: 'PARSE', x: 420, y: 90, detail: '提取代码块，用 literal_eval 解析并检查字符串列表；解析失败或空计划直接终止。', file: 'planner.py · ast.literal_eval' },
    { id: 'context', label: '组装当前步骤', tag: 'CONTEXT', x: 610, y: 90, detail: '组合原问题、完整计划、已完成步骤的历史及当前步骤，构造执行提示词。', file: 'executor.py · execute' },
    { id: 'solve', label: '模型求解', tag: 'SOLVE', x: 610, y: 230, detail: '针对当前步骤调用 think()，得到该步骤的回答；此实验没有外部工具分发。', file: 'executor.py · llm_client.py' },
    { id: 'history', label: '记录步骤结果', tag: 'HISTORY', x: 420, y: 230, detail: '把步骤名称与回答追加到 history；还有下一步时携带这份历史继续求解。', file: 'executor.py · history' },
    { id: 'finish', label: '返回最终答案', tag: 'FINISH', x: 230, y: 230, kind: 'finish', detail: '全部步骤完成后，返回最后一次模型响应，不额外调用模型进行汇总。', file: 'executor.py · return' },
    { id: 'stop', label: '终止任务', tag: 'EMPTY PLAN', x: 40, y: 230, kind: 'finish', detail: '无法生成有效行动计划时，Agent 返回 None，不进入执行器。', file: 'agent.py · if not plan' },
  ],
  routes: [
    { id: 'input-plan', from: 'input', to: 'plan', d: 'M 180 122 H 230', kind: 'main' },
    { id: 'plan-parse', from: 'plan', to: 'parse', d: 'M 370 122 H 420', kind: 'main' },
    { id: 'parse-context', from: 'parse', to: 'context', d: 'M 560 122 H 610', kind: 'main', label: '有效计划', x: 585, y: 108 },
    { id: 'context-solve', from: 'context', to: 'solve', d: 'M 680 154 V 230', kind: 'main', label: '当前步骤', x: 720, y: 195 },
    { id: 'solve-history', from: 'solve', to: 'history', d: 'M 610 262 H 560', kind: 'main' },
    { id: 'history-context', from: 'history', to: 'context', d: 'M 490 230 V 201 Q 490 190 501 190 H 639 Q 650 190 650 179 V 154', kind: 'loop', label: '下一步 · 带入历史', x: 553, y: 178 },
    { id: 'history-finish', from: 'history', to: 'finish', d: 'M 420 262 H 370', kind: 'finish', label: '完成', x: 395, y: 246 },
    { id: 'parse-stop', from: 'parse', to: 'stop', d: 'M 490 90 V 50 H 200 Q 180 50 180 70 V 262', kind: 'finish', label: '无效 / 空计划', x: 282, y: 39 },
  ],
  sequence: ['input', 'plan', 'parse', 'context', 'solve', 'history', 'context', 'solve', 'history', 'finish'],
};

export const reflectionFlow: ExperimentFlow = {
  id: 'reflection', title: 'Reflection 代码反思迭代链路', eyebrow: '4-EXPERIMENT / REFLECTION',
  summary: '从一版素数函数开始，让模型评审并修改代码；短期记忆保存代码版本与反馈，串起每一轮迭代。',
  status: '已运行 · 3 轮 / 7 次响应',
  note: '蓝色是生成与评审主链，靛蓝是优化回环，绿色是结束分支。动画演示控制流程；输出代码的正确性另行执行校验。',
  record: '2026.09.06 · 素数实验达到 3 轮上限；已保存的对照校验通过，一百万以内得到 78,498 个素数。未做性能基准测试。',
  nodes: [
    { id: 'input', label: '接收编程任务', tag: 'TASK', x: 40, y: 90, detail: '检查任务非空，并重建 Memory；不同 run() 之间不共享代码与反馈。', file: 'Reflection/agent.py · run' },
    { id: 'generate', label: '生成初始代码', tag: 'GENERATE', x: 230, y: 90, detail: '使用初始生成模板调用模型，获得第一版代码；初次生成不计入迭代轮数。', file: 'agent.py · INITIAL_PROMPT' },
    { id: 'memory', label: '保存代码版本', tag: 'MEMORY', x: 420, y: 90, detail: '以 execution 类型保存代码；下一次评审通过 get_last_execution() 取最新版本。', file: 'memory.py · add_record' },
    { id: 'review', label: '评审最新代码', tag: 'REFLECT', x: 610, y: 90, detail: '模型结合任务和最新代码给出反馈，再以 reflection 类型写入短期记忆。', file: 'agent.py · REFLECT_PROMPT' },
    { id: 'check', label: '判断评审反馈', tag: 'CHECK', x: 610, y: 230, detail: '反馈去除首尾空白及指定标点后，必须恰为“无需改进”才提前结束；否则继续优化。', file: 'agent.py · feedback' },
    { id: 'refine', label: '按反馈优化', tag: 'REFINE', x: 420, y: 230, detail: '把任务、最新代码及本轮反馈填入优化模板，生成新版本并保存；轮数未满则再次评审。', file: 'agent.py · REFINE_PROMPT' },
    { id: 'finish', label: '返回最新代码', tag: 'RETURN', x: 230, y: 230, kind: 'finish', detail: '无需改进或达到轮数上限时返回最新代码文本。Agent 不会自动执行代码；本次素数结果另行验证。', file: 'agent.py · get_last_execution' },
  ],
  routes: [
    { id: 'input-generate', from: 'input', to: 'generate', d: 'M 180 122 H 230', kind: 'main' },
    { id: 'generate-memory', from: 'generate', to: 'memory', d: 'M 370 122 H 420', kind: 'main' },
    { id: 'memory-review', from: 'memory', to: 'review', d: 'M 560 122 H 610', kind: 'main' },
    { id: 'review-check', from: 'review', to: 'check', d: 'M 680 154 V 230', kind: 'main', label: '保存反馈', x: 723, y: 196 },
    { id: 'check-refine', from: 'check', to: 'refine', d: 'M 610 262 H 560', kind: 'loop', label: '需改进', x: 586, y: 247 },
    { id: 'refine-memory', from: 'refine', to: 'memory', d: 'M 490 230 V 154', kind: 'loop', label: '保存新版本 · 下一轮', x: 420, y: 197 },
    { id: 'refine-finish', from: 'refine', to: 'finish', d: 'M 420 262 H 370', kind: 'finish', label: '达上限', x: 396, y: 247 },
    { id: 'check-finish', from: 'check', to: 'finish', d: 'M 680 294 V 323 Q 680 334 669 334 H 311 Q 300 334 300 323 V 294', kind: 'finish', label: '无需改进 · 提前结束', x: 490, y: 356 },
  ],
  sequence: ['input', 'generate', 'memory', 'review', 'check', 'refine', 'memory', 'review', 'check', 'refine', 'finish'],
};

export const langGraphFlow: ExperimentFlow = {
  id: 'chapter-six-langgraph', title: 'LangGraph · 搜索问答状态链', eyebrow: '6-EXPERIMENT / LANGGRAPH',
  summary: 'SearchState 在理解、Tavily 搜索与答案生成节点之间传递查询、结果和执行阶段。',
  status: '已运行 · 真实 LLM + Tavily',
  note: '蓝色是 StateGraph 的固定主链，绿色是完成状态；搜索失败不会跳过回答节点，而是在答案生成时切换为已有知识回退提示。',
  record: '2026.09.09 · 真实 API 已完成 understand → search → answer 全链路；Tavily 返回结果，最终状态为 completed。离线注入客户端测试 1 项通过。',
  nodes: [
    { id: 'input', label: '接收问题', tag: 'INPUT', x: 20, y: 90, detail: 'run_search() 把用户问题写入 messages，并初始化查询、搜索结果、最终答案和 step。', file: 'LangGraph/graph.py · run_search' },
    { id: 'understand', label: '理解与改写', tag: 'UNDERSTAND', x: 170, y: 90, detail: 'LLM 提取用户需求和搜索词；当前性问题会注入当天日期，并保留可解释的关键词。', file: 'LangGraph/nodes.py · understand_query_node' },
    { id: 'search', label: 'Tavily 搜索', tag: 'SEARCH', x: 320, y: 90, detail: '使用 search_query 请求 Tavily，最多返回 5 条结果，并格式化标题、链接和摘要。异常时把 step 标记为 search_failed。', file: 'LangGraph/nodes.py · tavily_search_node' },
    { id: 'answer', label: '生成答案', tag: 'ANSWER', x: 470, y: 90, detail: '搜索成功时要求答案引用结果链接；搜索失败时改用 LLM 已有知识回答，并明确处于回退路径。', file: 'LangGraph/nodes.py · generate_answer_node' },
    { id: 'complete', label: '状态完成', tag: 'END', x: 620, y: 90, kind: 'finish', detail: '最终答案写入 final_answer，step 更新为 completed，随后 StateGraph 到达 END。', file: 'LangGraph/state.py · graph.py' },
  ],
  routes: [
    { id: 'input-understand', from: 'input', to: 'understand', d: 'M 160 122 H 170', kind: 'main' },
    { id: 'understand-search', from: 'understand', to: 'search', d: 'M 310 122 H 320', kind: 'main' },
    { id: 'search-answer', from: 'search', to: 'answer', d: 'M 460 122 H 470', kind: 'main', label: '成功 / 回退', x: 465, y: 108 },
    { id: 'answer-complete', from: 'answer', to: 'complete', d: 'M 610 122 H 620', kind: 'finish' },
  ],
  sequence: ['input', 'understand', 'search', 'answer', 'complete'],
};

export const myLlmFlow: ExperimentFlow = {
  id: 'chapter-seven-my-llm', title: 'MyLLM · Provider 扩展方法', eyebrow: '7-EXPERIMENT / MYLLM',
  summary: '通过继承 HelloAgentsLLM，仅拦截 ModelScope 分支；框架已有 Provider 继续交给父类初始化。',
  status: '已运行 · 真实 API 1 次',
  methods: [
    { name: '__init__', detail: '识别 modelscope 并创建兼容客户端' },
    { name: 'super().__init__', detail: '保留框架已有 Provider 行为' },
  ],
  legend: { main: '原生 Provider', loop: 'ModelScope 分支', finish: '初始化完成' },
  note: '蓝色是框架原生 Provider 分支，靛蓝是自定义 ModelScope 分支，绿色表示初始化完成；两条分支互斥，不会互相调用。',
  record: '2026.09.09 · 使用项目统一 DeepSeek 配置完成 1 次真实响应；ModelScope 分支已实现，但本次未使用独立 ModelScope 凭证发起调用。',
  nodes: [
    { id: 'input', label: '接收构造参数', tag: 'INIT', x: 30, y: 145, detail: '接收 model、api_key、base_url、provider 与其余模型参数。', file: '7-experiment/agents/my_llm.py · __init__' },
    { id: 'route', label: '判断 Provider', tag: 'BRANCH', x: 210, y: 145, detail: '只有 provider == "modelscope" 才进入自定义实现；其他值直接走父类。', file: '7-experiment/agents/my_llm.py · provider' },
    { id: 'modelscope', label: '组装 ModelScope', tag: 'CUSTOM', x: 410, y: 65, detail: '按显式参数、专用环境变量、统一环境变量的优先级解析密钥与模型，并创建 OpenAI 兼容客户端。', file: '7-experiment/agents/my_llm.py · ModelScope branch' },
    { id: 'parent', label: '复用父类实现', tag: 'SUPER', x: 410, y: 225, detail: 'OpenAI、DeepSeek、Qwen 等框架已有 Provider 原样传给 super().__init__()。', file: '7-experiment/agents/my_llm.py · super' },
    { id: 'ready', label: '得到 LLM 客户端', tag: 'READY', x: 625, y: 145, kind: 'finish', detail: '两条互斥分支最终都产生保持 HelloAgentsLLM 调用接口的客户端。', file: '7-experiment/demos/custom_llm_demo.py' },
  ],
  routes: [
    { id: 'input-route', from: 'input', to: 'route', d: 'M 170 177 H 210', kind: 'main' },
    { id: 'route-modelscope', from: 'route', to: 'modelscope', d: 'M 350 177 H 370 Q 380 177 380 167 V 107 Q 380 97 390 97 H 410', kind: 'loop', label: 'modelscope', x: 380, y: 131 },
    { id: 'route-parent', from: 'route', to: 'parent', d: 'M 350 177 H 370 Q 380 177 380 187 V 247 Q 380 257 390 257 H 410', kind: 'main', label: '其他 Provider', x: 380, y: 231 },
    { id: 'modelscope-ready', from: 'modelscope', to: 'ready', d: 'M 550 97 H 585 Q 595 97 595 107 V 167 Q 595 177 605 177 H 625', kind: 'finish' },
    { id: 'parent-ready', from: 'parent', to: 'ready', d: 'M 550 257 H 585 Q 595 257 595 247 V 187 Q 595 177 605 177 H 625', kind: 'finish' },
  ],
  sequence: ['input', 'route', 'modelscope', 'ready', 'input', 'route', 'parent', 'ready'],
};

export const mySimpleAgentFlow: ExperimentFlow = {
  id: 'chapter-seven-my-simple-agent', title: 'MySimpleAgent · 文本工具调用扩展', eyebrow: '7-EXPERIMENT / MY SIMPLE AGENT',
  summary: '在 SimpleAgent 对话历史之上增加文本动作解析、工具执行、Observation 回灌与可选流式响应。',
  status: '已运行 · 真实工具闭环',
  methods: [
    { name: 'run / _run_with_tools', detail: '多轮文本工具调用' },
    { name: 'stream_run', detail: '流式响应并保存完整历史' },
    { name: 'add / remove / list_tools', detail: '运行时工具管理' },
  ],
  legend: { main: '模型响应链', loop: '工具调用回环', finish: '直接返回' },
  note: '蓝色是每轮模型调用，靛蓝是检测到工具动作后的循环；没有工具动作时直接返回，工具能力关闭时也不会进入工具循环。',
  record: '2026.09.09 · 真实模型输出 python_calculator 调用，工具计算 18 × 7 得到 126，结果回灌后生成最终回答。',
  nodes: [
    { id: 'input', label: '组装对话消息', tag: 'MESSAGES', x: 20, y: 90, detail: '合并增强系统提示词、历史消息和当前用户输入；提示词包含已注册工具及文本调用格式。', file: '7-experiment/agents/my_simple_agent.py · run' },
    { id: 'model', label: '调用模型', tag: 'INVOKE', x: 185, y: 90, detail: '工具能力关闭时，这次响应直接成为最终答案；启用时继续解析文本动作。', file: '7-experiment/agents/my_simple_agent.py · llm.invoke' },
    { id: 'parse', label: '解析工具动作', tag: 'PARSE', x: 350, y: 90, detail: '使用正则提取一个或多个 [TOOL_CALL:工具名:参数]，保留动作名称、参数和原始文本。', file: '7-experiment/agents/my_simple_agent.py · _parse_tool_calls' },
    { id: 'execute', label: '执行注册工具', tag: 'TOOLS', x: 350, y: 235, detail: '计算器通过 registry.execute_tool 执行；其他工具按参数字典调用，错误会转成可读结果。', file: '7-experiment/agents/my_simple_agent.py · _execute_tool_call' },
    { id: 'observe', label: '回灌工具结果', tag: 'OBSERVE', x: 185, y: 235, detail: '追加清理后的 assistant 消息和工具执行结果，再进入下一轮模型调用；循环次数受 max_tool_iterations 限制。', file: '7-experiment/agents/my_simple_agent.py · _run_with_tools' },
    { id: 'finish', label: '保存并返回回答', tag: 'RETURN', x: 625, y: 90, kind: 'finish', detail: '没有工具动作时保存用户输入与最终响应；达到工具循环上限后还会进行一次收尾调用。', file: '7-experiment/agents/my_simple_agent.py · history' },
  ],
  routes: [
    { id: 'input-model', from: 'input', to: 'model', d: 'M 160 122 H 185', kind: 'main' },
    { id: 'model-parse', from: 'model', to: 'parse', d: 'M 325 122 H 350', kind: 'main' },
    { id: 'parse-finish', from: 'parse', to: 'finish', d: 'M 490 122 H 625', kind: 'finish', label: '无工具动作', x: 557, y: 108 },
    { id: 'parse-execute', from: 'parse', to: 'execute', d: 'M 420 154 V 235', kind: 'loop', label: '检测到动作', x: 463, y: 199 },
    { id: 'execute-observe', from: 'execute', to: 'observe', d: 'M 350 267 H 325', kind: 'loop' },
    { id: 'observe-model', from: 'observe', to: 'model', d: 'M 255 235 V 154', kind: 'loop', label: '下一轮', x: 292, y: 198 },
  ],
  sequence: ['input', 'model', 'parse', 'execute', 'observe', 'model', 'parse', 'finish'],
};

export const myReActAgentFlow: ExperimentFlow = {
  id: 'chapter-seven-my-react-agent', title: 'MyReActAgent · 解析与自纠扩展', eyebrow: '7-EXPERIMENT / MY REACT AGENT',
  summary: '保留 ReAct 的 Thought → Action → Observation 核心循环，增强输出解析、格式自纠和最终答案约束。',
  status: '已运行 · 计算与搜索闭环',
  methods: [
    { name: 'MY_REACT_PROMPT', detail: '约束输出格式与事实来源' },
    { name: 'run', detail: '格式错误不退出，写回 Observation' },
    { name: '_parse_output / _parse_action', detail: '兼容多种模型输出格式' },
  ],
  legend: { main: 'ReAct 主步骤', loop: 'Observation 回环', finish: '合法 Finish' },
  note: '蓝色是 ReAct 主步骤，靛蓝包含工具 Observation 与格式错误自纠两种回环；绿色只表示合法 Finish 返回。',
  record: '2026.09.09 · 真实 API 完成计算工具与搜索工具两条闭环；搜索答案未补造 Observation 中不存在的官网地址。',
  nodes: [
    { id: 'prompt', label: '构造增强 Prompt', tag: 'CONTEXT', x: 20, y: 90, detail: '注入工具清单、用户问题和当前执行历史，并要求每次只输出 Thought 与 Action。', file: '7-experiment/agents/my_react_agent.py · MY_REACT_PROMPT' },
    { id: 'model', label: '模型生成动作', tag: 'THINK', x: 175, y: 90, detail: '每一步调用 LLM；空响应会立即停止，非空响应交给增强解析器。', file: '7-experiment/agents/my_react_agent.py · run' },
    { id: 'parse', label: '健壮解析 Action', tag: 'PARSE', x: 330, y: 90, detail: '容忍代码围栏、加粗、多行 Thought、中英文标签与动作尾注，再提取 工具名[参数]。', file: '7-experiment/agents/my_react_agent.py · _parse_output' },
    { id: 'tool', label: '执行工具', tag: 'ACTION', x: 330, y: 235, detail: '合法的非 Finish 动作交给 ToolRegistry，执行结果作为 Observation 写入当前历史。', file: '7-experiment/agents/my_react_agent.py · execute_tool' },
    { id: 'repair', label: '格式自纠', tag: 'REPAIR', x: 175, y: 235, detail: 'Action 无效或 Finish 为空时不直接退出，而是把明确格式要求作为 Observation 回灌。', file: '7-experiment/agents/my_react_agent.py · self-correction' },
    { id: 'finish', label: '返回受约束答案', tag: 'FINISH', x: 625, y: 90, kind: 'finish', detail: '合法 Finish 保存历史并返回；提示词要求具体事实只能来自本轮 Observation。', file: '7-experiment/agents/my_react_agent.py · Finish' },
  ],
  routes: [
    { id: 'prompt-model', from: 'prompt', to: 'model', d: 'M 160 122 H 175', kind: 'main' },
    { id: 'model-parse', from: 'model', to: 'parse', d: 'M 315 122 H 330', kind: 'main' },
    { id: 'parse-finish', from: 'parse', to: 'finish', d: 'M 470 122 H 625', kind: 'finish', label: '合法 Finish', x: 547, y: 108 },
    { id: 'parse-tool', from: 'parse', to: 'tool', d: 'M 400 154 V 235', kind: 'loop', label: '工具动作', x: 438, y: 199 },
    { id: 'parse-repair', from: 'parse', to: 'repair', d: 'M 365 154 V 190 Q 365 200 355 200 H 255 Q 245 200 245 210 V 235', kind: 'loop', label: '格式无效', x: 305, y: 188 },
    { id: 'tool-prompt', from: 'tool', to: 'prompt', d: 'M 330 267 V 320 Q 330 330 320 330 H 90 Q 75 330 75 315 V 154', kind: 'loop', label: '工具 Observation', x: 205, y: 348 },
    { id: 'repair-prompt', from: 'repair', to: 'prompt', d: 'M 175 267 H 120 Q 110 267 110 257 V 154', kind: 'loop', label: '纠错 Observation', x: 119, y: 222 },
  ],
  sequence: ['prompt', 'model', 'parse', 'tool', 'prompt', 'model', 'parse', 'repair', 'prompt', 'model', 'parse', 'finish'],
};

export const myReflectionAgentFlow: ExperimentFlow = {
  id: 'chapter-seven-my-reflection-agent', title: 'MyReflectionAgent · 通用反思扩展', eyebrow: '7-EXPERIMENT / MY REFLECTION AGENT',
  summary: '把第四章面向代码的 Reflection 结构泛化为文本任务，并为每次 run 建立独立短期反思轨迹。',
  status: '已运行 · 3 次真实模型调用',
  methods: [
    { name: 'ReflectionMemory', detail: '记录 execution 与 reflection 轨迹' },
    { name: '_merge_prompts', detail: '允许局部覆盖三段模板' },
    { name: 'run / get_trajectory', detail: '执行通用反思并导出轨迹' },
    { name: '_is_no_improvement', detail: '严格判断提前停止短语' },
  ],
  legend: { main: '生成与评审', loop: '改进迭代', finish: '返回条件' },
  note: '蓝色是回答与评审主链，靛蓝是需要改进时的迭代回环；绿色包括“无需改进”和达到轮数上限两种返回条件。',
  record: '2026.09.09 · 真实 API 完成初始回答、反思、改进 3 次调用；5 项离线测试覆盖提前停止、零轮迭代、误判防护与异常响应。',
  nodes: [
    { id: 'input', label: '校验并重置记忆', tag: 'TASK', x: 20, y: 90, detail: '拒绝空任务；每次 run 新建 ReflectionMemory，使不同任务的中间轨迹彼此隔离。', file: '7-experiment/agents/my_reflection_agent.py · run' },
    { id: 'initial', label: '生成初始回答', tag: 'INITIAL', x: 175, y: 90, detail: '使用 initial 模板调用 LLM，并以 execution 类型保存第一版回答。', file: '7-experiment/agents/my_reflection_agent.py · initial' },
    { id: 'reflect', label: '反思当前回答', tag: 'REFLECT', x: 330, y: 90, detail: '读取最近一次 execution，结合原始任务生成反馈，并以 reflection 类型写入轨迹。', file: '7-experiment/agents/my_reflection_agent.py · reflect' },
    { id: 'check', label: '判断停止条件', tag: 'CHECK', x: 485, y: 90, detail: '只有完整反馈恰为“无需改进”或英文等价短语才提前停止，普通包含该词的反馈不会误判。', file: '7-experiment/agents/my_reflection_agent.py · _is_no_improvement' },
    { id: 'refine', label: '按反馈改进', tag: 'REFINE', x: 330, y: 235, detail: '把任务、上一版回答和反馈填入 refine 模板，生成新回答并追加为 execution。', file: '7-experiment/agents/my_reflection_agent.py · refine' },
    { id: 'finish', label: '保存最终问答', tag: 'RETURN', x: 640, y: 235, kind: 'finish', detail: '无需改进或达到 max_iterations 后，取最近回答写入 Agent 历史并返回。', file: '7-experiment/agents/my_reflection_agent.py · history' },
  ],
  routes: [
    { id: 'input-initial', from: 'input', to: 'initial', d: 'M 160 122 H 175', kind: 'main' },
    { id: 'initial-reflect', from: 'initial', to: 'reflect', d: 'M 315 122 H 330', kind: 'main' },
    { id: 'reflect-check', from: 'reflect', to: 'check', d: 'M 470 122 H 485', kind: 'main' },
    { id: 'check-finish', from: 'check', to: 'finish', d: 'M 555 154 V 205 Q 555 215 565 215 H 630 Q 640 215 640 225 V 235', kind: 'finish', label: '无需改进', x: 595, y: 202 },
    { id: 'check-refine', from: 'check', to: 'refine', d: 'M 555 154 V 190 Q 555 200 545 200 H 410 Q 400 200 400 210 V 235', kind: 'loop', label: '需要改进', x: 478, y: 188 },
    { id: 'refine-reflect', from: 'refine', to: 'reflect', d: 'M 400 235 V 154', kind: 'loop', label: '下一轮', x: 438, y: 198 },
    { id: 'refine-finish', from: 'refine', to: 'finish', d: 'M 470 267 H 640', kind: 'finish', label: '达到轮数上限', x: 555, y: 253 },
  ],
  sequence: ['input', 'initial', 'reflect', 'check', 'refine', 'reflect', 'check', 'finish'],
};

const chapterSixBase = { eyebrow: '6-EXPERIMENT / MULTI-AGENT', status: '已实现 · 流程动画', note: '蓝色是协作主链，靛蓝是状态或工具回环，绿色是可检查产出。' };

export const agentScopeFlow: ExperimentFlow = {
  ...chapterSixBase, id: 'chapter-six-agentscope', title: 'AgentScope · 三国狼人杀',
  summary: '模型负责发言与行动，Python 控制器裁定规则和状态。', record: '2026.09.06 · 对局流程已接入 AgentScope 实验源码。',
  nodes: [
    { id: 'input', label: '对局任务', tag: 'INPUT', x: 40, y: 160, detail: '创建六人三国狼人杀对局，载入角色与回合状态。', file: 'AgentScope/main.py' },
    { id: 'agents', label: '角色发言', tag: 'AGENTS', x: 230, y: 160, detail: '模型代理按身份发言并选择行动。', file: 'AgentScope/agents.py' },
    { id: 'rules', label: '规则裁定', tag: 'CONTROL', x: 420, y: 160, detail: 'Python 控制器检查行动是否合法并更新游戏状态。', file: 'AgentScope/game.py' },
    { id: 'output', label: '对局状态', tag: 'OUTPUT', x: 610, y: 160, kind: 'finish', detail: '输出每轮消息、存活状态与最终胜负。', file: 'AgentScope/output · game state' },
  ],
  routes: [
    { id: 'input-agents', from: 'input', to: 'agents', d: 'M 180 192 H 230', kind: 'main' },
    { id: 'agents-rules', from: 'agents', to: 'rules', d: 'M 370 192 H 420', kind: 'loop', label: '行动', x: 395, y: 178 },
    { id: 'rules-agents', from: 'rules', to: 'agents', d: 'M 490 224 V 270 H 300 Q 280 270 280 250 V 224', kind: 'loop', label: '下一回合', x: 385, y: 288 },
    { id: 'rules-output', from: 'rules', to: 'output', d: 'M 560 192 H 610', kind: 'finish', label: '结算', x: 585, y: 178 },
  ], sequence: ['input', 'agents', 'rules', 'agents', 'rules', 'output'],
};

export const autoGenFlow: ExperimentFlow = {
  ...chapterSixBase, id: 'chapter-six-autogen', title: 'AutoGen · 应用开发团队',
  summary: '产品经理、工程师、审查员与用户代理轮询协作完成应用。', record: '2026.09.06 · 生成应用与验收流程已接入 AutoGen 实验源码。',
  nodes: [
    { id: 'input', label: '产品需求', tag: 'INPUT', x: 40, y: 160, detail: '用户代理提出应用目标和验收要求。', file: 'AutoGen/main.py' },
    { id: 'team', label: '团队协作', tag: 'TEAM', x: 230, y: 160, detail: '产品经理、工程师和用户代理轮流推进任务。', file: 'AutoGen/team.py' },
    { id: 'tools', label: '文件工具', tag: 'TOOLS', x: 420, y: 160, detail: '工程师通过工作区工具写入和修改生成应用。', file: 'AutoGen/workspace_tools.py' },
    { id: 'review', label: '审查验收', tag: 'REVIEW', x: 420, y: 280, detail: '审查员检查实现，未通过时回到团队继续修改。', file: 'AutoGen/team.py · reviewer' },
    { id: 'output', label: 'generated_app', tag: 'OUTPUT', x: 610, y: 160, kind: 'finish', detail: '通过验收后保留可检查的应用文件。', file: 'AutoGen/generated_app/' },
  ],
  routes: [
    { id: 'input-team', from: 'input', to: 'team', d: 'M 180 192 H 230', kind: 'main' },
    { id: 'team-tools', from: 'team', to: 'tools', d: 'M 370 192 H 420', kind: 'loop', label: '实现', x: 395, y: 178 },
    { id: 'tools-review', from: 'tools', to: 'review', d: 'M 490 224 V 280', kind: 'main' },
    { id: 'review-team', from: 'review', to: 'team', d: 'M 420 312 H 300 Q 280 312 280 292 V 224', kind: 'loop', label: '需修改', x: 360, y: 330 },
    { id: 'review-output', from: 'review', to: 'output', d: 'M 560 312 H 580 Q 600 312 600 292 V 192 H 610', kind: 'finish', label: '通过', x: 580, y: 300 },
  ], sequence: ['input', 'team', 'tools', 'review', 'team', 'tools', 'review', 'output'],
};

export const camelFlow: ExperimentFlow = {
  ...chapterSixBase, id: 'chapter-six-camel', title: 'CAMEL · RolePlaying 共创',
  summary: 'AI 作家与 AI 心理学家逐章对话，共同生成电子书。', record: '2026.09.06 · 电子书与协作轨迹已接入 CAMEL 实验源码。',
  nodes: [
    { id: 'input', label: '写作目标', tag: 'INPUT', x: 40, y: 160, detail: '设定电子书主题、章节目标和角色任务。', file: 'CAMEL/main.py' },
    { id: 'writer', label: 'AI 作家', tag: 'WRITER', x: 230, y: 90, detail: '负责提出内容、组织章节并推进写作。', file: 'CAMEL/ebook.py · writer' },
    { id: 'psychologist', label: 'AI 心理学家', tag: 'REVIEWER', x: 230, y: 230, detail: '从心理学视角补充、质疑并审阅章节。', file: 'CAMEL/ebook.py · psychologist' },
    { id: 'dialogue', label: 'RolePlaying', tag: 'DIALOGUE', x: 460, y: 160, detail: '角色消息在会话轨迹中往返，直到章节完成。', file: 'CAMEL/main.py · RolePlaying' },
    { id: 'output', label: 'Markdown 电子书', tag: 'OUTPUT', x: 650, y: 160, kind: 'finish', detail: '保存章节内容与完整协作轨迹。', file: 'CAMEL/output/*.md' },
  ],
  routes: [
    { id: 'input-writer', from: 'input', to: 'writer', d: 'M 180 192 H 202 Q 214 192 214 172 V 122 Q 214 112 230 112', kind: 'main' },
    { id: 'input-psychologist', from: 'input', to: 'psychologist', d: 'M 180 192 H 202 Q 214 192 214 212 V 252 Q 214 262 230 262', kind: 'main' },
    { id: 'writer-dialogue', from: 'writer', to: 'dialogue', d: 'M 370 122 H 430 Q 450 122 450 142 V 180 H 460', kind: 'loop' },
    { id: 'psychologist-dialogue', from: 'psychologist', to: 'dialogue', d: 'M 370 262 H 430 Q 450 262 450 242 V 208 H 460', kind: 'loop' },
    { id: 'dialogue-writer', from: 'dialogue', to: 'writer', d: 'M 530 160 V 62 Q 530 45 513 45 H 410 Q 390 45 390 62 V 122 H 370', kind: 'loop', label: '下一轮', x: 410, y: 34 },
    { id: 'dialogue-output', from: 'dialogue', to: 'output', d: 'M 600 192 H 650', kind: 'finish', label: '章节完成', x: 625, y: 178 },
  ], sequence: ['input', 'writer', 'dialogue', 'psychologist', 'dialogue', 'writer', 'dialogue', 'output'],
};
