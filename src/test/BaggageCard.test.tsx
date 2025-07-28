import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BaggageCard from '../components/BaggageCard'
import { type Baggage, type DefaultItem } from '../types'

const mockDefaultItems: DefaultItem[] = [
  { name: 'T-Shirt', icon: 'tshirt', emoji: '👕' },
  { name: 'Pants', icon: 'pants', emoji: '👖' },
  { name: 'Shoes', icon: 'shoes', emoji: '👟' }
]

const mockBaggage: Baggage = {
  id: '1',
  type: 'carry-on',
  nickname: 'Test Bag',
  items: [
    {
      id: 'item1',
      name: 'Test Item',
      icon: 'cube',
      quantity: 1,
      packed: false
    }
  ]
}

describe('BaggageCard', () => {
  const mockOnUpdate = vi.fn()
  const mockOnDelete = vi.fn()
  const mockSetCollapsed = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders baggage information correctly', () => {
    render(
      <BaggageCard
        baggage={mockBaggage}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        defaultItems={mockDefaultItems}
        collapsed={false}
        setCollapsed={mockSetCollapsed}
      />
    )

    expect(screen.getByDisplayValue('Test Bag')).toBeInTheDocument()
    expect(screen.getByText('Test Item')).toBeInTheDocument()
  })

  it('can toggle collapsed state', async () => {
    const user = userEvent.setup()
    render(
      <BaggageCard
        baggage={mockBaggage}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        defaultItems={mockDefaultItems}
        collapsed={false}
        setCollapsed={mockSetCollapsed}
      />
    )

    // Find and click the collapse button
    const collapseButton = screen.getByRole('button', { name: /collapse/i })
    await user.click(collapseButton)

    expect(mockSetCollapsed).toHaveBeenCalledWith(true)
  })

  it('can update baggage nickname', async () => {
    const user = userEvent.setup()
    render(
      <BaggageCard
        baggage={mockBaggage}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        defaultItems={mockDefaultItems}
        collapsed={false}
        setCollapsed={mockSetCollapsed}
      />
    )

    const nicknameInput = screen.getByDisplayValue('Test Bag')
    await user.clear(nicknameInput)
    await user.type(nicknameInput, 'Updated Bag Name')

    expect(mockOnUpdate).toHaveBeenCalled()
  })

  it('shows progress information', () => {
    const baggageWithMixedItems: Baggage = {
      ...mockBaggage,
      items: [
        { id: '1', name: 'Packed Item', icon: 'cube', quantity: 1, packed: true },
        { id: '2', name: 'Unpacked Item', icon: 'cube', quantity: 1, packed: false }
      ]
    }

    render(
      <BaggageCard
        baggage={baggageWithMixedItems}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        defaultItems={mockDefaultItems}
        collapsed={false}
        setCollapsed={mockSetCollapsed}
      />
    )

    // Should show total item count
    expect(screen.getByText('Items (2)')).toBeInTheDocument()
  })

  it('can delete baggage when confirmed', async () => {
    const user = userEvent.setup()
    const emptyBaggage: Baggage = {
      ...mockBaggage,
      items: []
    }

    render(
      <BaggageCard
        baggage={emptyBaggage}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        defaultItems={mockDefaultItems}
        collapsed={false}
        setCollapsed={mockSetCollapsed}
      />
    )

    const deleteButton = document.querySelector('.delete-btn') as HTMLButtonElement
    await user.click(deleteButton)

    expect(mockOnDelete).toHaveBeenCalledWith('1')
  })

  it('hides items when collapsed', () => {
    render(
      <BaggageCard
        baggage={mockBaggage}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        defaultItems={mockDefaultItems}
        collapsed={true}
        setCollapsed={mockSetCollapsed}
      />
    )

    // Items should not be visible when collapsed
    expect(screen.queryByText('Test Item')).not.toBeInTheDocument()
  })
})
