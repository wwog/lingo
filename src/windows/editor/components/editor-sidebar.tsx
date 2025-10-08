import { FC } from "react";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

//#region component Types
export interface EditorSidebarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  languages: Array<{ code: string; name: string }>;
  stats: {
    total: number;
    completed: number;
    byLanguage: Record<string, { completed: number; total: number }>;
    incomplete: number;
  };
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}
//#endregion component Types

//#region component
export const EditorSidebar: FC<EditorSidebarProps> = ({
  searchTerm,
  onSearchChange,
  languages,
  stats,
  collapsed = false,
}) => {
  const overallProgress = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;

  if (collapsed) {
    return null;
  }

  return (
    <aside className="w-80 border-r flex flex-col bg-sidebar shrink-0">
      {/* Search */}
      <div className="p-3 border-b">
        <div className="text-xs font-medium mb-2 text-sidebar-foreground">搜索翻译</div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="搜索键或翻译内容..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Progress */}
      <div className="flex-1 overflow-auto">
        <div className="p-3 space-y-4">
          {/* Overall Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium text-sidebar-foreground">翻译进度</div>
              <div className="text-xs font-semibold text-sidebar-primary">{overallProgress}%</div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-sidebar-primary transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {stats.completed} 个翻译键
            </div>
          </div>

          {/* Language Progress */}
          {languages.map((lang) => {
            const langStats = stats.byLanguage[lang.code];
            const progress = langStats 
              ? Math.round((langStats.completed / langStats.total) * 100)
              : 0;
            
            return (
              <div key={lang.code}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-medium text-sidebar-foreground">{lang.name}</div>
                  <div className="text-xs font-semibold">{progress}%</div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-300",
                      progress === 100 ? "bg-green-500" : "bg-sidebar-primary"
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}

          {/* Incomplete Items */}
          {stats.incomplete > 0 && (
            <div className="pt-2">
              <button className="w-full flex items-center justify-between p-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors">
                <span className="text-xs font-medium">未完成项</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-destructive">
                    {stats.incomplete}
                  </span>
                  <ChevronDown className="size-4" />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
//#endregion component

