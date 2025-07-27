import React from 'react';
import { 
  PiMinus, 
  PiPlus, 
  PiCheckCircle, 
  PiCircle, 
  PiTrash
} from 'react-icons/pi';
import { iconMap } from '../iconMap';
import { type Item } from '../types';

interface ItemCardProps {
  item: Item;
  onUpdate: (item: Item) => void;
  onDelete: (itemId: string) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onUpdate, onDelete }) => {
  // Icon mapping function
  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || iconMap['PiCube'];
  };

  const updateQuantity = (quantity: number) => {
    if (quantity > 0) {
      onUpdate({ ...item, quantity });
    }
  };

  const togglePacked = () => {
    onUpdate({ ...item, packed: !item.packed });
  };

  return (
    <div className={`item-card ${item.packed ? 'packed' : ''}`}>
      <div className="item-info">
        {React.createElement(getIconComponent(item.icon))}
        <span className="item-name">{item.name}</span>
      </div>
      
      <div className="item-controls">
        <div className="quantity-controls">
          <button className='item-counter-controls' onClick={() => updateQuantity(item.quantity - 1)}>
            <PiMinus />
          </button>
          <span className="quantity">{item.quantity}</span>
          <button className='item-counter-controls' onClick={() => updateQuantity(item.quantity + 1)}>
            <PiPlus />
          </button>
        </div>
        
        <button 
          onClick={togglePacked}
          className={`pack-btn ${item.packed ? 'packed' : ''}`}
        >
          {item.packed ? <PiCheckCircle /> : <PiCircle />}
        </button>
        
        <button 
          onClick={() => onDelete(item.id)}
          className="delete-item-btn"
        >
          <PiTrash />
        </button>
      </div>
    </div>
  );
};

export default ItemCard;