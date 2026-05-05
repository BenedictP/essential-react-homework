module.exports = {
  extends: '@callstack/eslint-config/node',
  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/__tests__/**/*.[jt]s?(x)',
          '**/?(*.)+(spec|test).[tj]s?(x)',
        ],
        packageDir: __dirname,
      },
    ],
  },
};
