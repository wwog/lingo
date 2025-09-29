import { useState } from "react";

export function SettingsApp() {
  const [activeKey, setActiveKey] = useState("general");
  return <div className="h-full w-full grid grid-cols-4"></div>;
}
