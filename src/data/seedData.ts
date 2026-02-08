import { type Baggage, type BaggageType, type Item } from '../types';

function makeItem(id: string, name: string, icon: string, quantity: number, packed: boolean): Item {
  return { id, name, icon, quantity, packed };
}

export function getSeedBaggages(): Baggage[] {
  const baseId = `seed-${Date.now()}`;
  return [
    {
      id: `${baseId}-1`,
      type: 'carry-on' as BaggageType,
      nickname: 'Weekend bag',
      items: [
        makeItem(`${baseId}-1-1`, 'T-Shirt', 'PiTShirt', 2, true),
        makeItem(`${baseId}-1-2`, 'Socks', 'PiSock', 3, true),
        makeItem(`${baseId}-1-3`, 'Underwear', 'GiUnderwearShorts', 3, false),
        makeItem(`${baseId}-1-4`, 'Toothbrush', 'PiCube', 1, false),
        makeItem(`${baseId}-1-5`, 'Phone charger', 'PiCube', 1, true),
      ],
    },
    {
      id: `${baseId}-2`,
      type: 'medium-checked' as BaggageType,
      nickname: 'Main suitcase',
      items: [
        makeItem(`${baseId}-2-1`, 'Dress Shirt', 'PiShirtFolded', 2, true),
        makeItem(`${baseId}-2-2`, 'Dress Pants', 'PiPants', 1, true),
        makeItem(`${baseId}-2-3`, 'Jacket', 'GiMonclerJacket', 1, false),
        makeItem(`${baseId}-2-4`, 'Shoes', 'PiSneaker', 2, true),
        makeItem(`${baseId}-2-5`, 'Belt', 'PiBelt', 1, true),
        makeItem(`${baseId}-2-6`, 'Swimming Suit', 'PiSwimming', 1, false),
        makeItem(`${baseId}-2-7`, 'Pajama Pants', 'PiBed', 1, false),
      ],
    },
    {
      id: `${baseId}-3`,
      type: 'backpack' as BaggageType,
      nickname: 'Daypack',
      items: [
        makeItem(`${baseId}-3-1`, 'Hat', 'PiBaseballCap', 1, true),
        makeItem(`${baseId}-3-2`, 'Water bottle', 'PiCube', 1, false),
        makeItem(`${baseId}-3-3`, 'Sunglasses', 'PiCube', 1, true),
      ],
    },
  ];
}
