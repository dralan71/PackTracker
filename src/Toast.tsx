import React from "react";
import "./Toast.css";

export type ToastType = "success" | "error";

function ToastRing({ type }: { type: ToastType }) {
  return (
    <svg className="toast__ring" viewBox="0 0 20 20">
      <circle className="toast__ring-track" cx="10" cy="10" r="8" />
      <circle className={`toast__ring-fill toast__ring-fill--${type}`} cx="10" cy="10" r="8" />
    </svg>
  );
}

export function ToastContent({
  type,
  message,
  icon,
}: {
  type: ToastType;
  message: string;
  icon: React.ReactElement;
}) {
  return (
    <div className={`toast toast--${type}`}>
      <ToastRing type={type} />
      <span className="toast__icon">{icon}</span>
      <span className="toast__msg">{message}</span>
    </div>
  );
}
