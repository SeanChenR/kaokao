/** 純裝飾星空層 — 星點只落在 bg 空白區,正文一律在 surface 卡片上(spec: Starfield background layer) */
export function StarField() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 bg-bg [background-image:var(--stars)]"
    />
  );
}
