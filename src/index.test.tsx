import React from 'react';
import { render, screen, act, renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  parseDate,
  formatRelativeTime,
  LiveRelativeTime,
  useLiveRelativeTime,
  calculateRelativeTime,
  RelativeTimeParts,
} from './index';

describe('parseDate', () => {
  it('should return a Date object for a valid Date object', () => {
    const date = new Date();
    expect(parseDate(date)).toEqual(date);
  });

  it('should return a Date object for a valid ISO string', () => {
    const date = new Date();
    expect(parseDate(date.toISOString())).toEqual(date);
  });

  it('should return a Date object for a valid Unix timestamp in seconds', () => {
    const timestamp = 1678886400;
    expect(parseDate(timestamp)).toEqual(new Date(timestamp * 1000));
  });

  it('should return a Date object for a valid Unix timestamp in milliseconds', () => {
    const timestamp = 1678886400000;
    expect(parseDate(timestamp)).toEqual(new Date(timestamp));
  });

  it('should return null for an invalid date string', () => {
    expect(parseDate('not a date')).toBeNull();
  });

  it('should return null for null', () => {
    expect(parseDate(null)).toBeNull();
  });

  it('should return null for undefined', () => {
    expect(parseDate(undefined)).toBeNull();
  });

  it('should return a Date object for a valid YYYY-MM-DD string', () => {
    const dateString = '2025-07-18';
    const expectedDate = new Date('2025-07-18T00:00:00');
    expect(parseDate(dateString)).toEqual(expectedDate);
  });

  it('should return a Date object for a valid YYYY/MM/DD string', () => {
    const dateString = '2025/07/18';
    const expectedDate = new Date('2025-07-18T00:00:00');
    expect(parseDate(dateString)).toEqual(expectedDate);
  });

  it('should return a Date object for a valid MM/DD/YYYY string', () => {
    const dateString = '07/18/2025';
    const expectedDate = new Date('2025-07-18T00:00:00');
    expect(parseDate(dateString)).toEqual(expectedDate);
  });

  it('should return a Date object for a full ISO string with timezone', () => {
    const dateString = '2025-07-18T10:00:00+05:30';
    const expectedDate = new Date(dateString);
    expect(parseDate(dateString)).toEqual(expectedDate);
  });

  it('should return null for an invalid YYYY-MM-DD string', () => {
    const dateString = '2025-99-99';
    expect(parseDate(dateString)).toBeNull();
  });

  it('should return null for other types', () => {
    expect(parseDate({} as any)).toBeNull();
  });
});

describe('formatRelativeTime', () => {
  it('should return a relative time string', () => {
    const date = new Date();
    date.setSeconds(date.getSeconds() - 10);
    expect(formatRelativeTime(date)).toBe('10 seconds ago');
  });

  it('should return null for an invalid date', () => {
    expect(formatRelativeTime('not a date')).toBeNull();
  });

  it('should use the provided locale', () => {
    const date = new Date();
    date.setHours(date.getHours() - 1);
    expect(formatRelativeTime(date, { locale: 'es' })).toBe('hace 1 hora');
  });

  it('should return an absolute date string if the threshold is exceeded', () => {
    const date = new Date();
    date.setDate(date.getDate() - 2);
    const expected = new Intl.DateTimeFormat('en').format(date);
    expect(formatRelativeTime(date, { threshold: 86400 })).toBe(expected);
  });

  it("should return 'now' for the current time", () => {
    expect(formatRelativeTime(new Date())).toMatch(
      /in \d+ seconds|now|\d+ seconds ago/
    );
  });
});

describe('calculateRelativeTime', () => {
  it('should return null for invalid date inputs', () => {
    expect(calculateRelativeTime('invalid-date')).toBeNull();
    expect(calculateRelativeTime('')).toBeNull();
  });

  it('should return correct parts for a date in the past', () => {
    const now = new Date();
    const pastDate = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago
    const parts = calculateRelativeTime(pastDate) as RelativeTimeParts;

    expect(parts.value).toBe(-5);
    expect(parts.unit).toBe('minute');
    expect(parts.diffInSeconds).toBeCloseTo(-300);
  });

  it('should return correct parts for a date in the future', () => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + 2 * 3600 * 1000); // 2 hours from now
    const parts = calculateRelativeTime(futureDate) as RelativeTimeParts;

    expect(parts.value).toBe(2);
    expect(parts.unit).toBe('hour');
    expect(parts.diffInSeconds).toBeCloseTo(7200);
  });

  it('should return 0 seconds for the same date', () => {
    const now = new Date();
    const parts = calculateRelativeTime(now) as RelativeTimeParts;

    expect(parts.value).toBe(0);
    expect(parts.unit).toBe('second');
    expect(parts.diffInSeconds).toBeCloseTo(0);
  });
});

describe('useLiveRelativeTime', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return a time string and update it over time', () => {
    const date = new Date();
    date.setSeconds(date.getSeconds() - 10);

    const { result, rerender } = renderHook(() => useLiveRelativeTime(date));

    expect(result.current).toBe('10 seconds ago');

    act(() => {
      jest.advanceTimersByTime(2000);
      rerender();
    });

    expect(result.current).toBe('12 seconds ago');
  });
});

describe('LiveRelativeTime', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render the time string', () => {
    const date = new Date();
    date.setSeconds(date.getSeconds() - 10);
    render(<LiveRelativeTime timestamp={date} />);
    expect(screen.getByText('10 seconds ago')).toBeInTheDocument();
  });

  it('should update the time string automatically', () => {
    const date = new Date();
    date.setSeconds(date.getSeconds() - 10);
    render(<LiveRelativeTime timestamp={date} updateInterval={1000} />);
    expect(screen.getByText('10 seconds ago')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText('11 seconds ago')).toBeInTheDocument();
  });

  it('should call onEnd when the time is up', () => {
    const onEnd = jest.fn();
    const date = new Date();
    date.setSeconds(date.getSeconds() + 1);
    render(<LiveRelativeTime timestamp={date} onEnd={onEnd} />);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(onEnd).toHaveBeenCalled();
  });

  it('should update the time string when the timestamp prop changes', () => {
    const date1 = new Date();
    date1.setSeconds(date1.getSeconds() - 10);
    const { rerender } = render(<LiveRelativeTime timestamp={date1} />);
    expect(screen.getByText('10 seconds ago')).toBeInTheDocument();

    const date2 = new Date();
    date2.setSeconds(date2.getSeconds() - 20);
    rerender(<LiveRelativeTime timestamp={date2} />);
    expect(screen.getByText('20 seconds ago')).toBeInTheDocument();
  });

  it('should use a dynamic update interval', () => {
    const date = new Date();
    date.setHours(date.getHours() - 2); // 2 hours ago
    render(<LiveRelativeTime timestamp={date} />);
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();

    // The interval should be 1 hour (3600 * 1000 ms)
    act(() => {
      jest.advanceTimersByTime(1000); // Advance by 1 second
    });

    // The text should NOT have updated
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3600 * 1000); // Advance by 1 hour
    });

    // The text SHOULD have updated
    expect(screen.getByText('3 hours ago')).toBeInTheDocument();
  });

  it('should render using a render prop', () => {
    const date = new Date();
    date.setSeconds(date.getSeconds() - 10);
    render(
      <LiveRelativeTime timestamp={date}>
        {(timeString) => <p>{timeString}</p>}
      </LiveRelativeTime>
    );
    expect(screen.getByText('10 seconds ago')).toBeInTheDocument();
  });
});








