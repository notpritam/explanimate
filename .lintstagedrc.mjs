// ABOUTME: lint-staged config for the pre-commit hook — runs only on staged files.
// ABOUTME: Source files get the ABOUTME header check; everything formattable gets Prettier.

export default {
  "*.{ts,tsx,js,jsx,mjs,cjs}": ["node tooling/scripts/check-headers.mjs", "prettier --write"],
  "*.{json,md,css,yaml,yml}": ["prettier --write"],
};
