import { isNodeEnvOneOf } from "./environment";

const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

beforeAll(() => {
  process.env.NODE_ENV = "prod";
});

afterAll(() => {
  process.env.NODE_ENV = ORIGINAL_NODE_ENV;
});

describe("environment config test", () => {
  describe("isNodeEnvOneOf helper function test", () => {
    const testCases = [
      [[], false],
      [["local", "demo"], false],
      [["local", "dev", "staging"], false],
      [["prod", "local"], true],
      [["prod"], true],
    ];

    it.each(testCases)(
      'should check if process.env.NODE_ENV="prod" is (not) in %o',
      (namespaces: any, expectedOutput: any) => {
        expect(isNodeEnvOneOf(...namespaces)).toEqual(expectedOutput);
      }
    );
  });
});
