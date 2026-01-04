/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type must be one of these
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation
        'style',    // Formatting, missing semicolons, etc.
        'refactor', // Code refactoring
        'perf',     // Performance improvements
        'test',     // Adding tests
        'build',    // Build system or external dependencies
        'ci',       // CI/CD configuration
        'chore',    // Maintenance tasks
        'revert',   // Revert a previous commit
      ],
    ],
    // Scope is optional but must be lowercase
    'scope-case': [2, 'always', 'lower-case'],
    // Subject must be lowercase
    'subject-case': [2, 'always', 'lower-case'],
    // Subject must not be empty
    'subject-empty': [2, 'never'],
    // Subject must not end with period
    'subject-full-stop': [2, 'never', '.'],
    // Header max length
    'header-max-length': [2, 'always', 100],
  },
  // Allow Thai characters in commit messages
  parserPreset: {
    parserOpts: {
      headerPattern: /^(\w+)(?:\(([^\)]*)\))?: (.+)$/,
      headerCorrespondence: ['type', 'scope', 'subject'],
    },
  },
};
