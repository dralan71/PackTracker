import { describe, it, expect } from 'vitest'

// Test the data validation function from App.tsx
function isValidBaggageArray(data: unknown): boolean {
  if (!Array.isArray(data)) return false
  return data.every(
    (bag) =>
      typeof bag.id === 'string' &&
      typeof bag.type === 'string' &&
      typeof bag.nickname === 'string' &&
      Array.isArray(bag.items) &&
      bag.items.every(
        (item: any) =>
          typeof item.id === 'string' &&
          typeof item.name === 'string' &&
          typeof item.icon === 'string' &&
          typeof item.quantity === 'number' &&
          typeof item.packed === 'boolean'
      )
  )
}

describe('Utility Functions', () => {
  describe('isValidBaggageArray', () => {
    it('returns true for valid baggage array', () => {
      const validData = [
        {
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
      ]
      
      expect(isValidBaggageArray(validData)).toBe(true)
    })

    it('returns false for non-array data', () => {
      expect(isValidBaggageArray('not an array')).toBe(false)
      expect(isValidBaggageArray({})).toBe(false)
      expect(isValidBaggageArray(null)).toBe(false)
      expect(isValidBaggageArray(undefined)).toBe(false)
    })

    it('returns false for array with invalid baggage objects', () => {
      const invalidData = [
        {
          id: 123, // should be string
          type: 'carry-on',
          nickname: 'Test Bag',
          items: []
        }
      ]
      
      expect(isValidBaggageArray(invalidData)).toBe(false)
    })

    it('returns false for baggage with invalid items', () => {
      const invalidData = [
        {
          id: '1',
          type: 'carry-on',
          nickname: 'Test Bag',
          items: [
            {
              id: 'item1',
              name: 'Test Item',
              icon: 'cube',
              quantity: 'not a number', // should be number
              packed: false
            }
          ]
        }
      ]
      
      expect(isValidBaggageArray(invalidData)).toBe(false)
    })

    it('returns true for empty array', () => {
      expect(isValidBaggageArray([])).toBe(true)
    })

    it('returns true for baggage with empty items array', () => {
      const validData = [
        {
          id: '1',
          type: 'carry-on',
          nickname: 'Test Bag',
          items: []
        }
      ]
      
      expect(isValidBaggageArray(validData)).toBe(true)
    })
  })
})
