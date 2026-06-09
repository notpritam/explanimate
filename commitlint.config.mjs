// ABOUTME: Commitlint rules — Conventional Commits with scopes that map to the skill's areas.
// ABOUTME: Enforced by the husky commit-msg hook so history stays machine-parseable.

export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [2, "always", ["repo", "skill", "references", "template", "scripts", "docs", "tooling", "release"]],
    "scope-empty": [2, "never"],
    "subject-case": [2, "never", ["upper-case", "pascal-case"]],
  },
};
