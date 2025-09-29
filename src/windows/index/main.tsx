import React from "react";
import ReactDOM from "react-dom/client";
import { RootLayout } from "@/global/root-layout";
import { StartApp } from "./app";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RootLayout>
      <StartApp />
    </RootLayout>
  </React.StrictMode>
);
