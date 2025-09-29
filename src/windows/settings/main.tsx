import React from "react";
import ReactDOM from "react-dom/client";
import { RootLayout } from "@/global/root-layout";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RootLayout>
      <div className="text-amber-100 bg-blue-500 p-4">123</div>
    </RootLayout>
  </React.StrictMode>
);
