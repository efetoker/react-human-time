import React from 'react';

type DateInput = number | string | Date;

export const parseDate = (dateInput: DateInput | null | undefined): Date | null => {
  if (dateInput === null || dateInput === undefined) {
    return null;
  }

  if (dateInput instanceof Date) {
    return dateInput;
  }

  if (typeof dateInput === 'number') {
    // Handle Unix timestamps (seconds or milliseconds)
    return new Date(dateInput * (Math.abs(dateInput).toString().length < 13 ? 1000 : 1));
  }

  if (typeof dateInput === 'string') {
    let isoString: string | null = null;

    // Regex for YYYY-MM-DD or YYYY/MM/DD. Force local time.
    const yyyy_mm_dd = /^(\d{4})[-/](\d{2})[-/](\d{2})$/;
    let match = dateInput.match(yyyy_mm_dd);
    if (match) {
      isoString = `${match[1]}-${match[2]}-${match[3]}T00:00:00`;
    }

    // Regex for MM/DD/YYYY. Common US format.
    if (!isoString) {
      const mm_dd_yyyy = /^(\d{2})[-/](\d{2})[-/](\d{4})$/;
      match = dateInput.match(mm_dd_yyyy);
      if (match) {
        isoString = `${match[3]}-${match[1]}-${match[2]}T00:00:00`;
      }
    }

    // Use the original string if no regex matched. This handles full ISO strings.
    const stringToParse = isoString || dateInput;
    const date = new Date(stringToParse);

    // Final validation
    return isNaN(date.getTime()) ? null : date;
  }

  return null;
};

type FormatRelativeTimeOptions = {
  locale?: string;
  style?: 'long' | 'short' | 'narrow';
  numeric?: 'always' | 'auto';
  threshold?: number;
  absoluteFormatOptions?: Intl.DateTimeFormatOptions;
};

export type RelativeTimeParts = {
  value: number;
  unit: Intl.RelativeTimeFormatUnit;
  diffInSeconds: number;
};

export const calculateRelativeTime = (dateInput: DateInput): RelativeTimeParts | null => {
  const date = parseDate(dateInput);
  if (!date) {
    return null;
  }

  const now = new Date();
  const diffInSeconds = (date.getTime() - now.getTime()) / 1000;

  const units: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'week', seconds: 604800 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 },
  ];

  for (const { unit, seconds } of units) {
    const value = Math.round(diffInSeconds / seconds);
    if (Math.abs(value) >= 1) {
      return { value, unit, diffInSeconds };
    }
  }

  return { value: 0, unit: 'second', diffInSeconds };
};

export const formatRelativeTime = (
  dateInput: DateInput,
  options: FormatRelativeTimeOptions = {}
): string | null => {
  const {
    locale = 'en',
    style = 'long',
    numeric = 'auto',
    threshold,
    absoluteFormatOptions,
  } = options;

  const parts = calculateRelativeTime(dateInput);
  if (!parts) {
    return null;
  }

  const { value, unit, diffInSeconds } = parts;

  if (threshold && Math.abs(diffInSeconds) > threshold) {
    const date = parseDate(dateInput);
    return date ? new Intl.DateTimeFormat(locale, absoluteFormatOptions).format(date) : null;
  }

  const rtf = new Intl.RelativeTimeFormat(locale, { style, numeric });
  return rtf.format(value, unit);
};

type LiveRelativeTimeProps = {
  children?: (timeString: string | null) => React.ReactNode;
  timestamp: DateInput;
  locale?: string;
  updateInterval?: number;
  onEnd?: () => void;
  prefix?: string;
  suffix?: string;
  className?: string;
  style?: React.CSSProperties;
} & FormatRelativeTimeOptions;

type LiveRelativeTimeState = {
  timeString: string | null;
};

const _getDynamicInterval = (diffInSeconds: number): number => {
  const absDiff = Math.abs(diffInSeconds);
  if (absDiff < 60) return 1000; // 1 second
  if (absDiff < 3600) return 60 * 1000; // 1 minute
  if (absDiff < 86400) return 3600 * 1000; // 1 hour
  return -1; // Stop updating after 1 day
};

export const useLiveRelativeTime = (
  timestamp: DateInput,
  options: FormatRelativeTimeOptions = {}
) => {
  const [timeString, setTimeString] = React.useState(() =>
    formatRelativeTime(timestamp, options)
  );

  React.useEffect(() => {
    const parts = calculateRelativeTime(timestamp);
    if (!parts) return;

    const interval = _getDynamicInterval(parts.diffInSeconds);

    if (interval > 0) {
      const timer = setInterval(() => {
        setTimeString(formatRelativeTime(timestamp, options));
      }, interval);
      return () => clearInterval(timer);
    }
  }, [timestamp, options]);

  return timeString;
};

export class LiveRelativeTime extends React.Component<
  LiveRelativeTimeProps,
  LiveRelativeTimeState
> {
  private timer: NodeJS.Timeout | null = null;

  constructor(props: LiveRelativeTimeProps) {
    super(props);
    this.state = {
      timeString: formatRelativeTime(props.timestamp, props),
    };
  }

  componentDidMount() {
    this.startTimer();
  }

  componentWillUnmount() {
    this.stopTimer();
  }

  componentDidUpdate(prevProps: LiveRelativeTimeProps) {
    if (prevProps.timestamp !== this.props.timestamp) {
      this.setState({
        timeString: formatRelativeTime(this.props.timestamp, this.props),
      });
    }
  }

  private startTimer() {
    this.stopTimer();
    const parts = calculateRelativeTime(this.props.timestamp);
    if (!parts) return;

    const interval = this.props.updateInterval ?? _getDynamicInterval(parts.diffInSeconds);

    if (interval > 0) {
      this.timer = setInterval(() => {
        const newParts = calculateRelativeTime(this.props.timestamp);
        if (newParts) {
          this.setState({ timeString: formatRelativeTime(this.props.timestamp, this.props) });
          if (this.props.onEnd && newParts.diffInSeconds <= 0) {
            this.props.onEnd();
            this.stopTimer();
          }
        }
      }, interval);
    }
  }
  
  private stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  render(): React.ReactNode {
    const { children, prefix, suffix, className, style } = this.props;
    const { timeString } = this.state;

    if (typeof children === 'function') {
      return children(timeString);
    }

    return (
      <span className={className} style={style}>
        {prefix}
        {timeString}
        {suffix}
      </span>
    );
  }
}


