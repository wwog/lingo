import { useTheme, type Theme } from "@/components/theme-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Palette } from "lucide-react";

export function PersonalizationSettingsSection() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">个性化</h2>
        <p className="text-sm text-muted-foreground mt-1">
          自定义应用程序的外观和感觉
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4" />
            主题
          </CardTitle>
          <CardDescription>
            选择偏好的界面配色方案
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme-select">颜色方案</Label>
            <Select value={theme} onValueChange={(value) => setTheme(value as Theme)}>
              <SelectTrigger id="theme-select">
                <SelectValue placeholder="选择主题" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">亮色</SelectItem>
                <SelectItem value="dark">暗色</SelectItem>
                <SelectItem value="system">跟随系统</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

