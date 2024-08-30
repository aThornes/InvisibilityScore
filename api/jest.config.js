module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@common/(.*)$": "<rootDir>/common/$1",
    "^@types/(.*)$": "<rootDir>/types/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/setupTests.js"],
};
