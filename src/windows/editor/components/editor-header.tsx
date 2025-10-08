import { FC } from "react";
import { ArrowLeft, Settings, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

//#region component Types
export interface EditorHeaderProps {
  projectName: string;
  translationCount: number;
  onBack?: () => void;
  onLanguageSettings?: () => void;
  onExport?: () => void;
}
//#endregion component Types

//#region component
export const EditorHeader: FC<EditorHeaderProps> = ({
  projectName,
  translationCount,
  onBack,
  onLanguageSettings,
  onExport,
}) => {
  return (
    <header className="h-14 border-b flex items-center justify-between px-4 bg-card shrink-0">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} title="返回">
          <ArrowLeft />
        </Button>
        
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">{projectName}</h1>
          <Badge variant="secondary">
            {translationCount}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onLanguageSettings}>
          <Settings />
          语言管理
        </Button>
        
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download />
          导出
        </Button>
      </div>
    </header>
  );
};
//#endregion component

