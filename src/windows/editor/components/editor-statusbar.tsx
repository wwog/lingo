import { FC } from "react";
import { GitBranch, Languages } from "lucide-react";

//#region component Types
export interface EditorStatusbarProps {
  totalKeys: number;
  selectedCount: number;
  languageCount: number;
  filteredCount?: number;
}
//#endregion component Types

//#region component
export const EditorStatusbar: FC<EditorStatusbarProps> = ({
  totalKeys,
  selectedCount,
  languageCount,
  filteredCount,
}) => {
  return (
    <footer className="h-6 border-t flex items-center justify-between px-3 text-xs bg-sidebar shrink-0">
      <div className="flex items-center gap-4 text-sidebar-foreground">
        <div className="flex items-center gap-1.5">
          <GitBranch className="size-3.5" />
          <span>共 {totalKeys} 个翻译键</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <Languages className="size-3.5" />
          <span>{languageCount} 种语言</span>
        </div>
        
        {selectedCount > 0 && (
          <div className="text-sidebar-primary font-medium">
            已选择 {selectedCount} 项
          </div>
        )}
      </div>

      <div className="text-muted-foreground">
        {filteredCount !== undefined && filteredCount !== totalKeys && (
          <span>显示 {filteredCount} / {totalKeys} 项</span>
        )}
      </div>
    </footer>
  );
};
//#endregion component
