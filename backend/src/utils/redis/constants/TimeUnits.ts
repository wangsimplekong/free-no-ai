export enum TimeUnits {
  SECONDS = 'EX',
  MILLISECONDS = 'PX',
  MINUTES = 'MINUTES',
  HOURS = 'HOURS',
  DAYS = 'DAYS'
}

export const convertToSeconds = (value: number, unit: TimeUnits): number => {
  switch (unit) {
    case TimeUnits.SECONDS:
      return value;
    case TimeUnits.MILLISECONDS:
      return Math.floor(value / 1000);
    case TimeUnits.MINUTES:
      return value * 60;
    case TimeUnits.HOURS:
      return value * 60 * 60;
    case TimeUnits.DAYS:
      return value * 24 * 60 * 60;
    default:
      throw new Error(`Unsupported time unit: ${unit}`);
  }
};