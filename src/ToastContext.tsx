import { toast } from "react-hot-toast";
import { PiTrash, PiSuitcase, PiCheckCircle, PiXCircle } from "react-icons/pi";
import { iconMap } from "./iconMap";
import React from "react";
import { ToastContent, type ToastType } from "./Toast";
export type { ToastType };

export const TOAST_DURATION_MS = 2500;

const TRASH_COLOR = "var(--accent)";
const SUCCESS_ICON_COLOR = "#5a9a6e";

function showToast(type: ToastType, message: string, icon: React.ReactElement) {
  return toast.custom(
    () => (
      <ToastContent
        type={type}
        message={message}
        icon={icon}
        durationMs={TOAST_DURATION_MS}
      />
    ),
    { duration: TOAST_DURATION_MS }
  );
}

const getStyledIconComponent = (iconName: string) => {
  const IconComponent = iconMap[iconName] || iconMap["PiCube"];
  return React.createElement(IconComponent, {
    style: { color: SUCCESS_ICON_COLOR },
  } as React.ComponentProps<typeof IconComponent>);
};

export const toastConfig = {
  style: {
    padding: 0,
    background: "transparent",
    border: "none",
    boxShadow: "none",
  },
};

export const customToast = {
  success: (message: string, icon?: React.ReactElement) => {
    return showToast(
      "success",
      message,
      icon || <PiCheckCircle style={{ color: SUCCESS_ICON_COLOR }} />
    );
  },

  error: (message: string) => {
    return showToast(
      "error",
      message,
      <PiXCircle style={{ color: TRASH_COLOR }} />
    );
  },

  addItem: (itemName: string, itemIcon: string) => {
    const styledIcon = getStyledIconComponent(itemIcon);
    return showToast("success", `Added item: '${itemName}'`, styledIcon);
  },

  increaseQuantity: (itemName: string, itemIcon: string) => {
    const styledIcon = getStyledIconComponent(itemIcon);
    return showToast("success", `Increased quantity of '${itemName}'`, styledIcon);
  },

  removeItem: (itemName: string) => {
    return showToast(
      "success",
      `Removed item: '${itemName}'`,
      <PiTrash style={{ color: TRASH_COLOR }} />
    );
  },

  addBaggage: (baggageType: string) => {
    return showToast(
      "success",
      `Added new baggage: ${baggageType.replace("-", " ")}`,
      <PiSuitcase style={{ color: SUCCESS_ICON_COLOR }} />
    );
  },

  deleteBaggage: (baggage?: { nickname?: string }) => {
    return showToast(
      "success",
      `Baggage deleted${baggage?.nickname ? `: ${baggage.nickname}` : ""}`,
      <PiTrash style={{ color: TRASH_COLOR }} />
    );
  },

  clearAll: () => {
    return showToast(
      "success",
      "All luggage data cleared",
      <PiTrash style={{ color: TRASH_COLOR }} />
    );
  },

  exportCSV: () => {
    return showToast(
      "success",
      "CSV exported successfully",
      <PiCheckCircle style={{ color: SUCCESS_ICON_COLOR }} />
    );
  },

  importCSV: () => {
    return showToast(
      "success",
      "CSV imported successfully",
      <PiCheckCircle style={{ color: SUCCESS_ICON_COLOR }} />
    );
  },

  mergeItems: (itemName: string, newQuantity: number) => {
    return showToast(
      "success",
      `Merged '${itemName}' items (quantity: ${newQuantity})`,
      <PiCheckCircle style={{ color: SUCCESS_ICON_COLOR }} />
    );
  },
};
