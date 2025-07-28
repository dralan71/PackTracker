# Testing Guide for PackTracker

This project uses **Vitest** with **React Testing Library** for testing.

## Available Test Scripts

```bash
# Run tests in watch mode (interactive)
npm test

# Run tests once
npm run test:run

# Run tests with UI (opens browser interface)
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

- **`src/test/setup.ts`** - Test setup and global mocks
- **`src/test/App.test.tsx`** - Main application component tests
- **`src/test/BaggageCard.test.tsx`** - BaggageCard component tests
- **`src/test/utils.test.ts`** - Utility function tests

## What's Being Tested

### App Component (`App.test.tsx`)
- ✅ Header rendering
- ✅ Empty state display
- ✅ Adding different baggage types
- ✅ Collapse/expand functionality
- ✅ Export/import buttons state
- ✅ Clear all functionality
- ✅ CSV import functionality
- ✅ localStorage persistence
- ✅ Data loading from localStorage

### BaggageCard Component (`BaggageCard.test.tsx`)
- ✅ Baggage information display
- ✅ Collapse/expand toggle
- ✅ Nickname updates
- ✅ Progress display
- ✅ Delete functionality
- ✅ Collapsed state behavior

### Utility Functions (`utils.test.ts`)
- ✅ Data validation for baggage arrays
- ✅ Edge cases (empty arrays, invalid data)
- ✅ Type safety validation

## Test Coverage

The tests cover:
- **Component rendering** - Ensuring UI elements appear correctly
- **User interactions** - Button clicks, form inputs, etc.
- **State management** - localStorage, component state
- **Data validation** - Type checking and data integrity
- **Edge cases** - Empty states, error conditions

## Mocked Dependencies

- **localStorage/sessionStorage** - For data persistence testing
- **window.confirm** - For deletion confirmations
- **URL.createObjectURL/revokeObjectURL** - For CSV export
- **papaparse** - For CSV import/export functionality

## Running Tests in Development

1. **Watch mode** (recommended during development):
   ```bash
   npm test
   ```
   This will re-run tests automatically when files change.

2. **Single run** (for CI/CD):
   ```bash
   npm run test:run
   ```

3. **With UI** (for debugging):
   ```bash
   npm run test:ui
   ```
   Opens a browser interface for interactive test debugging.

## Adding New Tests

1. Create test files with `.test.tsx` or `.test.ts` extension
2. Place them in the `src/test/` directory
3. Import testing utilities:
   ```typescript
   import { describe, it, expect } from 'vitest'
   import { render, screen } from '@testing-library/react'
   ```
4. Follow the existing test patterns

## Test Best Practices

- Use descriptive test names
- Test user behavior, not implementation details
- Mock external dependencies
- Keep tests isolated and independent
- Use `waitFor` for async operations
- Use semantic queries (`getByRole`, `getByText`) over test IDs when possible
