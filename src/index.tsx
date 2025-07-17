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

export const formatRelativeTime = (
  dateInput: DateInput,
  options: FormatRelativeTimeOptions = {}
): string | null => {
  const date = parseDate(dateInput);
  if (!date) {
    return null;
  }

  const {
    locale = 'en',
    style = 'long',
    numeric = 'auto',
    threshold,
    absoluteFormatOptions,
  } = options;

  const now = new Date();
  const diffInSeconds = (date.getTime() - now.getTime()) / 1000;

  if (threshold && Math.abs(diffInSeconds) > threshold) {
    return new Intl.DateTimeFormat(locale, absoluteFormatOptions).format(date);
  }

  const rtf = new Intl.RelativeTimeFormat(locale, { style, numeric });

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
      return rtf.format(value, unit);
    }
  }

  return rtf.format(0, 'second');
};

type LiveRelativeTimeProps = {
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
    const { updateInterval } = this.props;
    this.timer = setInterval(() => {
      const timeString = formatRelativeTime(this.props.timestamp, this.props);
      this.setState({ timeString });
      if (timeString && this.props.onEnd && timeString.includes('ago')) {
        const date = parseDate(this.props.timestamp);
        if (date && new Date() > date) {
          this.props.onEnd();
        }
      }
    }, updateInterval || 1000);
  }

  private stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  render(): React.ReactNode {
    const { prefix, suffix, className, style } = this.props;
    const { timeString } = this.state;

    return (
      <span className={className} style={style}>
        {prefix}
        {timeString}
        {suffix}
      </span>
    );
  }
}


