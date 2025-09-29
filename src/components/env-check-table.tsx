import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, XCircle } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

interface EnvItem {
  name: string;
  installed: boolean;
  required: boolean;
  version?: string;
}

export function EnvCheckTable() {
  const [envItems, setEnvItems] = useState<EnvItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [installing, setInstalling] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadEnvRequirements();
  }, []);

  const loadEnvRequirements = async () => {
    try {
      setLoading(true);
      const requirements = await invoke<EnvItem[]>("get_env_requirements");
      setEnvItems(requirements);
    } catch (error) {
      console.error("Failed to load environment requirements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInstall = async (name: string) => {
    setInstalling((prev) => ({ ...prev, [name]: true }));
    try {
      if (name === "Git") {
        const result = await invoke<string>("install_git");
        alert(result);
      }
    } catch (error) {
      console.error(`Failed to install ${name}:`, error);
    } finally {
      setInstalling((prev) => ({ ...prev, [name]: false }));
      // 重新加载环境要求以更新状态
      loadEnvRequirements();
    }
  };

  if (loading) {
    return <div className="text-center py-4">正在检查环境...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">环境</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>版本</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {envItems.map((item) => (
            <TableRow key={item.name}>
              <TableCell className="font-medium">
                {item.name}
                {item.required && (
                  <span className="ml-2 text-xs text-red-500">*必需</span>
                )}
              </TableCell>
              <TableCell>
                {item.installed ? (
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    已安装
                  </div>
                ) : (
                  <div className="flex items-center">
                    <XCircle className="h-4 w-4 text-red-500 mr-2" />
                    未安装
                  </div>
                )}
              </TableCell>
              <TableCell>{item.version || "-"}</TableCell>
              <TableCell className="text-right">
                {!item.installed ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleInstall(item.name)}
                    disabled={installing[item.name]}
                  >
                    {installing[item.name] ? "安装中..." : "安装"}
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    已安装
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}