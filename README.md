# react-live-time

A lightweight and dependency-free React library for displaying human-readable, live-updating relative time without hooks.

[![npm version](https://badge.fury.io/js/react-live-time.svg)](https://badge.fury.io/js/react-live-time)

## Features

- **Dual-Mode**: Use a simple function for one-off formatting or a component for live updates.
- **Hook-Free**: The `<LiveRelativeTime />` component is a class component, ensuring compatibility with all React versions (legacy and modern).
- **Lightweight & Dependency-Free**: No external dependencies, keeping your bundle size small.
- **Localization**: Uses the native `Intl.RelativeTimeFormat` API for robust and accurate internationalization.
- **Customizable**: Control the output with prefixes, suffixes, custom formatting options, and styling.
- **Threshold-Based Formatting**: Automatically switch from relative to absolute time after a certain period (e.g., "in 2 hours" -> "on July 17, 2025").

## Installation

```bash
npm install react-live-time
```

## Usage

### 1. `formatRelativeTime` Function

For simple, one-time formatting, you can import and use the `formatRelativeTime` function directly.

```jsx
import { formatRelativeTime } from 'react-live-time';

const MyComponent = () => {
  const lastSeen = new Date(Date.now() - 1000 * 60 * 5); // 5 minutes ago
  const futureEvent = new Date(Date.now() + 1000 * 3600); // in 1 hour

  return (
    <div>
      <p>Last seen: {formatRelativeTime(lastSeen)}</p>
      <p>Event starts: {formatRelativeTime(futureEvent)}</p>
    </div>
  );
};
```

### 2. `<LiveRelativeTime />` Component

For a "live" timestamp that updates automatically, use the `<LiveRelativeTime />` component.

```jsx
import { LiveRelativeTime } from 'react-live-time';

const App = () => {
  const commentTimestamp = new Date(Date.now() - 1000 * 15); // 15 seconds ago

  return (
    <div>
      <p>
        Posted <LiveRelativeTime timestamp={commentTimestamp} />
      </p>
    </div>
  );
};
```

## API and Customization

### `<LiveRelativeTime />` Component Props

| Prop                  | Type                                      | Default      | Description                                                                                             |
| --------------------- | ----------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------- |
| `timestamp`           | `number \| string \| Date`                | **Required** | The target date/time to display. Accepts a `Date` object, Unix timestamp (ms or s), or a string. Supported string formats include ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`), `YYYY-MM-DD`, `YYYY/MM/DD`, and `MM/DD/YYYY`. |
| `updateInterval`      | `number`                                  | `1000`       | The interval in milliseconds at which the component updates the time.                                   |
| `prefix`              | `string`                                  | `''`         | A string to prepend to the time output.                                                                 |
| `suffix`              | `string`                                  | `''`         | A string to append to the time output.                                                                  |
| `onEnd`               | `() => void`                              | `undefined`  | A callback function that fires when a future timestamp is reached.                                      |
| `className`           | `string`                                  | `undefined`  | Standard `className` prop for styling.                                                                  |
| `style`               | `React.CSSProperties`                     | `undefined`  | Standard `style` prop for inline styling.                                                               |
| `locale`              | `string`                                  | `'en'`       | The locale for formatting (e.g., `'es'`, `'fr'`, `'ja'`).                                                 |
| `style`               | `'long' \| 'short' \| 'narrow'`           | `'long'`     | The formatting style from `Intl.RelativeTimeFormat`.                                                    |
| `numeric`             | `'always' \| 'auto'`                      | `'auto'`     | The numeric option from `Intl.RelativeTimeFormat`. `'auto'` allows for strings like "yesterday".        |
| `threshold`           | `number`                                  | `undefined`  | A threshold in seconds. If the difference exceeds it, an absolute date is shown instead.                |
| `absoluteFormatOptions` | `Intl.DateTimeFormatOptions`              | `undefined`  | Options to format the absolute date when the `threshold` is met. See `Intl.DateTimeFormat` docs.      |

### Examples

#### Localization

To display the time in a different language, use the `locale` prop.

```jsx
<LiveRelativeTime timestamp={someDate} locale="es" />
// Renders: "hace 10 segundos"
```

#### Using the Threshold

Switch to an absolute date for times further than one day in the past.

```jsx
const twoDaysAgo = new Date(Date.now() - 1000 * 86400 * 2);

<LiveRelativeTime
  timestamp={twoDaysAgo}
  threshold={86400} // 1 day in seconds
  absoluteFormatOptions={{
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }}
/>
// Renders: "July 15, 2025" (if today is July 17)
```

#### Adding a Prefix and Suffix

```jsx
<LiveRelativeTime
  timestamp={someDate}
  prefix="Last updated: "
  suffix="."
/>
// Renders: "Last updated: 5 minutes ago."
```

## License

MIT
