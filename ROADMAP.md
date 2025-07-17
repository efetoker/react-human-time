# `react-live-time` Development Roadmap

This document outlines potential features, improvements, and architectural enhancements for the `react-live-time` library. The goal is to expand its capabilities, improve performance, and provide a more flexible and modern developer experience.

---

## 1. Core Functionality Enhancements

These improvements focus on making the core date parsing and formatting logic more robust and versatile.

### 1.1. Headless Time Calculation & Flexible Output

- **Opportunity:** The library currently returns a complete, formatted string (e.g., `"5 minutes ago"`). This limits how users can style or structure the output.
- **Problem:** A user cannot easily make the number bold (e.g., `**5** minutes ago`) or use the parts of the time in a different sentence structure.
- **Solution:** Create and export a new "headless" function, `calculateRelativeTime`, that returns a structured object with the raw parts. The main `formatRelativeTime` function would then use this internally, and users could call it directly for full control.
- **Example:**
  ```typescript
  export type RelativeTimeParts = {
    value: number;
    unit: Intl.RelativeTimeFormatUnit;
    diffInSeconds: number;
  };

  // New function to be exported
  export const calculateRelativeTime = (dateInput: DateInput): RelativeTimeParts | null => {
    // ... logic to calculate value, unit, and diff
    return { value, unit, diffInSeconds };
  };

  // User could then do this:
  const parts = calculateRelativeTime(someDate);
  // Renders: "You have <strong>{parts.value}</strong> {parts.unit} left."
  ```

---

## 2. Component & Hook Architecture

These enhancements focus on improving the React-facing parts of the library for better performance and a more modern API.

### 2.1. Dynamic Update Interval

- **Opportunity:** The `<LiveRelativeTime />` component updates every second by default, which is inefficient for timestamps that are far in the past or future.
- **Problem:** A comment from "2 years ago" does not need to be re-rendered every second. In an application with many of these components, this can lead to unnecessary performance overhead.
- **Solution:** Make the update interval dynamic. The further away the date, the less frequently the component updates.
- **Example:**
  ```typescript
  // Inside the LiveRelativeTime component
  private getDynamicInterval(diffInSeconds: number): number {
    const absDiff = Math.abs(diffInSeconds);
    if (absDiff < 60) return 1000; // 1 second
    if (absDiff < 3600) return 60 * 1000; // 1 minute
    if (absDiff < 86400) return 3600 * 1000; // 1 hour
    return -1; // Stop updating after 1 day
  }

  private startTimer() {
    const interval = this.props.updateInterval ?? this.getDynamicInterval(/*...*/);
    if (interval > 0) {
      this.timer = setInterval(/*...*/, interval);
    }
  }
  ```

### 2.2. Modern React Support with a `useLiveRelativeTime` Hook

- **Opportunity:** While the class component ensures broad compatibility, modern React development is primarily based on functional components and hooks.
- **Problem:** Developers who prefer a hooks-based architecture may find a class component less convenient to integrate.
- **Solution:** Create and export a `useLiveRelativeTime` hook. This hook would encapsulate all the timer and state logic, returning the live-updating time string. It would serve as a modern alternative to the class component.
- **Example:**
  ```typescript
  export const useLiveRelativeTime = (timestamp: DateInput, options: FormatRelativeTimeOptions = {}) => {
    const [timeString, setTimeString] = React.useState(() => formatRelativeTime(timestamp, options));

    React.useEffect(() => {
      // Logic to set up and clear a dynamic interval
      const timer = setInterval(() => {
        setTimeString(formatRelativeTime(timestamp, options));
      }, 1000);
      return () => clearInterval(timer);
    }, [timestamp, options]);

    return timeString;
  };

  // User-facing API
  const MyComponent = () => {
    const timeAgo = useLiveRelativeTime(someDate);
    return <p>{timeAgo}</p>;
  };
  ```

### 2.3. Enhanced Flexibility with "Children as a Function"

- **Opportunity:** The component currently renders its output inside a `<span>`. This is a safe default but limits semantic HTML and advanced styling.
- **Problem:** A user might want to render a `<time>` element with a `dateTime` attribute for better accessibility, or apply different styles to the value and the unit.
- **Solution:** Implement the "Render Props" or "Children as a Function" pattern. The component will manage the state and pass the formatted string (or the raw parts from #1.2) to a function provided as the `children` prop.
- **Example:**
  ```jsx
  // How a user would consume it:
  <LiveRelativeTime timestamp={someDate}>
    {(formattedTime) => (
      <time dateTime={new Date(someDate).toISOString()}>
        {formattedTime}
      </time>
    )}
  </LiveRelativeTime>
  ```

---

## 3. Future & Advanced Ideas

- **Timezone Support:** Add an optional `timeZone` prop that can be passed to `Intl.DateTimeFormat` to explicitly handle timezone conversions.
- **"Fuzzy" Formatting:** Add an option for less precise, more "human" time (e.g., "about a minute ago" instead of "1 minute ago").
- **Pluggable Formatters:** For ultimate customization, allow users to provide their own formatting function to override the default `Intl.RelativeTimeFormat` logic.
- **Tree-Shaking Verification:** Ensure that users who only import `formatRelativeTime` do not get the React component and hook code in their final bundle.
