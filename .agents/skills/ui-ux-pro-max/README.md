# UI UX Pro Max：本项目安装记录

项目级 Codex Skill，入口为 `SKILL.md`。适用于页面与组件设计、视觉打磨、响应式、交互、动效和无障碍审查。

- 上游：[nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
- 固定来源提交：`09170eec67eefd46a7ae85de61b40c194020f997`
- 安装日期：2026-10-03
- 许可证：MIT，完整条款见 `LICENSE`。
- 资源：使用 `skill-installer` 安装上游 `.claude/skills/ui-ux-pro-max` 中的完整 `data/`、`scripts/` 和 `references/`。
- Codex 入口：根据同一提交的 `src/ui-ux-pro-max/templates/platforms/codex.json`、`base/skill-content.md` 和 `base/quick-reference.md`，按上游 `cli/src/utils/template.ts` 的规则生成。脚本路径为 `.agents/skills/ui-ux-pro-max/scripts/search.py`。

## 使用

Python 3 已在本机验证可用。检索仅使用标准库和本地数据，无需 API 密钥。

从 `F:\blog` 运行：

```powershell
# Astro 实现建议
python -B .agents/skills/ui-ux-pro-max/scripts/search.py "content collections images" --stack astro --json

# 针对一个具体体验问题检索
python -B .agents/skills/ui-ux-pro-max/scripts/search.py "keyboard focus modal" --domain ux --json

# 探索全站设计方案；结果需结合项目现有风格审阅
python -B .agents/skills/ui-ux-pro-max/scripts/search.py "personal blog content reading" --design-system -p "QingYueBlog" -f markdown
```

从其他目录运行时，使用脚本绝对路径。`-B` 避免在 Skill 目录生成 Python 缓存。

在项目聊天中也可直接要求：`使用 $ui-ux-pro-max 检查首页的排版与移动端体验。`

检索建议应结合根目录 `AGENTS.md` 使用；本项目技术栈为 Astro，页面路径保留 `/QingYueBlog/` 前缀。设计系统持久化需要先核实结果，再显式使用 `--persist --output-dir "F:\blog"`。
