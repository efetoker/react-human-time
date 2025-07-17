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
    // Assumes Unix timestamp in seconds if the number is less than 1,000,000,000,000
    return new Date(dateInput * (Math.abs(dateInput).toString().length < 13 ? 1000 : 1));
  }

  if (typeof dateInput === 'string') {
    const date = new Date(dateInput);
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


