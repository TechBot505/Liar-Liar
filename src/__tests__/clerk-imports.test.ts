import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Regression guard for the Clerk Core 3 (v7) upgrade.
 *
 * Statically verifies that every named import our source pulls from the bare
 * `@clerk/nextjs` entrypoint is actually a usable export of the INSTALLED
 * package — and, crucially, is NOT one of the control components Clerk removed in
 * Core 3 (`SignedIn`, `SignedOut`, `Protect`). Those names are still *type*-
 * exported (as functions that throw at runtime), so a plain "is it exported"
 * check would miss them; we subtract the removed set explicitly.
 *
 * We parse the package's shipped `.d.ts` files rather than `import`ing the
 * package, because `@clerk/nextjs` is not import-safe in a bare node env.
 */

const require = createRequire(import.meta.url);
// `@clerk/nextjs` does not expose `./package.json` via its exports map, so derive
// the package root from its resolved entry point instead.
const marker = join("@clerk", "nextjs");
const entry = require.resolve("@clerk/nextjs");
const pkgRoot = entry.slice(0, entry.indexOf(marker) + marker.length);
const typesDir = join(pkgRoot, "dist", "types");

/** Names exported (or re-exported) from a `.d.ts`, minus `type`-only exports. */
function parseExportedNames(dtsPath: string): Set<string> {
  const src = readFileSync(dtsPath, "utf8");
  const names = new Set<string>();

  // `export { A, B as C, type D } from '...'` and local `export { ... };`
  for (const m of src.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const raw of m[1].split(",")) {
      const token = raw.trim();
      if (!token || token.startsWith("type ")) continue;
      // Use the outward-facing name: the alias after `as`, else the identifier.
      const name = token.split(/\s+as\s+/).pop()!.trim();
      if (/^[A-Za-z_$][\w$]*$/.test(name)) names.add(name);
    }
  }

  // `export declare const|function|class NAME`
  for (const m of src.matchAll(/export\s+declare\s+(?:const|function|class)\s+([A-Za-z_$][\w$]*)/g)) {
    names.add(m[1]);
  }

  return names;
}

const exportedNames = parseExportedNames(join(typesDir, "index.d.ts"));
const removedNames = parseExportedNames(join(typesDir, "removedControlComponents.d.ts"));
// Usable = exported by the entrypoint AND not a Core-3-removed throwing stub.
const usableNames = new Set([...exportedNames].filter((n) => !removedNames.has(n)));

/** Named imports from the bare `@clerk/nextjs` entrypoint across our source. */
function collectClerkImports(): { file: string; name: string }[] {
  const { readdirSync } = require("node:fs") as typeof import("node:fs");
  const srcDir = fileURLToPath(new URL("..", import.meta.url));
  const files = readdirSync(srcDir, { recursive: true, encoding: "utf8" })
    .filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"))
    .map((f) => join(srcDir, f));

  const importRe = /import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*["']@clerk\/nextjs["']/g;
  const out: { file: string; name: string }[] = [];
  for (const file of files) {
    const src = readFileSync(file, "utf8");
    for (const m of src.matchAll(importRe)) {
      for (const raw of m[1].split(",")) {
        const token = raw.trim();
        if (!token || token.startsWith("type ")) continue;
        const name = token.split(/\s+as\s+/)[0].trim();
        if (/^[A-Za-z_$][\w$]*$/.test(name)) out.push({ file, name });
      }
    }
  }
  return out;
}

describe("@clerk/nextjs Core 3 import compatibility", () => {
  it("sanity: parsed a non-trivial export surface incl. Show and useAuth", () => {
    expect(usableNames.has("Show")).toBe(true);
    expect(usableNames.has("useAuth")).toBe(true);
    expect(removedNames.has("SignedIn")).toBe(true);
  });

  it("never imports a Core-3-removed control component", () => {
    const offenders = collectClerkImports().filter((i) => removedNames.has(i.name));
    expect(offenders, `Removed in Core 3: ${JSON.stringify(offenders)}`).toEqual([]);
  });

  it("only imports names the installed @clerk/nextjs actually exports", () => {
    const offenders = collectClerkImports().filter((i) => !usableNames.has(i.name));
    expect(offenders, `Not exported by @clerk/nextjs: ${JSON.stringify(offenders)}`).toEqual([]);
  });
});
