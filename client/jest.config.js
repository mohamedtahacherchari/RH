/** @type {import('ts-jest').JestConfigWithTsJest} **/
/*export default {
  testEnvironment: "node",
  transform: {
    "^.+\.tsx?$": ["ts-jest",{}],
  },
};
*/

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: "ts-jest",
  testEnvironment: "jsdom", // ✅ important pour React
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {}],
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"], // pour jest-dom
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy", // si tu importes du CSS
    "^@/(.*)$": "<rootDir>/src/$1" // si tu utilises des alias comme @/components
  }
};   