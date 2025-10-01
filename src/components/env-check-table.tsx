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
import {
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import { useConfirm } from "@/lib/use-confirm";
import {
  fetchEnvRequirements,
  installGitWithProgress,
  listenInstallOutput,
  type EnvItem,
} from "@/lib/tauri-env-bridge";

interface EnvTableItem extends EnvItem {
  selected: boolean;
}

export function EnvCheckTable() {
  const [envItems, setEnvItems] = useState<EnvTableItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [rechecking, setRechecking] = useState<boolean>(false);
  const [installing, setInstalling] = useState<boolean>(false);
  const [installOutput, setInstallOutput] = useState<string[]>([]);
  const [gitSimulation, setGitSimulation] = useState<boolean>(false);
  const { confirm, ConfirmDialog } = useConfirm();
  const outputRef = useRef<HTMLDivElement>(null);
  const listenerInitialized = useRef<boolean>(false);

  useEffect(() => {
    loadEnvRequirements();
  }, [gitSimulation]);

  // 监听安装输出
  useEffect(() => {
    // 防止在 StrictMode 下重复注册监听器
    if (listenerInitialized.current) {
      return;
    }

    let unlisten: (() => void) | undefined;

    listenInstallOutput((message) => {
      setInstallOutput((prev) => [
        ...prev,
        `${new Date().toLocaleTimeString()}: ${message}`,
      ]);
    }).then((fn) => {
      unlisten = fn;
      listenerInitialized.current = true;
    });

    return () => {
      if (unlisten) {
        unlisten();
        listenerInitialized.current = false;
      }
    };
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [installOutput]);

  const loadEnvRequirements = async () => {
    try {
      setLoading(true);

      // 如果开启了 Git 模拟，使用模拟状态
      if (gitSimulation) {
        const mockGit: EnvTableItem = {
          name: "Git",
          installed: false,
          required: true,
          version: "2.45.0",
          selected: true,
        };
        setEnvItems([mockGit]);
      } else {
        // 否则从后端获取真实环境数据
        const requirements = await fetchEnvRequirements();
        const withSelection = requirements.map((item) => ({
          ...item,
          selected: item.required || item.installed,
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

  const handleRecheck = async () => {
    try {
      setRechecking(true);
      await loadEnvRequirements();
    } finally {
      setRechecking(false);
    }
  };

  const handleInstallGit = async () => {
    try {
      setInstalling(true);
      setInstallOutput([]); // 清空之前的输出

      const result = await installGitWithProgress();
      console.log("安装完成:", result);

      // 安装完成后重新检查环境
      await loadEnvRequirements();
    } catch (error) {
      console.error("安装失败:", error);
      setInstallOutput((prev) => [
        ...prev,
        `${new Date().toLocaleTimeString()}: 安装失败: ${error}`,
      ]);
    } finally {
      setInstalling(false);
    }
  };

  const isDirty = useMemo(() => {
    return envItems.some((item) => item.selected !== item.installed);
  }, [envItems]);

  const toggleSelected = (name: string) => {
    setEnvItems((prev) =>
      prev.map((item) => {
        if (item.name !== name) return item;
        if (item.required) return item;
        return { ...item, selected: !item.selected };
      })
    );
  };

  const applyConfirm = async () => {
    // 计算更改清单
    const changeMarks: string[] = [];
    envItems.forEach((item) => {
      if (item.selected !== item.installed) {
        changeMarks.push(`${item.selected ? "+" : "-"} ${item.name}`);
      }
    });

    const confirmText = changeMarks.length
      ? `将进行以下更改：\n${changeMarks.join("\n")}`
      : "没有可应用的更改。";

    if (changeMarks.length === 0) {
      await confirm({
        title: "提示",
        description: confirmText,
        confirmText: "确定",
      });
      return;
    }

    const ok = await confirm({
      title: "确认更改",
      description: confirmText,
      confirmText: "确认",
      cancelText: "取消",
    });
    if (!ok) return;

    setSaving(true);
    try {
      // 检查是否需要安装 Git
      const needInstallGit = envItems.some(
        (item) => item.name === "Git" && !item.installed && item.selected
      );

      if (needInstallGit) {
        // 调用 Git 安装
        await handleInstallGit();
      } else {
        // 更新安装状态
        const next = envItems.map((item) => ({
          ...item,
          installed: item.required ? item.installed : item.selected,
        }));
        setEnvItems(next);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">正在检查环境...</div>;
  }

  return (
    <>
      <div className="flex flex-col">
        {/* Git 模拟开关 */}
        <div className="flex items-center space-x-2 px-6 py-3 border-b bg-muted/30">
          <Switch
            id="git-simulation"
            checked={gitSimulation}
            onCheckedChange={setGitSimulation}
          />
          <Label htmlFor="git-simulation" className="text-sm">
            Git 模拟未安装 (用于测试)
          </Label>
        </div>

        <div className="border-b">
          <Table>
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
                  <TableCell>{item.name ? item.version || "-" : null}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between gap-2 px-6 py-3 bg-muted/20">
          <Button
            variant="outline"
            disabled={loading || rechecking || saving}
            onClick={handleRecheck}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${rechecking ? "animate-spin" : ""}`}
            />
            重新检测
          </Button>
          <Button
            disabled={!isDirty || saving || installing}
            onClick={applyConfirm}
          >
            {installing ? "安装中..." : "确认更改"}
          </Button>
        </div>

        {/* 安装输出显示区域 - 只在有输出时自动显示 */}
        {installOutput.length > 0 && (
          <div className="border-t bg-muted/10">
            <div className="px-6 py-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">安装输出</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInstallOutput([])}
                  className="text-xs"
                >
                  清除
                </Button>
              </div>
              <div
                ref={outputRef}
                style={{
                  WebkitUserSelect: "text",
                  userSelect: "text",
                }}
                className="bg-black dark:bg-gray-950 text-green-400 p-3 rounded-md font-mono text-xs max-h-48 overflow-y-auto"
              >
                {installOutput.map((line, index) => (
                  <div
                    key={index}
                    className="whitespace-pre-wrap"
                    style={{
                      userSelect: "inherit",
                    }}
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog />
    </>
  );
}
