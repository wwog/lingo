import { FC, useState, useMemo } from "react";
import { EditorSidebar } from "./editor-sidebar";
import { EditorToolbar } from "./editor-toolbar";
import { EditorTable, TranslationEntry } from "./editor-table";
import { EditorStatusbar } from "./editor-statusbar";

//#region component Types
export interface EditorProps {
  projectPath: string;
}
//#endregion component Types

//#region component
export const Editor: FC<EditorProps> = ({ projectPath }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Mock data - 稍后从项目文件加载
  const languages = [
    { code: "zh-CN", name: "中文-简体" },
    { code: "en-US", name: "英语" },
  ];

  const [translations] = useState<TranslationEntry[]>([
    { key: "app.title", values: { "zh-CN": "应用程序", "en-US": "Application" } },
    { key: "app.welcome", values: { "zh-CN": "欢迎", "en-US": "Welcome" } },
    { key: "button.save", values: { "zh-CN": "保存", "en-US": "Save" } },
    { key: "button.cancel", values: { "zh-CN": "取消", "en-US": "Cancel" } },
    { key: "button.delete", values: { "zh-CN": "删除", "en-US": "Delete" } },
    { key: "menu.file", values: { "zh-CN": "文件", "en-US": "" } },
    { key: "menu.edit", values: { "zh-CN": "", "en-US": "Edit" } },
  ]);

  // Filter translations based on search
  const filteredTranslations = useMemo(() => {
    if (!searchTerm) return translations;
    
    const term = searchTerm.toLowerCase();
    return translations.filter(t => 
      t.key.toLowerCase().includes(term) ||
      Object.values(t.values).some(v => v.toLowerCase().includes(term))
    );
  }, [translations, searchTerm]);

  // Calculate statistics
  const stats = useMemo(() => {
    const byLanguage: Record<string, { completed: number; total: number }> = {};
    let totalCompleted = 0;
    let incompleteCount = 0;

    languages.forEach(lang => {
      let completed = 0;
      translations.forEach(t => {
        if (t.values[lang.code]) {
          completed++;
        }
      });
      byLanguage[lang.code] = {
        completed,
        total: translations.length,
      };
    });

    // Count fully completed translations (all languages filled)
    translations.forEach(t => {
      const allFilled = languages.every(lang => t.values[lang.code]);
      if (allFilled) {
        totalCompleted++;
      } else {
        incompleteCount++;
      }
    });

    return {
      total: translations.length,
      completed: totalCompleted,
      byLanguage,
      incomplete: incompleteCount,
    };
  }, [translations, languages]);

  const handleValueChange = (key: string, language: string, value: string) => {
    console.log("Value changed:", { key, language, value });
    // TODO: 实现实际的值更新逻辑
  };

  const handleDeleteKey = (key: string) => {
    console.log("Delete key:", key);
    // TODO: 实现删除逻辑
  };

  const handleDeleteSelected = () => {
    console.log("Delete selected:", Array.from(selectedKeys));
    // TODO: 实现批量删除逻辑
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        <EditorSidebar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          languages={languages}
          stats={stats}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          <EditorToolbar
            selectedCount={selectedKeys.size}
            onAddKey={() => console.log("Add key")}
            onBatchAdd={() => console.log("Batch add")}
            onDeleteSelected={handleDeleteSelected}
            onImport={() => console.log("Import")}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          />

          <EditorTable
            translations={filteredTranslations}
            languages={languages}
            selectedKeys={selectedKeys}
            onSelectionChange={setSelectedKeys}
            onValueChange={handleValueChange}
            onDeleteKey={handleDeleteKey}
          />
        </main>
      </div>

      {/* 状态栏通底 */}
      <EditorStatusbar
        totalKeys={translations.length}
        selectedCount={selectedKeys.size}
        languageCount={languages.length}
        filteredCount={searchTerm ? filteredTranslations.length : undefined}
      />
    </div>
  );
};
//#endregion component

