# PackTracker

A lightweight, client-side React/Vite app to help you organize and track what’s packed in each of your bags. No backend required—data is persisted in `localStorage`.

## Features

- Add/remove multiple baggage types:
  - Carry-on, Medium Checked, Large Checked, Backpack, Other
- Set custom nicknames for each bag
- Quick-add from default items (e.g. T-shirt, Socks, Hat)
- Create custom items with selectable icons (Ionicons)
- Adjust quantities, mark items as packed/unpacked
- **Toast notifications** for user feedback on all major actions
- CSV Export/Import (via [PapaParse](https://www.papaparse.com/))
- Clear all data with one click (confirmation required)
- Persistent storage in browser (`localStorage`)
- Responsive design (desktop + mobile)
- Modern UI built with Vite + React

## Tech Stack

- React 19.x + TypeScript
- Vite
- React Hot Toast (notifications)
- Ionicons (icon library)
- PapaParse (CSV parsing/export)
- CSS for styling

## Prerequisites

- Node.js v18+
- npm v9+

## Getting Started

```bash
# Clone the repo
git clone https://github.com/dralan71/luggage-tracker.git
cd luggage-tracker

## Folder Structure

PackTracker/
├─ src/
│  ├─ components/      # React components (BaggageCard, ItemCard)
│  ├─ data/            # Default items list
│  ├─ hooks/           # Currently empty
│  ├─ test/            # Vitest test files
│  ├─ types.ts         # TypeScript types
│  ├─ ToastContext.tsx # Toast notification helpers
│  ├─ App.tsx          # Main app
│  └─ App.css          # Styles
├─ public/             # Logo
├─ package.json
├─ tsconfig.json
├─ index.html
└─ vite.config.ts


# Install dependencies
npm install

# Run in development mode
npm run dev
```

Open http://localhost:5173 in your browser.

## Available Scripts

- `npm run dev`  
  Start Vite development server
- `npm run build`  
  Build production bundle
- `npm run preview`  
  Preview production build locally
- `npm run lint`  
  Run ESLint
- `npm run test`  
  Run Vitest tests

## Usage

1. **Add Baggage**  
   Click one of the “Add Baggage” buttons to create a new bag of that type.
2. **Rename Bag**  
   Enter a nickname in the input next to the bag’s type.
3. **Add Items**
   - Quick-add default items via the “+” menu
   - Create custom items with your own name and icon
4. **Manage Items**
   - Increase/decrease quantity
   - Toggle packed/unpacked status
   - Remove items
5. **CSV Export/Import**
   - Export: Download a CSV snapshot of all bags and items
   - Import: Load a previously exported CSV to restore state
6. **Clear All**  
   Remove all baggage data (confirmation required)

### Toast Notifications

PackTracker provides visual feedback through toast notifications for all major actions:

- **Adding items**: Shows the item's icon and confirmation message
- **Increasing quantity**: Displays the item icon with quantity update confirmation
- **Removing items**: Shows trash icon with removal confirmation
- **Adding baggage**: Displays suitcase icon with bag type confirmation
- **Deleting baggage**: Shows trash icon with deletion confirmation
- **CSV operations**: Success confirmations for import/export
- **Data clearing**: Confirmation when all data is cleared

Toasts appear in the top-right corner with a dark theme, auto-dismiss after 2.5 seconds, and use contextual icons for better user experience.

Your data is automatically saved in `localStorage`—it survives page reloads, browser restarts, and stays until you clear it.

## Contributing

1.  Fork the repository
2.  Create a feature branch (`git checkout -b feature/foo`)
3.  Commit your changes (`git commit -am "Add foo feature"`)
4.  Push to the branch (`git push origin feature/foo`)
5.  Open a Pull Request
