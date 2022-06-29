module.exports = {
  displayName: "App Design Backend",
  coverageReporters: ["text", "html", "lcov", "cobertura"],
  preset: "@shelf/jest-mongodb",
  moduleNameMapper: {
    "^/opt/(.*)$": "<rootDir>/src/dependencies/$1",
  },
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  roots: ["<rootDir>/src"],
  collectCoverage: true,
  collectCoverageFrom: [
    "./src/**/*.[jt]s",
  ],
};