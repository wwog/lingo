import { useState } from "react";
import { EnvCheckTable } from "@/components/env-check-table";

export function SettingsApp() {
  const [activeKey, setActiveKey] = useState("env");

  return (
    <div className="h-full w-full grid grid-cols-12">
      <aside className="col-span-3 border-r px-3 py-4">
        <div className="text-xs text-muted-foreground mb-2 px-2">设置</div>
        <nav className="flex flex-col gap-1">
          <button
            className={`text-left px-2 py-2 rounded hover:bg-accent hover:text-accent-foreground ${
              activeKey === "env" ? "bg-accent text-accent-foreground" : ""
            }`}
            onClick={() => setActiveKey("env")}
          >
            环境
          </button>
        </nav>
      </aside>
      <main className="col-span-9 p-4 overflow-auto h-full">
        {activeKey === "env" && (
          <div className="h-full flex flex-col gap-3">
            <h2 className="text-sm font-medium">环境检测与安装</h2>
            <p className="text-xs text-muted-foreground">
              检查开发环境依赖并进行安装。Git 为必需项，不能取消。
            </p>
            <EnvCheckTable />
          </div>
        )}
      </main>
    </div>
  );
}
