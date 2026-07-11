# question-bank Specification

## Purpose

TBD - created by archiving change 'question-bank'. Update Purpose after archive.

## Requirements

### Requirement: Question bank data shape

The question bank SHALL be a single static JSON file containing at least three questions of every type (single, multi, fill, match, image), fifteen or more in total, targeted at mid-grade elementary students mixing Mandarin-language and general-knowledge topics. All human-readable text (stems, options, labels, fill suffixes) SHALL use the rich zhuyin shape: an array of word segments, each segment an array of tokens, where every Chinese-character token carries exactly one zhuyin reading and every non-Chinese run is a single token without zhuyin.

#### Scenario: Bank passes structural validation

- **WHEN** validateBank runs against the canonical question bank
- **THEN** it reports zero errors: every Chinese character has a zhuyin reading matching `^[ㄅ-ㄩ]+[ˊˇˋ˙]?$`, every answer index is in range, every match question maps left to right one-to-one, and every type has at least three questions

#### Scenario: Broken data is caught with actionable errors

- **WHEN** validateBank runs against a question missing a zhuyin reading or with an out-of-range answer index
- **THEN** the returned error list names the question id and the offending field

---
### Requirement: Polyphone coverage and regression guard

The bank content SHALL deliberately include at least three polyphonic-character pairs — the same Chinese character appearing in different questions with different, context-correct zhuyin readings (for example 長 as ㄔㄤˊ and ㄓㄤˇ). A golden test SHALL pin the expected reading of each curated polyphone occurrence so any future edit that mislabels one fails the suite.

#### Scenario: Same character, two readings

- **WHEN** the golden polyphone test runs
- **THEN** it finds at least three characters that each appear with two distinct pinned readings across the bank, and every pinned occurrence matches the bank content

---
### Requirement: Idempotent zhuyin authoring pipeline

The authoring script SHALL convert plain-text drafts into staging JSON with pinyin-pro word segmentation and zhuyin readings, and SHALL never write to the canonical question bank file. Re-running the script with unchanged drafts SHALL produce byte-identical staging output. When the drafts directory is missing, the script SHALL fail with an actionable Chinese error message.

#### Scenario: Rerun is idempotent

- **WHEN** the annotate script runs twice over the same drafts
- **THEN** the staging output is identical and the canonical questions.json is untouched

---
### Requirement: Font glyph coverage for bank content

Every character used anywhere in the question bank, plus all zhuyin symbols and tone marks, SHALL have a glyph in the shipped subset font. An automated test SHALL read the woff2 character map and fail when any bank character is missing.

#### Scenario: No tofu at runtime

- **WHEN** the charset coverage test runs against the emitted huninn-400.woff2
- **THEN** every distinct character across all stems, options, labels, suffixes, and zhuyin readings is present in the font cmap
