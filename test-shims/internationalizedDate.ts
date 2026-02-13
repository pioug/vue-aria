export class CalendarDate {
  calendar: string;
  year: number;
  month: number;
  day: number;

  constructor(year: number, month: number, day: number) {
    this.calendar = 'gregory';
    this.year = year;
    this.month = month;
    this.day = day;
  }

  toDate(_timeZone?: string) {
    return new Date(this.year, this.month - 1, this.day);
  }
}

export class CalendarDateTime extends CalendarDate {
  hour: number;
  minute: number;
  second: number;
  millisecond: number;

  constructor(year: number, month: number, day: number, hour = 0, minute = 0, second = 0, millisecond = 0) {
    super(year, month, day);
    this.hour = hour;
    this.minute = minute;
    this.second = second;
    this.millisecond = millisecond;
  }

  toDate(_timeZone?: string) {
    return new Date(this.year, this.month - 1, this.day, this.hour, this.minute, this.second, this.millisecond);
  }
}

export class ZonedDateTime extends CalendarDateTime {
  timeZone: string;

  constructor(
    year: number,
    month: number,
    day: number,
    timeZone = 'UTC',
    _offset = 0,
    hour = 0,
    minute = 0,
    second = 0,
    millisecond = 0
  ) {
    super(year, month, day, hour, minute, second, millisecond);
    this.timeZone = timeZone;
  }
}

export class Time {
  hour: number;
  minute: number;
  second: number;
  millisecond: number;

  constructor(hour: number, minute = 0, second = 0, millisecond = 0) {
    this.hour = hour;
    this.minute = minute;
    this.second = second;
    this.millisecond = millisecond;
  }
}

export class DateFormatter {
  private options: Intl.DateTimeFormatOptions;

  constructor(_locale: string, options: Intl.DateTimeFormatOptions = {}) {
    this.options = options;
  }

  format(value: Date) {
    return value instanceof Date ? value.toISOString() : String(value);
  }

  formatRange(start: Date, end: Date) {
    return `${this.format(start)}-${this.format(end)}`;
  }

  resolvedOptions() {
    return {
      timeZone: this.options.timeZone ?? 'UTC'
    };
  }
}

export function getLocalTimeZone() {
  return 'UTC';
}

export function today(_timeZone: string) {
  return new CalendarDate(1970, 1, 1);
}

export function toCalendarDateTime(date: CalendarDate, time: Time) {
  return new CalendarDateTime(
    date.year,
    date.month,
    date.day,
    time.hour,
    time.minute,
    time.second,
    time.millisecond
  );
}
