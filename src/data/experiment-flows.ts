export type FlowNode = { id: string; label: string; tag: string; x: number; y: number; detail: string; file: string; kind?: string };
export type FlowRoute = { id: string; from: string; to: string; d: string; kind: 'main' | 'loop' | 'finish'; label?: string; x?: number; y?: number };
export type ExperimentFlow = { id: string; title: string; eyebrow: string; summary: string; status: string; note: string; record: string; nodes: FlowNode[]; routes: FlowRoute[]; sequence: string[] };

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
