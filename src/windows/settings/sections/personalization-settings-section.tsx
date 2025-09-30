import { useTheme, type Theme } from "@/components/theme-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PersonalizationSettingsSection() {
  const { theme, setTheme } = useTheme();

  return (
    <section className="flex flex-col gap-3 max-w-sm">
      <div>
        <h2 className="text-sm font-medium">主题</h2>
        <p className="text-xs text-muted-foreground mt-1">
          选择偏好的界面配色方案。
        </p>
      </div>
      <Select value={theme} onValueChange={(value) => setTheme(value as Theme)}>
        <SelectTrigger>
          <SelectValue placeholder="选择主题" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">亮色</SelectItem>
          <SelectItem value="dark">暗色</SelectItem>
          <SelectItem value="system">跟随系统</SelectItem>
        </SelectContent>
      </Select>
    </section>
  );
}

