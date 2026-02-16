import {
  CalendarDate,
  type AnyDateTime,
  type Calendar,
  type DateValue,
  type ZonedDateTime,
} from "@internationalized/date";
import type { SegmentType } from "./types";

type HourCycle = "h12" | "h11" | "h23" | "h24";

/**
 * This class represents a date that is incomplete or otherwise invalid as a result of user editing.
 * For example, it can represent temporary dates such as February 31st if the user edits the day before the month.
 * Times are represented according to an hour cycle rather than always in 24 hour time.
 */
export class IncompleteDate {
  [key: string]: any;

  calendar: Calendar;
  era: string | null;
  year: number | null;
  month: number | null;
  day: number | null;
  hour: number | null;
  hourCycle: HourCycle;
  dayPeriod: number | null;
  minute: number | null;
  second: number | null;
  millisecond: number | null;
  offset: number | null;

  constructor(
    calendar: Calendar,
    hourCycle: HourCycle,
    dateValue?: Partial<Omit<AnyDateTime, "copy">> | null
  ) {
    this.era = dateValue?.era ?? null;
    this.calendar = calendar;
    this.year = dateValue?.year ?? null;
    this.month = dateValue?.month ?? null;
    this.day = dateValue?.day ?? null;
    this.hour = dateValue?.hour ?? null;
    this.hourCycle = hourCycle;
    this.dayPeriod = null;
    this.minute = dateValue?.minute ?? null;
    this.second = dateValue?.second ?? null;
    this.millisecond = dateValue?.millisecond ?? null;
    this.offset = "offset" in (dateValue ?? {}) ? (dateValue as any).offset : null;

    if (this.hour != null) {
      const [dayPeriod, hour] = toHourCycle(this.hour, hourCycle);
      this.dayPeriod = dayPeriod;
      this.hour = hour;
    }
  }

  copy(): IncompleteDate {
    const result = new IncompleteDate(this.calendar, this.hourCycle);
    result.era = this.era;
    result.year = this.year;
    result.month = this.month;
    result.day = this.day;
    result.hour = this.hour;
    result.dayPeriod = this.dayPeriod;
    result.minute = this.minute;
    result.second = this.second;
    result.millisecond = this.millisecond;
    result.offset = this.offset;
    return result;
  }

  isComplete(segments: SegmentType[]) {
    return segments.every((segment) => this[segment] != null);
  }

  validate(dt: DateValue, segments: SegmentType[]) {
    return segments.every((segment) => {
      if ((segment === "hour" || segment === "dayPeriod") && "hour" in (dt as any)) {
        const [dayPeriod, hour] = toHourCycle((dt as any).hour, this.hourCycle);
        return this.dayPeriod === dayPeriod && this.hour === hour;
      }

      return this[segment] === (dt as any)[segment];
    });
  }

  isCleared(segments: SegmentType[]): boolean {
    return segments.every((segment) => this[segment] === null);
  }

  set(field: SegmentType, value: number | string, placeholder: DateValue): IncompleteDate {
    const result = this.copy();
    result[field] = value;

    if (field === "hour" && result.dayPeriod == null && "hour" in (placeholder as any)) {
      result.dayPeriod = toHourCycle((placeholder as any).hour, this.hourCycle)[0];
    }

    if (field === "year" && result.era == null) {
      result.era = (placeholder as any).era;
    }

    if (field !== "second" && field !== "literal" && field !== "timeZoneName") {
      result.offset = null;
    }

    return result;
  }

  clear(field: SegmentType): IncompleteDate {
    const result = this.copy();
    result[field] = null;

    if (field === "year") {
      result.era = null;
    }

    result.offset = null;
    return result;
  }

  cycle(
    field: SegmentType,
    amount: number,
    placeholder: DateValue,
    displaySegments: SegmentType[]
  ): IncompleteDate {
    const result = this.copy();

    if (result[field] == null && field !== "dayPeriod" && field !== "era") {
      if (field === "hour" && "hour" in (placeholder as any)) {
        const [dayPeriod, hour] = toHourCycle((placeholder as any).hour, this.hourCycle);
        result.dayPeriod = dayPeriod;
        result.hour = hour;
      } else {
        result[field] = (placeholder as any)[field];
      }

      if (field === "year" && result.era == null) {
        result.era = (placeholder as any).era;
      }

      return result;
    }

    switch (field) {
      case "era": {
        const eras = this.calendar.getEras();
        let index = eras.indexOf(result.era!);
        index = cycleValue(index, amount, 0, eras.length - 1);
        result.era = eras[index];
        break;
      }
      case "year": {
        let date = new CalendarDate(
          this.calendar,
          this.era ?? (placeholder as any).era,
          this.year ?? (placeholder as any).year,
          this.month ?? 1,
          this.day ?? 1
        );
        date = date.cycle(field, amount, { round: field === "year" });
        result.era = date.era;
        result.year = date.year;
        break;
      }
      case "month":
        result.month = cycleValue(
          result.month ?? 1,
          amount,
          1,
          this.calendar.getMaximumMonthsInYear()
        );
        break;
      case "day":
        result.day = cycleValue(
          result.day ?? 1,
          amount,
          1,
          this.calendar.getMaximumDaysInMonth()
        );
        break;
      case "hour": {
        const hasDateSegments = displaySegments.some((segment) =>
          ["year", "month", "day"].includes(segment)
        );

        if (
          "timeZone" in (placeholder as any)
          && (!hasDateSegments
            || (result.year != null && result.month != null && result.day != null))
        ) {
          let date = this.toValue(placeholder) as ZonedDateTime;
          date = date.cycle("hour", amount, {
            hourCycle: this.hourCycle === "h12" ? 12 : 24,
            round: false,
          });
          const [dayPeriod, adjustedHour] = toHourCycle(date.hour, this.hourCycle);
          result.hour = adjustedHour;
          result.dayPeriod = dayPeriod;
          result.offset = date.offset;
        } else {
          const hours = result.hour ?? 0;
          const limits = this.getSegmentLimits("hour")!;
          result.hour = cycleValue(hours, amount, limits.minValue, limits.maxValue);
          if (result.dayPeriod == null && "hour" in (placeholder as any)) {
            result.dayPeriod = toHourCycle((placeholder as any).hour, this.hourCycle)[0];
          }
        }
        break;
      }
      case "dayPeriod":
        result.dayPeriod = cycleValue(result.dayPeriod ?? 0, amount, 0, 1);
        break;
      case "minute":
        result.minute = cycleValue(result.minute ?? 0, amount, 0, 59, true);
        break;
      case "second":
        result.second = cycleValue(result.second ?? 0, amount, 0, 59, true);
        break;
    }

    return result;
  }

  toValue(value: DateValue): DateValue {
    if ("hour" in (value as any)) {
      let hour = this.hour;
      if (hour != null) {
        hour = fromHourCycle(hour, this.dayPeriod ?? 0, this.hourCycle);
      } else if (this.hourCycle === "h12" || this.hourCycle === "h11") {
        hour = this.dayPeriod === 1 ? 12 : 0;
      }

      let result = (value as any).set({
        era: this.era ?? (value as any).era,
        year: this.year ?? (value as any).year,
        month: this.month ?? (value as any).month,
        day: this.day ?? (value as any).day,
        hour: hour ?? (value as any).hour,
        minute: this.minute ?? (value as any).minute,
        second: this.second ?? (value as any).second,
        millisecond: this.millisecond ?? (value as any).millisecond,
      });

      if ("offset" in result && this.offset != null && result.offset !== this.offset) {
        result = result.add({ milliseconds: result.offset - this.offset });
      }

      return result;
    }

    return (value as any).set({
      era: this.era ?? (value as any).era,
      year: this.year ?? (value as any).year,
      month: this.month ?? (value as any).month,
      day: this.day ?? (value as any).day,
    });
  }

  getSegmentLimits(type: string) {
    switch (type) {
      case "era": {
        const eras = this.calendar.getEras();
        return {
          value: this.era != null ? eras.indexOf(this.era) : eras.length - 1,
          minValue: 0,
          maxValue: eras.length - 1,
        };
      }
      case "year":
        return {
          value: this.year,
          minValue: 1,
          maxValue: 9999,
        };
      case "month":
        return {
          value: this.month,
          minValue: 1,
          maxValue: this.calendar.getMaximumMonthsInYear(),
        };
      case "day":
        return {
          value: this.day,
          minValue: 1,
          maxValue: this.calendar.getMaximumDaysInMonth(),
        };
      case "dayPeriod":
        return {
          value: this.dayPeriod,
          minValue: 0,
          maxValue: 1,
        };
      case "hour": {
        let minValue = 0;
        let maxValue = 23;

        if (this.hourCycle === "h12") {
          minValue = 1;
          maxValue = 12;
        } else if (this.hourCycle === "h11") {
          minValue = 0;
          maxValue = 11;
        }

        return {
          value: this.hour,
          minValue,
          maxValue,
        };
      }
      case "minute":
        return {
          value: this.minute,
          minValue: 0,
          maxValue: 59,
        };
      case "second":
        return {
          value: this.second,
          minValue: 0,
          maxValue: 59,
        };
      default:
        return undefined;
    }
  }
}

function cycleValue(
  value: number,
  amount: number,
  min: number,
  max: number,
  round = false
) {
  if (round) {
    value += Math.sign(amount);

    if (value < min) {
      value = max;
    }

    const step = Math.abs(amount);
    if (amount > 0) {
      value = Math.ceil(value / step) * step;
    } else {
      value = Math.floor(value / step) * step;
    }

    if (value > max) {
      value = min;
    }
  } else {
    value += amount;
    if (value < min) {
      value = max - (min - value - 1);
    } else if (value > max) {
      value = min + (value - max - 1);
    }
  }

  return value;
}

function toHourCycle(hour: number, hourCycle: HourCycle): [number | null, number] {
  let dayPeriod: number | null = hour >= 12 ? 1 : 0;

  switch (hourCycle) {
    case "h11":
      if (hour >= 12) {
        hour -= 12;
      }
      break;
    case "h12":
      if (hour === 0) {
        hour = 12;
      } else if (hour > 12) {
        hour -= 12;
      }
      break;
    case "h23":
      dayPeriod = null;
      break;
    case "h24":
      hour += 1;
      dayPeriod = null;
      break;
  }

  return [dayPeriod, hour];
}

function fromHourCycle(hour: number, dayPeriod: number, hourCycle: HourCycle): number {
  switch (hourCycle) {
    case "h11":
      if (dayPeriod === 1) {
        hour += 12;
      }
      break;
    case "h12":
      if (hour === 12) {
        hour = 0;
      }
      if (dayPeriod === 1) {
        hour += 12;
      }
      break;
    case "h24":
      hour -= 1;
      break;
  }

  return hour;
}
