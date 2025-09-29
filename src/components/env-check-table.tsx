import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useMemo, useState } from "react";

interface EnvItem {
  name: string;
  installed: boolean;
  required: boolean;
  version?: string;
  selected: boolean;
}

export function EnvCheckTable() {
  const [envItems, setEnvItems] = useState<EnvItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [gitSimulation, setGitSimulation] = useState<boolean>(false);

  useEffect(() => {
    loadEnvRequirements();
  }, [gitSimulation]);

  const loadEnvRequirements = async () => {
    try {
      setLoading(true);
      
      // 如果开启了 Git 模拟，使用模拟状态
      if (gitSimulation) {
        const mockGit: EnvItem = {
          name: "Git",
          installed: false,
          required: true,
          version: "2.45.0",
          selected: true
        };
        setEnvItems([mockGit]);
      } else {
        // 否则从后端获取真实环境数据
        const requirements = await invoke<EnvItem[]>("get_env_requirements");
        const withSelection = requirements.map(item => ({
          ...item,
          selected: item.required || item.installed
        }));
        setEnvItems(withSelection);
      }
    } catch (error) {
      console.error("Failed to load environment requirements:", error);
      setEnvItems([]);
    } finally {
      setLoading(false);
    }
  };


  const isDirty = useMemo(() => {
    return envItems.some(item => 
      !item.required && item.selected !== item.installed
    );
  }, [envItems]);

  const toggleSelected = (name: string) => {
    setEnvItems(prev => prev.map(item => {
      if (item.name !== name) return item;
      if (item.required) return item;
      return { ...item, selected: !item.selected };
    }));
  };

  const applyConfirm = async () => {
    // 计算更改清单
    const changeMarks: string[] = [];
    envItems.forEach(item => {
      if (!item.name || item.required) return;
      if (item.selected !== item.installed) {
        changeMarks.push(`${item.selected ? "+" : "-"} ${item.name}`);
      }
    });

    const confirmText = changeMarks.length
      ? `将进行以下更改：\n${changeMarks.join("\n")}`
      : "没有可应用的更改。";

    if (changeMarks.length === 0) {
      alert(confirmText);
      return;
    }

    const ok = window.confirm(confirmText);
    if (!ok) return;

    setSaving(true);
    try {
      // 更新安装状态
      const next = envItems.map(item => ({
        ...item,
        installed: item.required ? item.installed : item.selected
      }));
      setEnvItems(next);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">正在检查环境...</div>;
  }


  return (
    <div className="rounded-md h-full flex flex-col">
      {/* Git 模拟开关 */}
      <div className="flex items-center space-x-2 p-3 border-b bg-muted/50">
        <Switch
          id="git-simulation"
          checked={gitSimulation}
          onCheckedChange={setGitSimulation}
        />
        <Label htmlFor="git-simulation" className="text-sm">
          Git 模拟模式 (用于测试)
        </Label>
      </div>
      
      <Table className="border-0">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[56px]"></TableHead>
            <TableHead className="w-[220px]">环境</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>版本</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {envItems.map((item, idx) => (
            <TableRow key={idx}>
              <TableCell>
                {item.name ? (
                  <input
                    type="checkbox"
                    checked={!!item.selected}
                    disabled={item.required}
                    onChange={() => toggleSelected(item.name)}
                    className="h-4 w-4"
                  />
                ) : null}
              </TableCell>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>
                {item.name ? (
                  item.installed ? (
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      已安装
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <XCircle className="h-4 w-4 text-red-500 mr-2" />
                      未安装
                    </div>
                  )
                ) : null}
              </TableCell>
              <TableCell>{item.name ? (item.version || "-") : null}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex-1 flex items-end justify-end gap-2 p-3 border-t bg-background/50 ">
        <Button disabled={!isDirty || saving} onClick={applyConfirm}>确认更改</Button>
      </div>
    </div>
  );
}