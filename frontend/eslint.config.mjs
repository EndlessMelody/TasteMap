import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Tailwind was removed in Phase 6 of the Once UI migration (see
// frontend/MIGRATION_PLAYBOOK.md). These utility-class fragments would only
// appear in className strings if Tailwind-style markup crept back in.
const TAILWIND_CLASS_PATTERN =
  "/\\b(flex|flex-col|flex-row|grid|grid-cols-\\d|px-\\d|py-\\d|pt-\\d|pb-\\d|pl-\\d|pr-\\d|mx-\\d|my-\\d|mt-\\d|mb-\\d|ml-\\d|mr-\\d|gap-\\d|w-\\[|h-\\[|max-w-\\[|min-w-\\[|rounded-(none|xs|sm|md|lg|xl|2xl|3xl|full)|bg-\\[|text-\\[|border-\\[|space-x-\\d|space-y-\\d|absolute|relative|fixed|sticky|inset-\\d|inset-0|z-\\[|backdrop-blur(-\\w+)?|animate-(spin|pulse|ping|bounce))\\b/";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXOpeningElement[name.name='div']",
          message:
            "Raw <div> is banned in app/** and components/** — use Column, Row, or Grid from @once-ui-system/core instead (see .claude/rules/01-frontend-ui.md).",
        },
        {
          selector: `JSXAttribute[name.name='className'] Literal[value=${TAILWIND_CLASS_PATTERN}]`,
          message:
            "Tailwind utility classNames are banned — Tailwind was removed from this project (Phase 6). Use Once UI props or inline style instead.",
        },
        {
          selector: `JSXExpressionContainer > TemplateLiteral > TemplateElement[value.raw=${TAILWIND_CLASS_PATTERN}]`,
          message:
            "Tailwind utility classNames are banned — Tailwind was removed from this project (Phase 6). Use Once UI props or inline style instead.",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
