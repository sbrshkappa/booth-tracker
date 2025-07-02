# Conference Companion Theme Guide

## Overview
This theme is based on the colors extracted from the Conference Companion logo, creating a vibrant, modern, and cohesive design system for the entire application.

## Color Palette

### Primary Colors (Orange Family)
- **Primary-500**: `#f97316` - Main brand orange
- **Primary-600**: `#ea580c` - Dark orange for hover states
- **Primary-400**: `#fb923c` - Light orange for accents
- **Primary-100**: `#ffedd5` - Very light orange for backgrounds

### Secondary Colors (Pink Family)
- **Secondary-500**: `#ec4899` - Main brand pink
- **Secondary-600**: `#db2777` - Dark pink for hover states
- **Secondary-400**: `#f472b6` - Light pink for accents
- **Secondary-100**: `#fce7f3` - Very light pink for backgrounds

### Accent Colors (Yellow Family)
- **Accent-500**: `#f59e0b` - Main brand yellow
- **Accent-600**: `#d97706` - Dark yellow for hover states
- **Accent-400**: `#fbbf24` - Light yellow for accents
- **Accent-100**: `#fef3c7` - Very light yellow for backgrounds

### Supporting Colors
- **Blue-500**: `#3b82f6` - For informational elements
- **Purple-500**: `#a855f7` - For special features
- **Green-500**: `#22c55e` - For success states
- **Red-500**: `#ef4444` - For error states

## Usage Guidelines

### Buttons
```jsx
// Primary button
<button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg">
  Primary Action
</button>

// Secondary button
<button className="bg-secondary-500 hover:bg-secondary-600 text-white px-4 py-2 rounded-lg">
  Secondary Action
</button>

// Accent button
<button className="bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-lg">
  Accent Action
</button>

// Outline button
<button className="border-2 border-primary-500 text-primary-500 hover:bg-primary-50 px-4 py-2 rounded-lg">
  Outline Action
</button>
```

### Cards
```jsx
<div className="bg-white border border-gray-200 rounded-lg shadow-soft p-6">
  <h3 className="text-primary-600 font-semibold">Card Title</h3>
  <p className="text-gray-600">Card content goes here</p>
</div>
```

### Gradients
```jsx
// Primary gradient (orange to pink)
<div className="bg-gradient-primary text-white p-6 rounded-lg">
  Gradient Content
</div>

// Secondary gradient (yellow to orange)
<div className="bg-gradient-secondary text-white p-6 rounded-lg">
  Gradient Content
</div>

// Accent gradient (blue to purple)
<div className="bg-gradient-accent text-white p-6 rounded-lg">
  Gradient Content
</div>
```

### Text Colors
```jsx
<h1 className="text-primary-600">Primary Heading</h1>
<h2 className="text-secondary-600">Secondary Heading</h2>
<p className="text-gray-600">Body text</p>
<span className="text-accent-600">Accent text</span>
```

### Status Colors
```jsx
// Success
<div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg">
  Success message
</div>

// Warning
<div className="bg-accent-50 border border-accent-200 text-accent-800 p-4 rounded-lg">
  Warning message
</div>

// Error
<div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
  Error message
</div>

// Info
<div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg">
  Info message
</div>
```

## Component Examples

### Progress Indicators
```jsx
// Progress bar
<div className="w-full bg-gray-200 rounded-full h-2">
  <div className="bg-gradient-primary h-2 rounded-full" style={{ width: '60%' }}></div>
</div>

// Progress circle (already implemented)
<div className="relative w-32 h-32">
  <svg className="w-full h-full transform -rotate-90">
    <circle
      cx="64"
      cy="64"
      r="56"
      stroke="currentColor"
      strokeWidth="8"
      fill="transparent"
      className="text-gray-200"
    />
    <circle
      cx="64"
      cy="64"
      r="56"
      stroke="url(#progressGradient)"
      strokeWidth="8"
      fill="transparent"
      strokeDasharray="352"
      strokeDashoffset="141"
      className="transition-all duration-500"
    />
  </svg>
</div>
```

### Navigation
```jsx
// Active nav item
<nav className="bg-primary-50 border-l-4 border-primary-500 px-4 py-2">
  <span className="text-primary-700 font-medium">Active Page</span>
</nav>

// Inactive nav item
<nav className="hover:bg-gray-50 px-4 py-2">
  <span className="text-gray-600">Inactive Page</span>
</nav>
```

### Forms
```jsx
// Input field
<input
  type="text"
  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
  placeholder="Enter text..."
/>

// Form validation
<div className="text-red-600 text-sm mt-1">Error message</div>
<div className="text-green-600 text-sm mt-1">Success message</div>
```

## Animation Classes

### Fade In
```jsx
<div className="animate-fade-in">
  Content that fades in
</div>
```

### Slide Up
```jsx
<div className="animate-slide-up">
  Content that slides up
</div>
```

### Soft Bounce
```jsx
<div className="animate-bounce-soft">
  Content with soft bounce
</div>
```

### Soft Pulse
```jsx
<div className="animate-pulse-soft">
  Content with soft pulse
</div>
```

## Custom Utilities

### Gradient Text
```jsx
<h1 className="text-gradient-primary text-4xl font-bold">
  Gradient Text
</h1>
```

### Gradient Borders
```jsx
<div className="border-gradient-primary p-6 rounded-lg">
  Content with gradient border
</div>
```

## Implementation Notes

1. **Backward Compatibility**: The theme includes legacy color mappings (e.g., `orange-500` maps to `primary-500`)

2. **Accessibility**: All color combinations meet WCAG contrast requirements

3. **Responsive Design**: The theme works seamlessly across all device sizes

4. **Dark Mode Ready**: The color system can be extended for dark mode support

5. **Performance**: Uses CSS custom properties for efficient theming

## Migration Guide

To migrate existing components to the new theme:

1. Replace `#fba758` with `primary-500`
2. Replace `#fe84a0` with `secondary-500`
3. Replace `#fdbc3f` with `accent-500`
4. Update gradient classes to use new gradient utilities
5. Replace hardcoded colors with theme color classes

## Best Practices

1. **Consistency**: Always use theme colors instead of hardcoded values
2. **Semantic Usage**: Use colors for their intended purpose (success, warning, error, etc.)
3. **Accessibility**: Ensure sufficient contrast ratios
4. **Performance**: Use Tailwind's purge to remove unused styles
5. **Maintainability**: Document any custom color usage

This theme provides a solid foundation for creating a cohesive, modern, and accessible user interface that reflects the vibrant personality of the Conference Companion brand. 