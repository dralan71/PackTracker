import React, { useState } from "react";
import {
  PiTrash,
  PiPlusCircle,
  PiCheckCircle,
  PiCheckCircleFill,
} from "react-icons/pi";
import { FaChevronCircleUp, FaChevronCircleRight } from "react-icons/fa";
import { iconMap } from "../iconMap";
import { customToast } from "../ToastContext";
import { type Baggage, type Item, type DefaultItem } from "../types";
import ItemCard from "./ItemCard";

interface BaggageCardProps {
  baggage: Baggage;
  onUpdate: (baggage: Baggage) => void;
  onDelete: (id: string) => void;
  defaultItems: DefaultItem[];
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

const BaggageCard: React.FC<BaggageCardProps> = ({
  baggage,
  onUpdate,
  onDelete,
  defaultItems,
  collapsed,
  setCollapsed,
}) => {
  const [showAddItem, setShowAddItem] = useState(false);
  const [customItemName, setCustomItemName] = useState("");
  const [customItemIcon, setCustomItemIcon] = useState("PiCube");

  // Icon mapping function
  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || iconMap["PiCube"];
  };

  const addItem = (itemName: string, icon: string) => {
    // Check if item already exists
    const existingItemIndex = baggage.items.findIndex(
      (item) => item.name === itemName
    );

    let updatedBaggage;
    if (existingItemIndex !== -1) {
      // Item exists, increment quantity
      const updatedItems = [...baggage.items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + 1,
      };
      updatedBaggage = {
        ...baggage,
        items: updatedItems,
      };
      customToast.increaseQuantity(itemName, icon);
    } else {
      // Item doesn't exist, create new item
      const newItem: Item = {
        id: Date.now().toString(),
        name: itemName,
        icon,
        quantity: 1,
        packed: false,
      };

      updatedBaggage = {
        ...baggage,
        items: [...baggage.items, newItem],
      };
      customToast.addItem(itemName, icon);
    }
    onUpdate(updatedBaggage);
  };

  const updateItem = (updatedItem: Item) => {
    const updatedBaggage = {
      ...baggage,
      items: baggage.items.map((item) =>
        item.id === updatedItem.id ? updatedItem : item
      ),
    };
    onUpdate(updatedBaggage);
  };

  const deleteItem = (itemId: string) => {
    const item = baggage.items.find((item) => item.id === itemId);
    const updatedBaggage = {
      ...baggage,
      items: baggage.items.filter((item) => item.id !== itemId),
    };
    onUpdate(updatedBaggage);
    if (item) {
      customToast.removeItem(item.name);
    }
  };

  const updateNickname = (nickname: string) => {
    onUpdate({ ...baggage, nickname });
  };

  const togglePackAllItems = () => {
    const allPacked = baggage.items.every((item) => item.packed);
    const updatedBaggage = {
      ...baggage,
      items: baggage.items.map((item) => ({ ...item, packed: !allPacked })),
    };
    onUpdate(updatedBaggage);
  };

  const addCustomItem = () => {
    if (customItemName.trim()) {
      addItem(customItemName.trim(), customItemIcon);
      setCustomItemName("");
      setShowAddItem(false);
    }
  };

  return (
    <div className="baggage-card">
      <div className="baggage-header">
        <div className="baggage-info">
          <h3>{baggage.type}</h3>
          <input
            type="text"
            value={baggage.nickname}
            onChange={(e) => updateNickname(e.target.value)}
            placeholder="Nickname..."
            className="nickname-input"
          />
        </div>
        <div className="header-actions-horizontal">
          <button onClick={() => onDelete(baggage.id)} className="delete-btn">
            <PiTrash />
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="collapse-btn"
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <FaChevronCircleRight /> : <FaChevronCircleUp />}
          </button>
        </div>
      </div>

      <div className="items-section">
        <div className="items-header">
          <h4>Items ({baggage.items.length})</h4>
          <div className="header-actions">
            {baggage.items.length > 0 && (
              <button
                onClick={togglePackAllItems}
                className="pack-all-btn"
                title={
                  baggage.items.every((item) => item.packed)
                    ? "Unpack all items"
                    : "Pack all items"
                }
              >
                {baggage.items.every((item) => item.packed) ? (
                  <PiCheckCircleFill />
                ) : (
                  <PiCheckCircle />
                )}
              </button>
            )}
            <button
              onClick={() => {
                if (collapsed) {
                  // If the section is collapsed, expand it and show the add item section
                  setShowAddItem(true);
                  setCollapsed(false);
                } else {
                  // If the section is already expanded, toggle the add item section
                  setShowAddItem(!showAddItem);
                }
              }}
              className="add-item-btn"
            >
              <PiPlusCircle />
            </button>
          </div>
        </div>

        {!collapsed && (
          <>
            {showAddItem && (
              <div className="add-item-section">
                <div className="default-items">
                  <h5>Quick Add:</h5>
                  <div className="default-items-grid">
                    {defaultItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => addItem(item.name, item.icon)}
                        className="default-item-btn"
                      >
                        {React.createElement(getIconComponent(item.icon))}
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="custom-item">
                  <h5>Custom Item:</h5>
                  <div className="custom-item-form">
                    <input
                      type="text"
                      value={customItemName}
                      onChange={(e) => setCustomItemName(e.target.value)}
                      placeholder="Item name..."
                    />
                    <select
                      value={customItemIcon}
                      onChange={(e) => setCustomItemIcon(e.target.value)}
                    >
                      <option value="PiCube">📦 Default</option>
                      <option value="PiCamera">📷 Camera</option>
                      <option value="PiBook">📚 Book</option>
                      <option value="PiHeadphones">🎧 Headphones</option>
                      <option value="PiLaptop">💻 Laptop</option>
                      <option value="PiWatch">⌚ Watch</option>
                      {defaultItems.map((item, idx) => (
                        <option key={idx} value={item.icon}>
                          {item.emoji + " " + item.name}
                        </option>
                      ))}
                    </select>
                    <button onClick={addCustomItem}>Add</button>
                  </div>
                </div>
              </div>
            )}

            <div className="items-list">
              {baggage.items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onUpdate={updateItem}
                  onDelete={deleteItem}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BaggageCard;
