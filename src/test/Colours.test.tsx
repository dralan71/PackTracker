import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Papa from 'papaparse'
import App from '../App'
import BaggageCard from '../components/BaggageCard'
import { DEFAULT_ITEMS } from '../data/defaultItems'
import { type Baggage } from '../types'

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), custom: vi.fn() },
  Toaster: () => null,
}))

const bag: Baggage = {
  id: 'bag', type: 'carry-on', nickname: 'Test Bag',
  items: [{ id: 'shirt', name: 'T-Shirt', icon: 'PiTShirt', quantity: 2, packed: false, colour: 'Blue' }]
}

beforeEach(() => {
  vi.restoreAllMocks()
  localStorage.getItem = vi.fn().mockReturnValue(null)
  sessionStorage.getItem = vi.fn().mockReturnValue(null)
})

function renderBag(baggage = bag) {
  const onUpdate = vi.fn()
  render(<BaggageCard baggage={baggage} onUpdate={onUpdate} onDelete={vi.fn()}
    defaultItems={DEFAULT_ITEMS} collapsed={false} setCollapsed={vi.fn()} />)
  return onUpdate
}

describe('Item colours', () => {
  it.each([['Blue', 1, 3], [' blue ', 1, 3], ['Red', 2, 1], ['', 2, 1]])(
    'keeps Quick Add colour %j distinct where needed', async (colour, count, quantity) => {
      const user = userEvent.setup()
      const onUpdate = renderBag()
      await user.click(document.querySelector('.add-item-btn') as HTMLButtonElement)
      if (colour) await user.type(screen.getByLabelText('Colour (optional)'), colour)
      await user.click(screen.getByRole('button', { name: 'T-Shirt' }))
      const items = onUpdate.mock.calls[0][0].items
      expect(items).toHaveLength(count)
      expect(items[count - 1].quantity).toBe(quantity)
      if (count === 2) expect(items[1].colour).toBe(colour || undefined)
    }
  )

  it('adds a custom item with a trimmed colour', async () => {
    const user = userEvent.setup()
    const onUpdate = renderBag()
    await user.click(document.querySelector('.add-item-btn') as HTMLButtonElement)
    await user.type(screen.getByLabelText('Colour (optional)'), ' Navy blue ')
    await user.type(screen.getByPlaceholderText('Item name...'), 'Scarf')
    await user.click(screen.getByRole('button', { name: /^Add$/ }))
    expect(onUpdate.mock.calls[0][0].items[1]).toMatchObject({ name: 'Scarf', colour: 'Navy blue' })
  })

  it.each([['blue', 1, 3], ['Red', 2, 2], [undefined, 2, 2]])(
    'only merges matching colours when packing (%j)', async (colour, count, quantity) => {
      const user = userEvent.setup()
      const onUpdate = renderBag({ ...bag, items: [
        { ...bag.items[0], packed: true },
        { ...bag.items[0], id: 'new', quantity: 1, colour }
      ] })
      await user.click(document.querySelector('.pack-btn:not(.packed)') as HTMLButtonElement)
      const items = onUpdate.mock.calls[0][0].items
      expect(items).toHaveLength(count)
      expect(items[0].quantity).toBe(quantity)
      expect(items.every((item: { packed: boolean }) => item.packed)).toBe(true)
    }
  )

  it('edits and clears the colour of a saved item', async () => {
    const user = userEvent.setup()
    localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([bag]))
    render(<App />)
    const field = screen.getByLabelText('Colour for T-Shirt')
    expect(field).toHaveValue('Blue')
    await user.clear(field)
    await user.type(field, 'Green')
    expect(field).toHaveValue('Green')
    const saved = JSON.parse(vi.mocked(localStorage.setItem).mock.calls.at(-1)![1])
    expect(saved[0].items[0].colour).toBe('Green')
    await user.clear(field)
    const cleared = JSON.parse(vi.mocked(localStorage.setItem).mock.calls.at(-1)![1])
    expect(cleared[0].items[0].colour).toBeUndefined()
  })

  it('exports colours and imports them from real CSV data', async () => {
    const user = userEvent.setup()
    localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([bag]))
    const unparse = vi.spyOn(Papa, 'unparse')
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    render(<App />)
    await user.click(screen.getByRole('button', { name: /Export CSV/ }))
    expect(unparse).toHaveBeenCalledWith([expect.objectContaining({ itemColour: 'Blue' })])
    const csv = unparse.mock.results[0].value
    await user.clear(screen.getByLabelText('Colour for T-Shirt'))
    await user.upload(document.querySelector('input[type="file"]') as HTMLInputElement,
      new File([csv], 'colours.csv', { type: 'text/csv' }))
    await waitFor(() => expect(screen.getByLabelText('Colour for T-Shirt')).toHaveValue('Blue'))
  })

  it('imports older CSV files without a colour column', async () => {
    const user = userEvent.setup()
    render(<App />)
    const csv = 'baggageId,baggageType,baggageNickname,itemName,itemIcon,quantity,packed\nbag,carry-on,Old bag,Socks,PiSock,2,false'
    await user.upload(document.querySelector('input[type="file"]') as HTMLInputElement,
      new File([csv], 'old.csv', { type: 'text/csv' }))
    expect(await screen.findByLabelText('Colour for Socks')).toHaveValue('')
    expect(within(document.querySelector('.item-card') as HTMLElement).getByText('2')).toBeInTheDocument()
  })
})
