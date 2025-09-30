import { useState } from "react";
import { Palette, Terminal } from "lucide-react";
import { EnvSettingsSection } from "./sections/env-settings-section";
import { PersonalizationSettingsSection } from "./sections/personalization-settings-section";

export function SettingsApp() {
  const [activeKey, setActiveKey] = useState("env");

  const handleTabChange = (key: string) => {
    setActiveKey(key);
  };

  return (
    <div className="h-full w-full grid grid-cols-12">
      <aside className="col-span-3 border-r px-3 py-4">
        <div className="text-xs text-muted-foreground mb-2 px-2">设置</div>
        <nav className="flex flex-col gap-1">
          <button
            className={`flex items-center gap-2 text-left px-2 py-2 rounded hover:bg-accent hover:text-accent-foreground transition-colors ${
              activeKey === "env" ? "bg-accent text-accent-foreground" : ""
            }`}
            onClick={() => handleTabChange("env")}
          >
            <Terminal className="h-4 w-4" />
            <span>环境</span>
          </button>
          <button
            className={`flex items-center gap-2 text-left px-2 py-2 rounded hover:bg-accent hover:text-accent-foreground transition-colors ${
              activeKey === "personalization"
                ? "bg-accent text-accent-foreground"
                : ""
            }`}
            onClick={() => handleTabChange("personalization")}
          >
            <Palette className="h-4 w-4" />
            <span>个性化</span>
          </button>
        </nav>
      </aside>
      <main className="col-span-9 p-4 overflow-auto h-full">
        <div className={`h-full ${activeKey === "env" ? "block" : "hidden"}`}>
          <EnvSettingsSection />
        </div>
        <div className={`h-full ${activeKey === "personalization" ? "block" : "hidden"}`}>
          <PersonalizationSettingsSection />
        </div>
      </main>
    </div>
  );
}
