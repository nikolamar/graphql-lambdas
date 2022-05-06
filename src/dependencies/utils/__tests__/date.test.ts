import dayjs from "dayjs";
import * as DateUtils from "../date";
import { Sort } from "../date";
import { dateTime, smallDateFullTime, date, simpleDate, timestamp } from "../../configs/date-formats";
import MockDate from "mockdate";

describe("dates.utils.ts", () => {
  describe("sortByDate util test", () => {
    const testCases = [
      [{ date: "1" }, { date: "2" }, 1],
      [{ date: "2022-03-20" }, { date: "2022-03-24" }, 1],
      [{ date: "2022-03-25T19:00:00Z" }, { date: "2021-03-25T19:00:00Z" }, -1],
      [{ date: "2022-03-25T19:00:00Z" }, { date: "2022-03-25T19:00:00Z" }, 0],
    ];

    it.each(testCases)("should check the order of two dates", (a: Sort, b: Sort, expectedOutput: number) => {
      expect(DateUtils.sortByDate(a, b)).toEqual(expectedOutput);
    });
  });

  describe("utc util test", () => {
    beforeEach(() => {
      MockDate.set(new Date());
    });
        
    afterEach(() => {
      MockDate.reset();
    });

    const testCases = [
      [undefined, undefined, dayjs().utc().format()],
      ["2022-03-27T07:05:05", undefined, "2022-03-27T07:05:05Z"],
      ["2022-03-27T07:05:05", dateTime, "Mar 27, 2022 07:05 am"],
      ["2022-03-27T07:05:05", smallDateFullTime, "03/27/2022 7:05:05 AM"],
      ["2022-03-27T07:05:05", date, "03/27/2022"],
      ["2022-03-27T07:05:05", simpleDate, "03/27/22"],
      ["2022-03-27T07:05:05", timestamp, "20220327-0705"],
    ];

    it.each(testCases)(
      "should format %s in a given format %s as %s",
      (date: Date | string | undefined, format: string | undefined, expectedOutput: string) => {
        expect(DateUtils.utc(date, format)).toEqual(expectedOutput);
      }
    );
  });

  describe("getDatesBetweenDates util test", () => {
    const testCases = [
      ["2022-03-20", "2022-03-17", []],
      ["2022-03-20", "2022-03-20", ["2022-03-20T00:00:00Z"]],
      [
        "2022-03-20",
        "2022-03-24",
        [
          "2022-03-20T00:00:00Z",
          "2022-03-21T00:00:00Z",
          "2022-03-22T00:00:00Z",
          "2022-03-23T00:00:00Z",
          "2022-03-24T00:00:00Z",
        ],
      ],
      ["2022-03-20T00:00:00Z", "2022-03-21T00:00:00Z", ["2022-03-20T00:00:00Z", "2022-03-21T00:00:00Z"]],
    ];

    it.each(testCases)(
      "should return an array of dates between startDate and endDate",
      (startDate: string, endDate: string, expectedOutput: string[]) => {
        expect(DateUtils.getDatesBetweenDates(startDate, endDate)).toEqual(expectedOutput);
      }
    );
  });

  describe("getDateRanges", () => {
    it("should return an array", () => {
      expect(Array.isArray(DateUtils.getDateRange("2022-03-25", "2022-03-28"))).toBe(true);
    });

    it("should return an empty array if start > stop", () => {
      expect(DateUtils.getDateRange("2022-03-28", "2022-03-25")).toEqual([]);
    });

    const testCases = [
      ["2022-03-25", "2022-03-28", 4],
      ["2022-03-30", "2022-04-02", 4],
      ["2022-03-28", "2022-03-25", 0],
    ];

    it.each(testCases)(
      `should return all days between ${DateUtils.utc("%s", date)} and ${DateUtils.utc("%s", date)}`,
      (start: string, stop: string, expectedOutput) => {
        expect(DateUtils.getDateRange(start, stop).length).toEqual(expectedOutput);
      }
    );
  });
});
