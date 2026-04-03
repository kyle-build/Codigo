const path = require("path");

module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: [
      path.resolve(__dirname, "./apps/client/tsconfig.json"),
      path.resolve(__dirname, "./apps/server/tsconfig.json"),
    ],
    tsconfigRootDir: __dirname,
  },
};
