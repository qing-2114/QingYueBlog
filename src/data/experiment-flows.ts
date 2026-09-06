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
    { id: 'input-plan', from: 'input', to: 'plan', d: 'M 184 122 H 224', kind: 'main' },
    { id: 'plan-parse', from: 'plan', to: 'parse', d: 'M 374 122 H 414', kind: 'main' },
    { id: 'parse-context', from: 'parse', to: 'context', d: 'M 564 122 H 604', kind: 'main', label: '有效计划', x: 585, y: 108 },
    { id: 'context-solve', from: 'context', to: 'solve', d: 'M 680 158 V 224', kind: 'main', label: '当前步骤', x: 720, y: 195 },
    { id: 'solve-history', from: 'solve', to: 'history', d: 'M 606 262 H 566', kind: 'main' },
    { id: 'history-context', from: 'history', to: 'context', d: 'M 490 226 V 201 Q 490 190 501 190 H 639 Q 650 190 650 179 V 158', kind: 'loop', label: '下一步 · 带入历史', x: 553, y: 178 },
    { id: 'history-finish', from: 'history', to: 'finish', d: 'M 416 262 H 376', kind: 'finish', label: '完成', x: 395, y: 246 },
    { id: 'parse-stop', from: 'parse', to: 'stop', d: 'M 490 86 V 61 Q 490 50 479 50 H 26 Q 15 50 15 61 V 251 Q 15 262 26 262 H 34', kind: 'finish', label: '无效 / 空计划', x: 282, y: 39 },
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
    { id: 'input-generate', from: 'input', to: 'generate', d: 'M 184 122 H 224', kind: 'main' },
    { id: 'generate-memory', from: 'generate', to: 'memory', d: 'M 374 122 H 414', kind: 'main' },
    { id: 'memory-review', from: 'memory', to: 'review', d: 'M 564 122 H 604', kind: 'main' },
    { id: 'review-check', from: 'review', to: 'check', d: 'M 680 158 V 224', kind: 'main', label: '保存反馈', x: 723, y: 196 },
    { id: 'check-refine', from: 'check', to: 'refine', d: 'M 606 262 H 566', kind: 'loop', label: '需改进', x: 586, y: 247 },
    { id: 'refine-memory', from: 'refine', to: 'memory', d: 'M 490 226 V 158', kind: 'loop', label: '保存新版本 · 下一轮', x: 420, y: 197 },
    { id: 'refine-finish', from: 'refine', to: 'finish', d: 'M 416 262 H 376', kind: 'finish', label: '达上限', x: 396, y: 247 },
    { id: 'check-finish', from: 'check', to: 'finish', d: 'M 680 298 V 323 Q 680 334 669 334 H 311 Q 300 334 300 323 V 300', kind: 'finish', label: '无需改进 · 提前结束', x: 490, y: 356 },
  ],
  sequence: ['input', 'generate', 'memory', 'review', 'check', 'refine', 'memory', 'review', 'check', 'refine', 'finish'],
};
