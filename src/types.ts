export interface Item {
  id: string;
  name: string;
  icon: string;
  quantity: number;
  packed: boolean;
}

export interface Baggage {
  id: string;
  type: BaggageType;
  nickname: string;
  items: Item[];
}

export type BaggageType = 
  | 'carry-on' 
  | 'medium-checked' 
  | 'large-checked' 
  | 'backpack' 
  | 'other';

export interface DefaultItem {
  name: string;
  icon: string;
  emoji: string; // Optional emoji for display purposes
}