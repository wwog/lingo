import { EnvCheckTable } from "@/components/env-check-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal } from "lucide-react";

export function EnvSettingsSection() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">环境</h2>
        <p className="text-sm text-muted-foreground mt-1">
          管理开发环境依赖项的安装和配置
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Terminal className="h-4 w-4" />
            环境检测与安装
          </CardTitle>
          <CardDescription>
            检查开发环境依赖并进行安装。Git 为必需项，不能取消
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <EnvCheckTable />
        </CardContent>
      </Card>
    </div>
  );
}

