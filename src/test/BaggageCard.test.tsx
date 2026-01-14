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

  describe('Duplicate item handling', () => {
    it('creates separate unpacked item when adding duplicate of packed item', async () => {
      const user = userEvent.setup()
      const baggageWithPackedItem: Baggage = {
        ...mockBaggage,
        items: [
          { id: 'item1', name: 'T-Shirt', icon: 'tshirt', quantity: 5, packed: true }
        ]
      }

      render(
        <BaggageCard
          baggage={baggageWithPackedItem}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          defaultItems={mockDefaultItems}
          collapsed={false}
          setCollapsed={mockSetCollapsed}
        />
      )

      // Click add item button to show quick add section
      const addItemBtn = document.querySelector('.add-item-btn') as HTMLButtonElement
      await user.click(addItemBtn)

      // Click T-Shirt in quick add
      const tshirtBtn = screen.getByRole('button', { name: /T-Shirt/i })
      await user.click(tshirtBtn)

      // Should call onUpdate with a new unpacked item added
      expect(mockOnUpdate).toHaveBeenCalled()
      const updatedBaggage = mockOnUpdate.mock.calls[0][0]
      expect(updatedBaggage.items.length).toBe(2)
      
      // Original packed item should be unchanged
      const originalItem = updatedBaggage.items.find((item: { id: string }) => item.id === 'item1')
      expect(originalItem.quantity).toBe(5)
      expect(originalItem.packed).toBe(true)
      
      // New item should be unpacked with quantity 1
      const newItem = updatedBaggage.items.find((item: { id: string }) => item.id !== 'item1')
      expect(newItem.name).toBe('T-Shirt')
      expect(newItem.quantity).toBe(1)
      expect(newItem.packed).toBe(false)
    })

    it('increments quantity when adding duplicate of unpacked item', async () => {
      const user = userEvent.setup()
      const baggageWithUnpackedItem: Baggage = {
        ...mockBaggage,
        items: [
          { id: 'item1', name: 'T-Shirt', icon: 'tshirt', quantity: 2, packed: false }
        ]
      }

      render(
        <BaggageCard
          baggage={baggageWithUnpackedItem}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          defaultItems={mockDefaultItems}
          collapsed={false}
          setCollapsed={mockSetCollapsed}
        />
      )

      // Click add item button to show quick add section
      const addItemBtn = document.querySelector('.add-item-btn') as HTMLButtonElement
      await user.click(addItemBtn)

      // Click T-Shirt in quick add
      const tshirtBtn = screen.getByRole('button', { name: /T-Shirt/i })
      await user.click(tshirtBtn)

      // Should call onUpdate with incremented quantity
      expect(mockOnUpdate).toHaveBeenCalled()
      const updatedBaggage = mockOnUpdate.mock.calls[0][0]
      expect(updatedBaggage.items.length).toBe(1)
      expect(updatedBaggage.items[0].quantity).toBe(3)
      expect(updatedBaggage.items[0].packed).toBe(false)
    })

    it('merges items when unpacked duplicate is marked as packed', async () => {
      const user = userEvent.setup()
      const baggageWithDuplicates: Baggage = {
        ...mockBaggage,
        items: [
          { id: 'item1', name: 'Socks', icon: 'cube', quantity: 5, packed: true },
          { id: 'item2', name: 'Socks', icon: 'cube', quantity: 1, packed: false }
        ]
      }

      render(
        <BaggageCard
          baggage={baggageWithDuplicates}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          defaultItems={mockDefaultItems}
          collapsed={false}
          setCollapsed={mockSetCollapsed}
        />
      )

      // Find the pack button for the unpacked item (second item)
      // The unpacked item should have a pack button without 'packed' class
      const packButtons = document.querySelectorAll('.pack-btn')
      const unpackedItemPackBtn = Array.from(packButtons).find(btn => !btn.classList.contains('packed')) as HTMLButtonElement
      
      await user.click(unpackedItemPackBtn)

      // Should merge the items
      expect(mockOnUpdate).toHaveBeenCalled()
      const updatedBaggage = mockOnUpdate.mock.calls[0][0]
      
      // After merge, should only have 1 item
      expect(updatedBaggage.items.length).toBe(1)
      // The merged item should have combined quantity
      expect(updatedBaggage.items[0].quantity).toBe(6)
      expect(updatedBaggage.items[0].packed).toBe(true)
    })

    it('does not merge when packing item with no packed duplicate', async () => {
      const user = userEvent.setup()
      const baggageWithUnpackedItem: Baggage = {
        ...mockBaggage,
        items: [
          { id: 'item1', name: 'Socks', icon: 'cube', quantity: 2, packed: false }
        ]
      }

      render(
        <BaggageCard
          baggage={baggageWithUnpackedItem}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          defaultItems={mockDefaultItems}
          collapsed={false}
          setCollapsed={mockSetCollapsed}
        />
      )

      // Find and click the pack button
      const packBtn = document.querySelector('.pack-btn') as HTMLButtonElement
      await user.click(packBtn)

      // Should just mark as packed, not merge
      expect(mockOnUpdate).toHaveBeenCalled()
      const updatedBaggage = mockOnUpdate.mock.calls[0][0]
      expect(updatedBaggage.items.length).toBe(1)
      expect(updatedBaggage.items[0].quantity).toBe(2)
      expect(updatedBaggage.items[0].packed).toBe(true)
    })
  })
})
