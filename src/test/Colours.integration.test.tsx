import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), custom: vi.fn() },
  Toaster: () => null,
}))

const STORAGE_KEY = 'luggage-tracker-data'
const stored = new Map<string, string>()

beforeEach(() => {
  vi.restoreAllMocks()
  stored.clear()
  localStorage.getItem = vi.fn((key) => stored.get(key) ?? null)
  localStorage.setItem = vi.fn((key, value) => { stored.set(key, value) })
  sessionStorage.getItem = vi.fn().mockReturnValue(null)
})

function itemCards() {
  return Array.from(document.querySelectorAll<HTMLElement>('.item-card'))
}

// Native colour selection emits an input event; jsdom has no OS picker.
function selectColour(label: string, hex: string) {
  fireEvent.input(screen.getByLabelText(label), { target: { value: hex } })
}

function readBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsText(blob)
  })
}

describe('Colour integration', () => {
  it('adds, packs, and merges matching colours while keeping other colours separate', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'CARRY ON' }))
    await user.click(document.querySelector('.add-item-btn') as HTMLButtonElement)
    await user.click(screen.getByLabelText('Use colour'))
    selectColour('Colour for new items', '#0000ff')
    await user.click(screen.getByRole('button', { name: /^T-Shirt$/ }))
    await user.click(screen.getByRole('button', { name: /^T-Shirt$/ }))
    expect(itemCards()).toHaveLength(1)
    expect(within(itemCards()[0]).getByText('2')).toBeInTheDocument()
    await user.click(itemCards()[0].querySelector('.pack-btn') as HTMLButtonElement)

    await user.click(screen.getByRole('button', { name: /^T-Shirt$/ }))
    expect(itemCards()).toHaveLength(2)
    await user.click(itemCards()[1].querySelector('.pack-btn') as HTMLButtonElement)
    expect(itemCards()).toHaveLength(1)
    expect(within(itemCards()[0]).getByText('3')).toBeInTheDocument()

    selectColour('Colour for new items', '#ff0000')
    await user.click(screen.getByRole('button', { name: /^T-Shirt$/ }))
    await user.click(itemCards()[1].querySelector('.pack-btn') as HTMLButtonElement)
    await user.click(screen.getByLabelText('Use colour'))
    await user.click(screen.getByRole('button', { name: /^T-Shirt$/ }))
    await user.click(itemCards()[2].querySelector('.pack-btn') as HTMLButtonElement)
    expect(itemCards()).toHaveLength(3)
    expect(within(itemCards()[0]).getByLabelText('Colour for T-Shirt')).toHaveValue('#0000ff')
    expect(within(itemCards()[1]).getByLabelText('Colour for T-Shirt')).toHaveValue('#ff0000')
    expect(within(itemCards()[2]).getByRole('button', { name: 'Add colour for T-Shirt' })).toBeInTheDocument()
    expect(screen.getByText('3/3 packed')).toBeInTheDocument()
  })

  it('persists custom item colours and supports editing and clearing after a reload', async () => {
    const user = userEvent.setup()
    const app = render(<App />)
    await user.click(screen.getByRole('button', { name: 'CARRY ON' }))
    await user.click(document.querySelector('.add-item-btn') as HTMLButtonElement)
    await user.click(screen.getByLabelText('Use colour'))
    selectColour('Colour for new items', '#123456')
    await user.type(screen.getByPlaceholderText('Item name...'), 'Scarf')
    await user.click(screen.getByRole('button', { name: /^Add$/ }))
    expect(screen.getByLabelText('Colour for Scarf')).toHaveValue('#123456')
    app.unmount()

    const reloaded = render(<App />)
    expect(screen.getByLabelText('Colour for Scarf')).toHaveValue('#123456')
    selectColour('Colour for Scarf', '#abcdef')
    expect(screen.getByLabelText('Colour for Scarf')).toHaveValue('#abcdef')
    await user.click(screen.getByRole('button', { name: 'Clear colour for Scarf' }))
    reloaded.unmount()

    render(<App />)
    expect(screen.getByRole('button', { name: 'Add colour for Scarf' })).toBeInTheDocument()
    expect(JSON.parse(stored.get(STORAGE_KEY)!)[0].items[0].colour).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Add colour for Scarf' }))
    selectColour('Colour for Scarf', '#fedcba')
    expect(screen.getByLabelText('Colour for Scarf')).toHaveValue('#fedcba')
  })

  it('round-trips hex colours and no-colour items through the actual CSV download and upload', async () => {
    const user = userEvent.setup()
    const legacyBag = { id: 'bag', type: 'carry-on', nickname: 'CSV bag', items: [
      { id: 'scarf', name: 'Scarf', icon: 'PiCube', quantity: 1, packed: false, colour: '#123456' },
      { id: 'socks', name: 'Socks', icon: 'PiSock', quantity: 2, packed: true, colour: null },
    ] }
    stored.set(STORAGE_KEY, JSON.stringify([legacyBag]))
    const download = vi.mocked(URL.createObjectURL)
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    render(<App />)
    await user.click(screen.getByRole('button', { name: /Export CSV/ }))
    const csv = await readBlob(download.mock.calls[0][0] as Blob)
    expect(csv).toContain('itemColour')
    expect(csv).toContain('#123456')
    await user.click(screen.getByRole('button', { name: 'Clear colour for Scarf' }))
    await user.upload(document.querySelector('input[type="file"]') as HTMLInputElement,
      new File([csv], 'colours.csv', { type: 'text/csv' }))
    await waitFor(() => expect(screen.getByLabelText('Colour for Scarf')).toHaveValue('#123456'))
    expect(screen.getByRole('button', { name: 'Add colour for Socks' })).toBeInTheDocument()
    expect(screen.getByText('1/2 packed')).toBeInTheDocument()
    const saved = JSON.parse(stored.get(STORAGE_KEY)!)
    expect(saved[0].items.map((item: { colour: string | null }) => item.colour)).toEqual(['#123456', null])
  })

  it('loads legacy data and normalizes missing, blank, or invalid CSV colours to null', async () => {
    const user = userEvent.setup()
    stored.set(STORAGE_KEY, JSON.stringify([{ id: 'bag', type: 'carry-on', nickname: 'Old bag', items: [
      { id: 'shirt', name: 'T-Shirt', icon: 'PiTShirt', quantity: 1, packed: false },
    ] }]))
    render(<App />)
    expect(screen.getByRole('button', { name: 'Add colour for T-Shirt' })).toBeInTheDocument()
    expect(JSON.parse(stored.get(STORAGE_KEY)!)[0].items[0].colour).toBeNull()

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const legacyCSV = 'baggageId,baggageType,itemName,itemIcon,quantity,packed\nbag,carry-on,Socks,PiSock,2,false'
    await user.upload(fileInput, new File([legacyCSV], 'old.csv', { type: 'text/csv' }))
    expect(await screen.findByRole('button', { name: 'Add colour for Socks' })).toBeInTheDocument()

    const csv = 'baggageId,baggageType,itemName,quantity,packed,itemColour\nbag,carry-on,Scarf,1,false, #ABCDEF \nbag,carry-on,Hat,1,false,\nbag,carry-on,Gloves,1,false,red'
    await user.upload(fileInput, new File([csv], 'hex.csv', { type: 'text/csv' }))
    expect(await screen.findByLabelText('Colour for Scarf')).toHaveValue('#abcdef')
    expect(screen.getByRole('button', { name: 'Add colour for Hat' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add colour for Gloves' })).toBeInTheDocument()
    expect(JSON.parse(stored.get(STORAGE_KEY)!)[0].items.map((item: { colour: string | null }) => item.colour))
      .toEqual(['#abcdef', null, null])
  })
})
