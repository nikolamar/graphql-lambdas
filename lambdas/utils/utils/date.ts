import dayjs, { Dayjs } from "dayjs";
import utcPlugin from "dayjs/plugin/utc";

dayjs.extend(utcPlugin);

export type Range = string | number | Date | Dayjs;

export type Sort = { date: string };

export function getDateRange(start: Range, stop: Range): Range[] {
  const dateArray = [];
  let currentDate = dayjs(start);
  const stopDate = dayjs(stop);
  while (currentDate <= stopDate) {
    dateArray.push(dayjs(currentDate));
    currentDate = dayjs(currentDate).add(1, "days");
  }
  return dateArray;
}

export function utc(date?: Date | string, format?: string): string {
  if (!date) return dayjs().utc().format();
  if (format && date) return dayjs.utc(date).format(format);

  return dayjs.utc(date).format();
}

export const sortByDate = (a: Sort, b: Sort): number => {
  if (a.date < b.date) return 1;
  if (a.date > b.date) return -1;
  return 0;
};

export const getDatesBetweenDates = (start: string, end: string): string[] => {
  const dates: string[] = [];

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (startDate > endDate) {
    return [];
  }

  while (startDate < endDate) {
    dates.push(dayjs.utc(startDate).format());
    startDate.setDate(startDate.getDate() + 1);
  }

  return dates.concat(dayjs.utc(endDate).format());
};

export const getStartAndEndDateWithin24HourRange = () => {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  return [startDate.toISOString(), endDate.toISOString()];
};

export default dayjs;
