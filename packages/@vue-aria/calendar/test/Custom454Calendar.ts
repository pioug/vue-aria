import {
  type AnyCalendarDate,
  type Calendar,
  CalendarDate,
  type CalendarIdentifier,
  GregorianCalendar,
  startOfWeek,
} from "@internationalized/date";

// Matches upstream custom fiscal-month behavior used by React Aria tests.
export class Custom454Calendar extends GregorianCalendar {
  identifier: CalendarIdentifier = "gregory";
  private anchorDate: CalendarDate;
  private is454 = true;

  constructor() {
    super();
    this.anchorDate = new CalendarDate(2001, 2, 4);
  }

  getDaysInMonth(date: AnyCalendarDate): number {
    const [, isBigYear] = this.getCurrentYear(date.year);
    const weekPattern = this.getWeekPattern(isBigYear);
    return weekPattern[date.month - 1] * 7;
  }

  fromJulianDay(jd: number): CalendarDate {
    const date = super.fromJulianDay(jd);
    let year = date.year;

    let [start, isBigYear] = this.getCurrentYear(year);
    if (date.compare(start) < 0) {
      year -= 1;
      [start, isBigYear] = this.getCurrentYear(year);
    }

    const weeksInMonth = this.getWeekPattern(isBigYear);
    let pointer = start;
    for (let i = 0; i < weeksInMonth.length; i++) {
      const end = pointer.add({ weeks: weeksInMonth[i] });
      if (end.compare(date) > 0) {
        return new CalendarDate(this, year, i + 1, date.compare(pointer) + 1);
      }
      pointer = end;
    }

    throw new Error("date not found");
  }

  toJulianDay(date: AnyCalendarDate): number {
    const [startOfYear, isBigYear] = this.getCurrentYear(date.year);

    let startOfMonth = startOfYear;
    const weeksInMonth = this.getWeekPattern(isBigYear);
    for (let i = 0; i < date.month - 1; i++) {
      startOfMonth = startOfMonth.add({ weeks: weeksInMonth[i] });
    }

    return super.toJulianDay(startOfMonth.add({ days: date.day - 1 }));
  }

  getFormattableMonth(date: AnyCalendarDate): CalendarDate {
    const anchorMonth = this.anchorDate.month - 1;
    const dateMonth = date.month - 1;
    const month = ((anchorMonth + dateMonth) % 12) + 1;
    let year = date.year;

    if (anchorMonth + dateMonth >= 12) {
      year += 1;
    }

    return new CalendarDate(year, month, 1);
  }

  isEqual(other: Calendar): boolean {
    const other454 = other as Custom454Calendar;
    return other454.is454 === true && other454.anchorDate.compare(this.anchorDate) === 0;
  }

  private getWeekPattern(isBigYear: boolean): number[] {
    return isBigYear
      ? [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 5]
      : [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4];
  }

  private getCurrentYear(year: number): [CalendarDate, boolean] {
    const anchor = this.anchorDate.set({ year });
    const start = startOfWeek(anchor, "en-US", "sun");
    const isBigYear = !start.add({ weeks: 53 }).compare(anchor.add({ years: 1 }));
    return [start, isBigYear];
  }
}
