# App Tour System

The Conference Companion app includes a comprehensive guided tour system that helps users learn about all the features and functionality.

## Features

### 🎯 First-Time User Experience
- **Automatic Launch**: Tour automatically starts for first-time users after a 1-second delay
- **Progressive Disclosure**: Users learn about features step-by-step as they navigate through the app
- **Smart Navigation**: Tour automatically navigates to different pages to show relevant features

### 📚 Help Section Integration
- **Manual Access**: Users can access the tour anytime through the "Help & Tour" menu option
- **Comprehensive Help**: Help modal includes tour, FAQ, and support information
- **Reset Functionality**: Testing option to reset tour state for demonstration purposes

### 🎨 Visual Tour Experience
- **Element Highlighting**: Tour highlights specific UI elements with orange borders
- **Overlay Effect**: Dark overlay focuses attention on highlighted elements
- **Smart Positioning**: Tooltips automatically position themselves to avoid screen edges
- **Responsive Design**: Works on all screen sizes and orientations

## Tour Steps

The tour includes 10 comprehensive steps:

1. **Welcome** - Introduction to the app
2. **Navigation Menu** - How to access different sections
3. **Conference Countdown** - Understanding the countdown timer
4. **Dashboard Introduction** - Overview of the booth tracker
5. **Progress Circle** - Understanding the progress indicator
6. **Phrase Input** - How to enter booth phrases and notes
7. **Sessions Overview** - Introduction to the sessions feature
8. **Session Cards** - How to interact with session information
9. **History** - Reviewing past visits and notes
10. **Completion** - Final congratulations and encouragement

## Technical Implementation

### Components
- `AppTour.tsx` - Main tour component with step-by-step logic
- `HelpModal.tsx` - Help section with tour access
- `tour.ts` - Utility functions for tour state management

### State Management
- **Local Storage**: Tour completion status is saved in localStorage
- **First-Time Detection**: Tracks whether user has seen the tour before
- **Progress Tracking**: Remembers tour completion across sessions

### CSS Classes for Targeting
The tour uses CSS selectors to highlight specific elements:
- `.menu-container` - Navigation menu
- `.countdown-timer` - Conference countdown
- `.dashboard-content` - Dashboard main area
- `.progress-circle` - Progress indicator
- `.phrase-input` - Booth phrase input form
- `.sessions-content` - Sessions page main area
- `.session-card` - Individual session cards
- `.history-content` - History page main area

## Usage

### For Users
1. **First Time**: Tour starts automatically after login
2. **Manual Access**: Click "Help & Tour" in the menu
3. **Navigation**: Use "Next" and "Previous" buttons
4. **Skip**: Click "Skip Tour" or click outside to exit
5. **Reset**: Use "Reset Tour" in help modal for testing

### For Developers
1. **Adding Steps**: Modify the `tourSteps` array in `AppTour.tsx`
2. **Targeting Elements**: Add appropriate CSS classes to elements
3. **Page Navigation**: Set `showOnPage` property for automatic navigation
4. **Positioning**: Configure `position` property for tooltip placement

## Testing

### Reset Tour State
1. Open the Help modal
2. Click "Reset Tour" at the bottom
3. Refresh the page
4. Tour will start automatically as if it's the first time

### Manual Testing
1. Use browser dev tools to clear localStorage
2. Or use the reset function in the help modal
3. Test different screen sizes and orientations
4. Verify all tour steps work correctly

## Customization

### Adding New Tour Steps
```typescript
{
  id: 'new-step',
  title: 'New Feature',
  content: 'Description of the new feature',
  target: '.new-feature-element',
  position: 'bottom',
  showOnPage: 'dashboard'
}
```

### Modifying Tour Behavior
- Change auto-start delay in `home/page.tsx`
- Modify tooltip styling in `AppTour.tsx`
- Update tour completion logic in `tour.ts`

## Browser Compatibility

The tour system works on all modern browsers that support:
- CSS Grid and Flexbox
- LocalStorage API
- ES6+ JavaScript features
- CSS transforms and transitions

## Performance Considerations

- Tour state is lightweight and stored locally
- Element highlighting uses efficient DOM manipulation
- Tooltip positioning is optimized for smooth animations
- Tour automatically cleans up event listeners and DOM elements 