import { FC } from "react";
import {
  Plus,
  Trash2,
  Upload,
  ListPlus,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { ButtonGroup } from "@/components/ui/button-group";

//#region component Types
export interface EditorToolbarProps {
  selectedCount: number;
  onAddKey?: () => void;
  onBatchAdd?: () => void;
  onDeleteSelected?: () => void;
  onImport?: () => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}
//#endregion component Types

//#region component
export const EditorToolbar: FC<EditorToolbarProps> = ({
  selectedCount,
  onAddKey,
  onBatchAdd,
  onDeleteSelected,
  onImport,
  sidebarCollapsed = false,
  onToggleSidebar,
}) => {
  return (
    <TooltipProvider delayDuration={1200}>
      <div className="h-12 border-b flex items-center gap-2 px-3 bg-card shrink-0">
        {/* Button Group - 左侧：侧边栏切换 */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
                {sidebarCollapsed ? <PanelLeft /> : <PanelLeftClose />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>切换侧边栏</TooltipContent>
          </Tooltip>
        </div>

        <div className="w-px h-6 bg-border" />

        {/* Button Group - 中间：新增/批量/删除 */}
        <div className="flex items-center gap-1">
          <ButtonGroup>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="default" size="icon" onClick={onAddKey}>
                  <Plus />
                </Button>
              </TooltipTrigger>
              <TooltipContent>新增翻译</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={onBatchAdd}>
                  <ListPlus />
                </Button>
              </TooltipTrigger>
              <TooltipContent>批量添加</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={selectedCount > 0 ? "destructive" : "outline"}
                  size="icon"
                  disabled={selectedCount === 0}
                  onClick={onDeleteSelected}
                >
                  <Trash2 />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {selectedCount > 0 ? `删除选中(${selectedCount})` : "删除选中"}
              </TooltipContent>
            </Tooltip>
          </ButtonGroup>
        </div>

        {/* Button Group - 右侧：导入 */}
        <div className="ml-auto flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onImport}>
                <Upload />
              </Button>
            </TooltipTrigger>
            <TooltipContent>导入</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};
//#endregion component
