// Minimal ambient types for subset-font (ships no declarations).
declare module "subset-font" {
  interface SubsetFontOptions {
    targetFormat?: "sfnt" | "woff" | "woff2";
    preserveNameIds?: number[];
    noLayoutClosure?: boolean;
    variationAxes?: Record<string, { min?: number; default?: number; max?: number }>;
  }
  export default function subsetFont(
    font: Uint8Array,
    text: string,
    options?: SubsetFontOptions,
  ): Promise<Buffer>;
}
