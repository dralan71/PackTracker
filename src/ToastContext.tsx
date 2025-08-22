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

// Helper function to get icon component
const getIconComponent = (iconName: string) => {
  return iconMap[iconName] || iconMap["PiCube"];
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
    const IconComponent = getIconComponent(itemIcon);
    return toast.success(`Added item: '${itemName}'`, {
      ...toastConfig.success,
      icon: React.createElement(IconComponent),
    });
  },

  increaseQuantity: (itemName: string, itemIcon: string) => {
    const IconComponent = getIconComponent(itemIcon);
    return toast.success(`Increased quantity of '${itemName}'`, {
      ...toastConfig.success,
      icon: React.createElement(IconComponent),
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
