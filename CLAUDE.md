<!-- SPECTRA:START v1.0.2 -->

# Spectra Instructions

This project uses Spectra for Spec-Driven Development(SDD). Specs live in `openspec/specs/`, change proposals in `openspec/changes/`.

## Use `/spectra-*` skills when:

- A discussion needs structure before coding → `/spectra-discuss`
- User wants to plan, propose, or design a change → `/spectra-propose`
- Tasks are ready to implement → `/spectra-apply`
- There's an in-progress change to continue → `/spectra-ingest`
- User asks about specs or how something works → `/spectra-ask`
- Implementation is done → `/spectra-archive`
- Commit only files related to a specific change → `/spectra-commit`

## Workflow

discuss? → propose → apply ⇄ ingest → archive

- `discuss` is optional — skip if requirements are clear
- Requirements change mid-work? Plan mode → `ingest` → resume `apply`

## Parked Changes

Changes can be parked（暫存）— temporarily moved out of `openspec/changes/`. Parked changes won't appear in `spectra list` but can be found with `spectra list --parked`. To restore: `spectra unpark <name>`. The `/spectra-apply` and `/spectra-ingest` skills handle parked changes automatically.

<!-- SPECTRA:END -->

# Project Rules

開發規範集中在 `docs/rules/`,動工前先讀:

- `docs/rules/workflow.md` — Spectra SDD + Matt Pocock skills 的流程紀律(一次一個功能;stack/套件取捨必先與 Sean 討論)
- `docs/rules/stack.md` — 定案的技術棧(Bun、TS7/tsgo、React 19、Tailwind v4、Zustand、Radix、Motion…)
- `docs/rules/ui-style.md` — UI 風格指南(待設計討論後定案)

原始需求:`docs/reference/JD_SeniorProgrammer_frontend.pdf`(國小/國中學生線上測驗頁 take-home)。

## Agent skills

### Issue tracker

Issues 在 GitHub Issues(`SeanChenR/kaokao`),用 `gh` CLI。See `docs/agents/issue-tracker.md`.

### Triage labels

用預設五個 canonical labels(`needs-triage` / `needs-info` / `ready-for-agent` / `ready-for-human` / `wontfix`)。See `docs/agents/triage-labels.md`.

### Domain docs

Single-context:root `CONTEXT.md` + `docs/adr/`(lazily 建立)。See `docs/agents/domain.md`.
