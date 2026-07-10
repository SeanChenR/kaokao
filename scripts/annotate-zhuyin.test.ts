import { afterAll, describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, readFile, writeFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { annotate, lineToRich, pinyinToZhuyin } from "./annotate-zhuyin";

const ZHUYIN = /^(?:˙[ㄅ-ㄩ]+|[ㄅ-ㄩ]+[ˊˇˋ]?)$/u;
const REPO_QUESTIONS = path.resolve(import.meta.dir, "../src/data/questions.json");

// Fixed draft sample — deliberately mixes Chinese, punctuation, digits and
// latin runs so the token rules and idempotency are all exercised.
const SAMPLE = ["水果", "小明長大了。", "有2隻貓和3本書", "ABC 你好"].join("\n");

const tmpRoots: string[] = [];
async function scratch(): Promise<{ draftsDir: string; stagingDir: string }> {
  const root = await mkdtemp(path.join(tmpdir(), "annotate-test-"));
  tmpRoots.push(root);
  const draftsDir = path.join(root, "drafts");
  await mkdir(draftsDir, { recursive: true });
  await writeFile(path.join(draftsDir, "sample.txt"), SAMPLE);
  return { draftsDir, stagingDir: path.join(root, "staging") };
}

afterAll(async () => {
  await Promise.all(tmpRoots.map((r) => rm(r, { recursive: true, force: true })));
});

describe("pinyinToZhuyin", () => {
  test.each([
    ["shuǐ", "ㄕㄨㄟˇ"],
    ["zhǎng", "ㄓㄤˇ"],
    ["háng", "ㄏㄤˊ"],
    ["yuè", "ㄩㄝˋ"],
    ["de", "˙ㄉㄜ"], // 輕聲前置
    ["zhī", "ㄓ"], // 空韻
    ["ér", "ㄦˊ"],
    ["jué", "ㄐㄩㄝˊ"],
  ])("converts %s -> %s and stays valid", (py, want) => {
    const got = pinyinToZhuyin(py);
    expect(got).toBe(want);
    expect(ZHUYIN.test(got)).toBe(true);
  });
});

describe("lineToRich", () => {
  test("each Chinese char is its own token with a legal zhuyin", () => {
    const rich = lineToRich("水果");
    const zs = rich.flat().map((t) => t.z);
    expect(zs).toEqual(["ㄕㄨㄟˇ", "ㄍㄨㄛˇ"]);
    for (const z of zs) expect(ZHUYIN.test(z!)).toBe(true);
  });

  test("a run of non-Chinese characters is a single token without zhuyin", () => {
    const rich = lineToRich("有2隻貓");
    const digitToken = rich.flat().find((t) => t.t === "2");
    expect(digitToken).toBeDefined();
    expect(digitToken!.z).toBeUndefined();
    // every non-Han token carries no zhuyin; every Han token does
    for (const tok of rich.flat()) {
      const isHan = /\p{Script=Han}/u.test(tok.t);
      expect(tok.z === undefined).toBe(!isHan);
    }
  });
});

describe("annotate", () => {
  test("rerun over unchanged drafts is byte-identical", async () => {
    const { draftsDir, stagingDir } = await scratch();
    const firstPaths = await annotate({ draftsDir, stagingDir });
    const first = await readFile(firstPaths[0]!, "utf8");
    const secondPaths = await annotate({ draftsDir, stagingDir });
    const second = await readFile(secondPaths[0]!, "utf8");
    expect(secondPaths).toEqual(firstPaths);
    expect(second).toBe(first);
  });

  test("output lands in stagingDir and never touches questions.json", async () => {
    const { draftsDir, stagingDir } = await scratch();
    const before = await readFile(REPO_QUESTIONS, "utf8");
    const beforeMtime = (await stat(REPO_QUESTIONS)).mtimeMs;

    const written = await annotate({ draftsDir, stagingDir });

    for (const p of written) {
      expect(p.startsWith(stagingDir)).toBe(true);
      expect(path.basename(p)).not.toBe("questions.json");
    }
    const after = await readFile(REPO_QUESTIONS, "utf8");
    expect(after).toBe(before);
    expect((await stat(REPO_QUESTIONS)).mtimeMs).toBe(beforeMtime);
  });

  test("missing drafts directory throws an actionable Chinese error", async () => {
    const missing = path.join(tmpdir(), "annotate-nope-", String(Date.now()));
    await expect(
      annotate({ draftsDir: missing, stagingDir: path.join(tmpdir(), "annotate-out") }),
    ).rejects.toThrow(/找不到草稿目錄/);
  });
});
