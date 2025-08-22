import { toast } from "react-hot-toast";
import { PiTrash, PiSuitcase, PiCheckCircle, PiXCircle } from "react-icons/pi";
import { iconMap } from "./iconMap";
import React from "react";

// Custom toast configuration with dark theme
export const toastConfig = {
  style: {
    borderRadius: '10px',
    background: '#2a2a2a',
    color: '#fff',
    border: '1px solid #444',
    fontSize: '14px',
    padding: '12px 16px',
  },
  success: {
    style: {
      borderRadius: '10px',
      background: '#2a2a2a',
      color: '#fff',
      border: '1px solid #555',
    },
  },
  error: {
    style: {
      borderRadius: '10px',
      background: '#2a2a2a',
      color: '#fff',
      border: '1px solid #e74c3c',
    },
  },
};

// Helper function to get styled icon component
const getStyledIconComponent = (iconName: string) => {
  const IconComponent = iconMap[iconName] || iconMap["PiCube"];
  
  // React icons accept standard SVG props including style and color
  return React.createElement(IconComponent, {
    style: { color: '#27ae60' },
    // Alternative: you can also use the color prop directly
    // color: '#27ae60'
  } as React.ComponentProps<typeof IconComponent>);
};

// Custom toast functions with icons
export const customToast = {
  success: (message: string, icon?: React.ReactElement) => {
    return toast.success(message, {
      ...toastConfig.success,
      icon: icon || <PiCheckCircle style={{ color: '#27ae60' }} />,
    });
  },

  error: (message: string) => {
    return toast.error(message, {
      ...toastConfig.error,
      icon: <PiXCircle style={{ color: '#e74c3c' }} />,
    });
  },

  addItem: (itemName: string, itemIcon: string) => {
    const styledIcon = getStyledIconComponent(itemIcon);
    return toast.success(`Added item: '${itemName}'`, {
      ...toastConfig.success,
      icon: styledIcon,
    });
  },

  increaseQuantity: (itemName: string, itemIcon: string) => {
    const styledIcon = getStyledIconComponent(itemIcon);
    return toast.success(`Increased quantity of '${itemName}'`, {
      ...toastConfig.success,
      icon: styledIcon,
    });
  },

  removeItem: (itemName: string) => {
    return toast.success(`Removed item: '${itemName}'`, {
      ...toastConfig.success,
      icon: <PiTrash style={{ color: '#e74c3c' }} />,
    });
  },

  addBaggage: (baggageType: string) => {
    return toast.success(`Added new baggage: ${baggageType.replace("-", " ")}`, {
      ...toastConfig.success,
      icon: <PiSuitcase style={{ color: '#27ae60' }} />,
    });
  },

  deleteBaggage: (baggage?: { nickname?: string }) => {
    return toast.success(`Baggage deleted${baggage?.nickname ? `: ${baggage.nickname}` : ""}`, {
      ...toastConfig.success,
      icon: <PiTrash style={{ color: '#e74c3c' }} />,
    });
  },

  clearAll: () => {
    return toast.success("All luggage data cleared", {
      ...toastConfig.success,
      icon: <PiTrash style={{ color: '#e74c3c' }} />,
    });
  },

  exportCSV: () => {
    return toast.success("CSV exported successfully", {
      ...toastConfig.success,
      icon: <PiCheckCircle style={{ color: '#27ae60' }} />,
    });
  },

  importCSV: () => {
    return toast.success("CSV imported successfully", {
      ...toastConfig.success,
      icon: <PiCheckCircle style={{ color: '#27ae60' }} />,
    });
  },
};
