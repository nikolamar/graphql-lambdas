import { randomIntFromInterval } from "./numbers";

describe("random.utils.ts", () => {
  describe("randomInt util test", () => {
    const testCases = [
      [1, 10],
      [2, 5],
      [0, 3],
    ];

    it.each(testCases)("should generate a random int between %i and %i", (min: number, max: number) => {
      for (let _ = 0; _ < 3; _++) {
        const rand = randomIntFromInterval(min, max);
        expect(rand).toBeGreaterThanOrEqual(min);
        expect(rand).toBeLessThanOrEqual(max);
      }
    });
  });
});