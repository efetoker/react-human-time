# react-live-time

A lightweight and dependency-free React library for displaying human-readable, live-updating relative time.

[![npm version](https://badge.fury.io/js/react-live-time.svg)](https://badge.fury.io/js/react-live-time)

## Features

- **Flexible Usage**: Choose between a modern `useLiveRelativeTime` hook, a versatile `<LiveRelativeTime>` component, or a headless `calculateRelativeTime` function for full control.
- **Efficient**: The component and hook use a dynamic update interval, which means timestamps further in the past or future update less frequently, saving resources.
- **Lightweight & Dependency-Free**: No external dependencies, keeping your bundle size small.
- **Localization**: Uses the native `Intl.RelativeTimeFormat` API for robust and accurate internationalization.
- **Customizable & Composable**: Use the "Render Props" pattern (`children` as a function) to build any markup you need, or use the headless function to create your own components.
- **Threshold-Based Formatting**: Automatically switch from relative to absolute time after a certain period (e.g., "in 2 hours" -> "on July 17, 2025").

## Installation

```bash
npm install react-live-time
```

## Usage

There are three primary ways to use this library, depending on your needs.

### 1. `useLiveRelativeTime` Hook (Recommended)

For modern React applications, the `useLiveRelativeTime` hook is the simplest way to get a live-updating time string.

```jsx
import { useLiveRelativeTime } from 'react-live-time';

const Comment = ({ content, timestamp }) => {
  const timeAgo = useLiveRelativeTime(timestamp);

  return (
    <div className="comment">
      <p>{content}</p>
      <span className="timestamp">{timeAgo}</span>
    </div>
  );
};
```

### 2. `<LiveRelativeTime />` Component

The component offers more flexibility, including the ability to use a render prop (`children` as a function) for custom markup.

```jsx
import { LiveRelativeTime } from 'react-live-time';

const Article = ({ timestamp }) => {
  return (
    <p>
      Posted{' '}
      <LiveRelativeTime timestamp={timestamp}>
        {(formattedTime) => (
          <time dateTime={new Date(timestamp).toISOString()}>
            {formattedTime}
          </time>
        )}
      </LiveRelativeTime>
    </p>
  );
};
```

### 3. `calculateRelativeTime` Headless Function

For ultimate control, use the `calculateRelativeTime` function. It returns an object with the raw parts of the relative time, which you can use to build your own formatted strings or components.

```jsx
import { calculateRelativeTime } from 'react-live-time';

const Countdown = ({ to }) => {
  const parts = calculateRelativeTime(to);

  if (!parts) {
    return <span>Invalid date</span>;
  }

  // Example: "You have <strong>5</strong> minutes left."
  return (
    <span>
      You have <strong>{parts.value}</strong> {parts.unit} left.
    </span>
  );
};
```

## API and Customization

### `useLiveRelativeTime` Hook

| Argument | Type                                      | Default      | Description                                                                                             |
| -------- | ----------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------- |
| `timestamp` | `number \| string \| Date`                | **Required** | The target date/time.                                                                                   |
| `options`   | `FormatRelativeTimeOptions`               | `{}`         | An object with formatting options (see below).                                                          |

Returns the formatted time string.

### `<LiveRelativeTime />` Component Props

| Prop                  | Type                                      | Default      | Description                                                                                             |
| --------------------- | ----------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------- |
| `timestamp`           | `number \| string \| Date`                | **Required** | The target date/time to display. Accepts a `Date` object, Unix timestamp (ms or s), or a string. Supported string formats include ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`), `YYYY-MM-DD`, `YYYY/MM/DD`, and `MM/DD/YYYY`. |
| `children`            | `(time: string \| null) => React.ReactNode` | `undefined`  | A function that receives the formatted time string, allowing for custom rendering (Render Props pattern). |
| `updateInterval`      | `number`                                  | (dynamic)    | The interval in milliseconds. **If not set, the interval is dynamic**: shorter for recent times and longer for distant times. |
| `prefix`              | `string`                                  | `''`         | A string to prepend to the time output. Ignored if `children` is a function.                            |
| `suffix`              | `string`                                  | `''`         | A string to append to the time output. Ignored if `children` is a function.                             |
| `onEnd`               | `() => void`                              | `undefined`  | A callback function that fires when a future timestamp is reached.                                      |
| `className`           | `string`                                  | `undefined`  | Standard `className` prop for styling. Ignored if `children` is a function.                             |
| `style`               | `React.CSSProperties`                     | `undefined`  | Standard `style` prop for inline styling. Ignored if `children` is a function.                          |
| `...options`          | `FormatRelativeTimeOptions`               |              | All `FormatRelativeTimeOptions` are accepted as props.                                                  |

### `calculateRelativeTime` Function

| Argument | Type                                      | Default      | Description                                                                                             |
| -------- | ----------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------- |
| `dateInput` | `number \| string \| Date`                | **Required** | The target date/time.                                                                                   |

Returns a `RelativeTimeParts` object (`{ value, unit, diffInSeconds }`) or `null`.

### `FormatRelativeTimeOptions`

These options can be passed to the hook or as props to the component.

| Option                | Type                                      | Default      | Description                                                                                             |
| --------------------- | ----------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------- |
| `locale`              | `string`                                  | `'en'`       | The locale for formatting (e.g., `'es'`, `'fr'`, `'ja'`).                                                 |
| `style`               | `'long' \| 'short' \| 'narrow'`           | `'long'`     | The formatting style from `Intl.RelativeTimeFormat`.                                                    |
| `numeric`             | `'always' \| 'auto'`                      | `'auto'`     | The numeric option from `Intl.RelativeTimeFormat`. `'auto'` allows for strings like "yesterday".        |
| `threshold`           | `number`                                  | `undefined`  | A threshold in seconds. If the difference exceeds it, an absolute date is shown instead.                |
| `absoluteFormatOptions` | `Intl.DateTimeFormatOptions`              | `undefined`  | Options to format the absolute date when the `threshold` is met. See `Intl.DateTimeFormat` docs.      |

## License

MIT
