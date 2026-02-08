import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  Toaster: () => <div data-testid="toaster">Toaster</div>,
}));

// Mock the CSV parsing library
vi.mock('papaparse', () => ({
  default: {
    unparse: vi.fn(() => 'mocked,csv,data'),
    parse: vi.fn((_file, options) => {
      // Simulate successful CSV parsing
      const mockData = [
        {
          baggageId: '1',
          baggageType: 'carry-on',
          baggageNickname: 'Test Bag',
          itemName: 'Test Item',
          itemIcon: 'cube',
          quantity: '1',
          packed: 'false'
        }
      ]
      options.complete({ data: mockData })
    })
  }
}))

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: vi.fn(),
});

describe('App', () => {
  beforeEach(() => {
    // Clear localStorage and sessionStorage before each test
    localStorage.clear()
    sessionStorage.clear()
    vi.clearAllMocks()
    
    // Reset window.confirm to return true by default
    window.confirm = vi.fn(() => true);
  })

  it('renders the app header correctly', () => {
    render(<App />)
    
    expect(screen.getByText('PackTracker')).toBeInTheDocument()
    expect(screen.getByText('Add Baggage:')).toBeInTheDocument()
  })

  it('shows empty state when no baggages are added', async () => {
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('No baggage added yet. Start by adding your first bag!')).toBeInTheDocument()
    })
  })

  it('can add a new baggage', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Wait for app to load
    await waitFor(() => {
      expect(screen.getByText('No baggage added yet. Start by adding your first bag!')).toBeInTheDocument()
    })
    
    // Click on carry-on button
    const carryOnButton = screen.getByText('CARRY ON')
    await user.click(carryOnButton)
    
    // Should no longer show empty state
    expect(screen.queryByText('No baggage added yet. Start by adding your first bag!')).not.toBeInTheDocument()
  })

  it('can add multiple baggage types', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Add Baggage:')).toBeInTheDocument()
    })
    
    // Add different types of baggage
    await user.click(screen.getByText('CARRY ON'))
    await user.click(screen.getByText('BACKPACK'))
    await user.click(screen.getByText('OTHER'))
    
    // Should have 3 baggage cards (though we can't easily test the exact content without more specific test IDs)
    expect(screen.queryByText('No baggage added yet. Start by adding your first bag!')).not.toBeInTheDocument()
  })

  it('export button is disabled when no baggages exist', async () => {
    render(<App />)
    
    await waitFor(() => {
      const exportButton = screen.getByText('Export CSV')
      expect(exportButton).toBeDisabled()
    })
  })

  it('clear all button is disabled when no baggages exist', async () => {
    render(<App />)
    
    await waitFor(() => {
      const clearButton = screen.getByText('Clear All')
      expect(clearButton).toBeDisabled()
    })
  })

  it('shows collapse/expand all button when baggages exist', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Add Baggage:')).toBeInTheDocument()
    })
    
    // Add a baggage
    await user.click(screen.getByText('CARRY ON'))
    
    // Should show collapse all button
    await waitFor(() => {
      expect(screen.getByText('Collapse All')).toBeInTheDocument()
    })
  })

  it('can clear all data with confirmation', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Add Baggage:')).toBeInTheDocument()
    })
    
    // Add a baggage first
    await user.click(screen.getByText('CARRY ON'))
    
    // Clear all data
    const clearButton = screen.getByText('Clear All')
    await user.click(clearButton)
    
    // Should show empty state again
    await waitFor(() => {
      expect(screen.getByText('No baggage added yet. Start by adding your first bag!')).toBeInTheDocument()
    })
  })

  it('has CSV import functionality', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Import CSV')).toBeInTheDocument()
    })
    
    // Get the import button
    const importButton = screen.getByText('Import CSV')
    expect(importButton).toBeInTheDocument()
    
    // Get the hidden file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).toBeInTheDocument()
    expect(fileInput.accept).toBe('.csv')
    
    // Click the import button should trigger the file input
    await user.click(importButton)
    // The test passes if no errors occur
  })

  it('persists data to localStorage', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Add Baggage:')).toBeInTheDocument()
    })
    
    // Add a baggage
    await user.click(screen.getByText('CARRY ON'))
    
    // Wait for localStorage to be called
    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'luggage-tracker-data',
        expect.any(String)
      )
    })
  })

  it('loads data from localStorage on startup', () => {
    // Set up localStorage with some data
    const mockData = [
      {
        id: '1',
        type: 'carry-on',
        nickname: 'Test Bag',
        items: []
      }
    ]
    
    localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify(mockData))
    
    render(<App />)
    
    // Should have called localStorage.getItem
    expect(localStorage.getItem).toHaveBeenCalledWith('luggage-tracker-data')
  })

  it('shows summary chips when baggages are added', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Add Baggage:')).toBeInTheDocument()
    })
    
    // Add a baggage
    await user.click(screen.getByText('CARRY ON'))
    
    // Should show summary chips (text may be split across nodes)
    await waitFor(() => {
      const summaryChips = document.querySelectorAll('.summary-chip')
      expect(summaryChips.length).toBeGreaterThan(0)
      const chipTexts = Array.from(summaryChips).map(chip => chip.textContent)
      expect(chipTexts.some(text => text?.includes('bag'))).toBe(true)
      expect(chipTexts.some(text => text?.includes('No items yet'))).toBe(true)
    })
  })

  it('shows packed/total count when items are added', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Add Baggage:')).toBeInTheDocument()
    })
    
    // Add a baggage
    await user.click(screen.getByText('CARRY ON'))
    
    // Wait for baggage card to appear
    await waitFor(() => {
      expect(screen.queryByText('No baggage added yet. Start by adding your first bag!')).not.toBeInTheDocument()
    })
    
    // Click add item button (must exist or test fails)
    const addItemBtn = document.querySelector('.add-item-btn') as HTMLButtonElement
    expect(addItemBtn).toBeTruthy()
    await user.click(addItemBtn)

    // Wait for quick add section and assert buttons appear
    await waitFor(() => {
      const quickAddButtons = screen.queryAllByRole('button', { name: /T-Shirt|Pants|Shoes/i })
      expect(quickAddButtons.length).toBeGreaterThan(0)
    }, { timeout: 2000 })

    const itemButtons = screen.getAllByRole('button', { name: /T-Shirt|Pants|Shoes/i })
    expect(itemButtons.length).toBeGreaterThan(0)
    await user.click(itemButtons[0])

    // Should show packed count
    await waitFor(() => {
      expect(screen.getByText(/0\/1 packed|1\/1 packed/i)).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('updates packed count when items are packed/unpacked', async () => {
    const user = userEvent.setup()
    
    // Set up localStorage with baggage containing items
    const mockData = [
      {
        id: '1',
        type: 'carry-on',
        nickname: 'Test Bag',
        items: [
          { id: 'item1', name: 'Item 1', icon: 'cube', quantity: 1, packed: false },
          { id: 'item2', name: 'Item 2', icon: 'cube', quantity: 1, packed: false }
        ]
      }
    ]
    
    localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify(mockData))
    
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('1 bag')).toBeInTheDocument()
      expect(screen.getByText('0/2 packed')).toBeInTheDocument()
    })
    
    // Find and click a pack button (must exist or test fails)
    const packButtons = document.querySelectorAll('.pack-btn')
    expect(packButtons.length).toBeGreaterThan(0)
    await user.click(packButtons[0] as HTMLButtonElement)

    // Should update to show 1/2 packed
    await waitFor(() => {
      expect(screen.getByText('1/2 packed')).toBeInTheDocument()
    })
  })
})
