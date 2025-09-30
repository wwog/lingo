import { EnvCheckTable } from "@/components/env-check-table";

export function EnvSettingsSection() {
  return (
    <div className="h-full flex flex-col gap-3">
      <h2 className="text-sm font-medium">环境检测与安装</h2>
      <p className="text-xs text-muted-foreground">
        检查开发环境依赖并进行安装。Git 为必需项，不能取消。
      </p>
      <EnvCheckTable />
    </div>
  );
}

