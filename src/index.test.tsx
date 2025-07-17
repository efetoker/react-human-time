import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { parseDate, formatRelativeTime, LiveRelativeTime } from './index';

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
});







