import { FC, useState } from "react";
import { Trash2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

//#region component Types
export interface TranslationEntry {
  key: string;
  values: Record<string, string>;
}

export interface EditorTableProps {
  translations: TranslationEntry[];
  languages: Array<{ code: string; name: string }>;
  selectedKeys: Set<string>;
  onSelectionChange: (keys: Set<string>) => void;
  onValueChange?: (key: string, language: string, value: string) => void;
  onDeleteKey?: (key: string) => void;
}
//#endregion component Types

//#region component
export const EditorTable: FC<EditorTableProps> = ({
  translations,
  languages,
  selectedKeys,
  onSelectionChange,
  onValueChange,
  onDeleteKey,
}) => {
  const [editingCell, setEditingCell] = useState<{ key: string; lang: string } | null>(null);

  const toggleAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(new Set(translations.map(t => t.key)));
    } else {
      onSelectionChange(new Set());
    }
  };

  const toggleKey = (key: string) => {
    const newSelected = new Set(selectedKeys);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    onSelectionChange(newSelected);
  };

  const allSelected = translations.length > 0 && selectedKeys.size === translations.length;
  const someSelected = selectedKeys.size > 0 && selectedKeys.size < translations.length;

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur">
          <tr>
            <th className="w-10 px-3 py-3 text-left border-b">
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleAll}
                aria-label="全选"
                className={cn(someSelected && "data-[state=unchecked]:bg-primary/20")}
              />
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-b min-w-[240px] sticky left-0 bg-muted/80 backdrop-blur">
              翻译键
            </th>
            {languages.map((lang) => (
              <th
                key={lang.code}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-b min-w-[280px]"
              >
                {lang.name}
              </th>
            ))}
            <th className="w-16 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider border-b">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          {translations.map((entry) => (
            <tr
              key={entry.key}
              className={cn(
                "border-b hover:bg-accent/50 transition-colors group",
                selectedKeys.has(entry.key) && "bg-accent"
              )}
            >
              <td className="px-3 py-2">
                <Checkbox
                  checked={selectedKeys.has(entry.key)}
                  onCheckedChange={() => toggleKey(entry.key)}
                  aria-label={`选择 ${entry.key}`}
                />
              </td>
              <td className="px-4 py-2 font-mono text-sm sticky left-0 bg-background group-hover:bg-accent/50">
                <div className="flex items-center gap-2">
                  <span className="text-primary">{entry.key}</span>
                </div>
              </td>
              {languages.map((lang) => {
                const value = entry.values[lang.code] || "";
                const isEmpty = !value;
                const isEditing = editingCell?.key === entry.key && editingCell?.lang === lang.code;

                return (
                  <td key={lang.code} className="px-4 py-2">
                    <div className="relative">
                      <Input
                        value={value}
                        placeholder={`输入${lang.name}翻译...`}
                        onChange={(e) => onValueChange?.(entry.key, lang.code, e.target.value)}
                        onFocus={() => setEditingCell({ key: entry.key, lang: lang.code })}
                        onBlur={() => setEditingCell(null)}
                        className={cn(
                          "h-8 text-sm",
                          isEmpty && !isEditing && "border-destructive/50"
                        )}
                      />
                      {isEmpty && !isEditing && (
                        <AlertCircle className="absolute right-2 top-1/2 -translate-y-1/2 size-3.5 text-destructive/50" />
                      )}
                    </div>
                  </td>
                );
              })}
              <td className="px-3 py-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onDeleteKey?.(entry.key)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {translations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">暂无翻译</p>
          <p className="text-sm mt-1">点击"新增翻译"开始添加</p>
        </div>
      )}
    </div>
  );
};
//#endregion component

