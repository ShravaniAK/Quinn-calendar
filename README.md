# Quinn Calendar - Infinite Scrollable Calendar

A modern, mobile-optimized calendar application built with React and TypeScript that features infinite vertical scrolling and journal entry management.

## Features

### Infinite Scroll Calendar
- **Smooth Infinite Scrolling**: Scroll seamlessly through months in both directions
- **Dynamic Header**: Month and year display updates based on scroll position
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Performance Optimized**: Smooth scrolling without lag or jitter

### Journal Entry Integration
- **Visual Calendar Grid**: Journal entries displayed on their respective dates
- **Rich Entry Display**: Shows images, ratings, categories, and descriptions
- **Swipeable Card UI**: Click entries to open detailed view with swipe navigation
- **Touch & Mouse Support**: Full gesture support for both mobile and desktop

### Modern UI/UX
- **Clean Design**: Modern, minimalist interface using Tailwind CSS
- **Smooth Animations**: Fluid transitions and hover effects
- **Mobile-First**: Optimized touch interactions and responsive layout
- **Accessibility**: Keyboard navigation and screen reader support

## Tech Stack

- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Intersection Observer API** - Efficient infinite scrolling
- **Custom Date Utils** - Hand-built calendar logic

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd quinn-calendar
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Building for Production

```bash
npm run build
```


## Key Implementation Details

### Infinite Scrolling
- Uses Intersection Observer API for efficient month loading
- Dynamically adds/removes months based on scroll position
- Maintains smooth performance with virtual scrolling techniques

### Calendar Logic
- Custom-built calendar grid generation
- Proper handling of leap years and month boundaries
- Accurate day-of-week calculations

### Journal Entry System
- Date-based entry mapping for efficient rendering
- Swipeable card interface with touch and mouse support
- Responsive image handling and category display

### Performance Optimizations
- Memoized calculations for date operations
- Efficient DOM updates using React's reconciliation
- Optimized scroll event handling with throttling

## Design Choices

### Calendar Layout
- **6-week grid**: Ensures consistent layout across months
- **Sunday start**: Traditional calendar week layout
- **Sticky headers**: Month names remain visible during scroll

### Mobile Optimization
- **Touch-friendly**: Large touch targets and gesture support
- **Responsive grid**: Adapts to different screen sizes
- **Smooth scrolling**: Optimized for mobile performance

