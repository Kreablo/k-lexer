/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testRegex: "/__tests__/.*[jt]s?(x)?",
    modulePaths: ["node_modules"],
    transform: {
        "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig-jest.json" }]
    }
};
