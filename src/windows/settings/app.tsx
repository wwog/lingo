import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SettingsSidebar } from "./components/settings-sidebar";

export function SettingsApp() {
  const [activeTab, setActiveTab] = useState<string>("general");

  return (
    <SidebarProvider open>
      <SettingsSidebar />
      <main>
        <SidebarTrigger></SidebarTrigger>
      </main>
    </SidebarProvider>
  );
}
