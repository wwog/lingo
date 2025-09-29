import React from "react";
import ReactDOM from "react-dom/client";
import { RootLayout } from "@/global/root-layout";
import { StartApp } from "./app";
import { getCurrentWindow } from "@tauri-apps/api/window";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RootLayout>
      <StartApp />
    </RootLayout>
  </React.StrictMode>
);

// 在首次渲染完成后再显示窗口，避免加载过程闪烁
const showWindow = () => {
  try {
    getCurrentWindow().show();
  } catch (_) {}
};

requestAnimationFrame(showWindow);
window.addEventListener("load", showWindow, { once: true });
