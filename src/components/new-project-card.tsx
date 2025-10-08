import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  ChevronRight,
  ChevronLeft,
  Check,
  GripVertical,
  Star,
  X,
} from "lucide-react";
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { DirInput } from "./dir_input";
import { getDefaultFolder } from "@/lib/settings";
import { documentDir, join } from "@tauri-apps/api/path";
import { exists } from "@tauri-apps/plugin-fs";
import {
  COMMON_LANGUAGES,
  getLanguageFlagUrl,
  findLanguage,
} from "@/lib/languages";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";

type Props = {
  onCreate: (
    projectName: string,
    projectPath: string,
    defaultLanguage: string,
    supportLanguages: string[]
  ) => void;
  disabled?: boolean;
};

// 可排序的语言项组件
function SortableLanguageItem({
  langCode,
  isDefault,
  onRemove,
}: {
  langCode: string;
  isDefault: boolean;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: langCode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const lang = findLanguage(langCode);
  if (!lang) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 rounded-md border bg-card transition-all min-h-[40px] ${
        isDragging ? "opacity-50 shadow-lg" : ""
      } ${isDefault ? "border-primary bg-primary/5" : ""}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1 -m-1 rounded hover:bg-accent hover:shadow-md transition-all"
        title="拖动排序"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <img
        src={getLanguageFlagUrl(lang.flag)}
        alt={lang.name}
        className="w-6 h-4 object-cover rounded flex-shrink-0"
      />
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="text-sm truncate">{lang.nativeName}</span>
        {isDefault && (
          <span className="inline-flex items-center gap-1 text-xs text-primary whitespace-nowrap flex-shrink-0">
            <Star className="h-3 w-3 fill-current" />
            默认
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="flex-shrink-0 p-1 hover:bg-destructive/10 rounded transition-colors"
        title="移除"
      >
        <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
      </button>
    </div>
  );
}

export function NewProjectCard({ onCreate, disabled = false }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [projectName, setProjectName] = useState("");
  const [projectPath, setProjectPath] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([
    "zh-Hans",
    "en-US",
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [projectPathPreview, setProjectPathPreview] = useState("");
  const checkTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const prevProjectPathRef = useRef<string>("");

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8, // 移动8px后才激活拖拽，防止误触
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 初始化默认路径
  useEffect(() => {
    const initDefaultPath = async () => {
      const saved = getDefaultFolder();
      if (saved) {
        setProjectPath(saved);
      } else {
        try {
          const docDir = await documentDir();
          setProjectPath(docDir);
        } catch (error) {
          console.error("无法获取文档文件夹:", error);
        }
      }
    };

    if (open) {
      initDefaultPath();
    }
  }, [open]);

  // 更新项目路径预览和检查目录是否存在
  useLayoutEffect(() => {
    const updatePreviewAndCheck = async () => {
      if (projectPath && projectName) {
        try {
          const fullPath = await join(projectPath, projectName);

          // 只在路径真正改变时更新预览和重新检查
          const pathChanged = fullPath !== prevProjectPathRef.current;
          if (pathChanged) {
            prevProjectPathRef.current = fullPath;
            setProjectPathPreview(fullPath);

            // 清除之前的定时器
            if (checkTimeoutRef.current) {
              clearTimeout(checkTimeoutRef.current);
            }

            // 延迟500ms后检查目录是否存在
            checkTimeoutRef.current = setTimeout(async () => {
              try {
                const pathExists = await exists(fullPath);

                setErrors((prev) => {
                  const { projectPath: _removed, ...rest } = prev;
                  if (pathExists) {
                    return {
                      ...rest,
                      projectPath: "已存在该目录，无法创建",
                    };
                  }
                  return rest;
                });
              } catch (error) {
                console.error("检查路径失败:", error);
              }
            }, 400);
          }
        } catch (error) {
          console.error("无法生成路径:", error);
          if (prevProjectPathRef.current !== "") {
            prevProjectPathRef.current = "";
            setProjectPathPreview("");
          }
        }
      } else {
        if (prevProjectPathRef.current !== "") {
          prevProjectPathRef.current = "";
          setProjectPathPreview("");
        }
      }
    };

    updatePreviewAndCheck();

    // 清理函数
    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [projectPath, projectName]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // 清除定时器
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
      // 重置状态
      setStep(1);
      setProjectName("");
      setProjectPath("");
      setSelectedLanguages(["zh-Hans", "en-US"]);
      setErrors({});
      setProjectPathPreview("");
      prevProjectPathRef.current = "";
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!projectName.trim()) {
      newErrors.projectName = "项目名称不能为空";
    } else if (!/^[a-zA-Z0-9_\-\u4e00-\u9fa5]+$/.test(projectName)) {
      newErrors.projectName =
        "项目名称只能包含字母、数字、中文、下划线和连字符";
    }

    if (!projectPath.trim()) {
      newErrors.projectPath = "项目路径不能为空";
    }

    // 检查是否有现有的路径错误（如目录已存在）
    const hasExistingPathError = errors.projectPath && !newErrors.projectPath;

    // 合并错误
    const finalErrors = { ...newErrors };
    if (hasExistingPathError) {
      finalErrors.projectPath = errors.projectPath;
    }

    setErrors(finalErrors);

    // 返回是否有任何错误
    return Object.keys(finalErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (selectedLanguages.length === 0) {
      newErrors.selectedLanguages = "至少选择一种语言";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      setErrors({});
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, currentStep: number) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (currentStep === 1) {
        handleNext();
      } else if (currentStep === 2) {
        handleCreate();
      }
    }
  };

  const handleBack = () => {
    setStep(1);
    setErrors({});
  };

  const handleCreate = async () => {
    if (validateStep2()) {
      const defaultLanguage = selectedLanguages[0]; // 第一个为默认语言
      await onCreate(
        projectName,
        projectPath,
        defaultLanguage,
        selectedLanguages
      );
      handleOpenChange(false);
    }
  };

  const addLanguage = (langCode: string) => {
    if (!selectedLanguages.includes(langCode)) {
      setSelectedLanguages((prev) => [...prev, langCode]);
    }
  };

  const removeLanguage = (langCode: string) => {
    setSelectedLanguages((prev) => prev.filter((code) => code !== langCode));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSelectedLanguages((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          新建项目
        </CardTitle>
        <CardDescription>创建一个新的多语言项目</CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="w-full" disabled={disabled}>
              <Plus className="h-4 w-4 mr-2" />
              {disabled ? "创建中..." : "创建项目"}
            </Button>
          </DialogTrigger>
          <DialogContent className="w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>创建新项目</DialogTitle>
              <DialogDescription>
                {step === 1
                  ? "第 1 步：设置项目名称和保存位置"
                  : "第 2 步：配置项目语言"}
              </DialogDescription>
            </DialogHeader>

            {/* 步骤 1: 基本信息 */}
            {step === 1 && (
              <div className="space-y-4" onKeyDown={(e) => handleKeyDown(e, 1)}>
                <div className="space-y-2">
                  <Label htmlFor="project-name">项目名称 *</Label>
                  <Input
                    id="project-name"
                    placeholder="输入项目名称"
                    value={projectName}
                    autoFocus
                    onChange={(e) => {
                      setProjectName(e.target.value);
                      if (errors.projectName) {
                        setErrors((prev) => {
                          const { projectName, ...rest } = prev;
                          return rest;
                        });
                      }
                    }}
                    className={errors.projectName ? "border-red-500" : ""}
                  />
                  {errors.projectName && (
                    <p className="text-sm text-red-500">{errors.projectName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-path">项目路径 *</Label>
                  <DirInput
                    placeholder="选择项目保存位置"
                    value={projectPath}
                    onChange={(path) => {
                      setProjectPath(path);
                      if (errors.projectPath) {
                        setErrors((prev) => {
                          const { projectPath, ...rest } = prev;
                          return rest;
                        });
                      }
                    }}
                  />
                  {errors.projectPath && (
                    <p className="text-sm text-red-500">{errors.projectPath}</p>
                  )}
                  {projectPathPreview && !errors.projectPath && (
                    <p className="text-xs text-muted-foreground">
                      项目将创建在: ${projectPathPreview}`
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* 步骤 2: 语言配置 */}
            {step === 2 && (
              <div
                className="flex gap-4 overflow-hidden flex-1"
                onKeyDown={(e) => handleKeyDown(e, 2)}
              >
                {/* 左侧：语言选择区域 */}
                <div className="flex-1 flex flex-col space-y-2">
                  <Label>可用语言</Label>
                  <p className="text-xs text-muted-foreground">
                    点击添加语言到右侧列表
                  </p>
                  <div className="flex-1 overflow-y-auto p-2 border rounded-md space-y-1">
                    {COMMON_LANGUAGES.map((lang) => {
                      const isSelected = selectedLanguages.includes(lang.code);

                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => addLanguage(lang.code)}
                          disabled={isSelected}
                          className={`w-full flex items-center gap-2 p-2 rounded-md border transition-colors ${
                            isSelected
                              ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                              : "hover:bg-accent hover:border-accent-foreground/20"
                          }`}
                        >
                          <img
                            src={getLanguageFlagUrl(lang.flag)}
                            alt={lang.name}
                            className="w-6 h-4 object-cover rounded"
                          />
                          <span className="text-sm flex-1 text-left">
                            {lang.nativeName}
                          </span>
                          {isSelected && <Check className="h-4 w-4" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 右侧：已选语言列表 */}
                <div className="flex-1 flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>已选语言 ({selectedLanguages.length})</Label>
                    {errors.selectedLanguages && (
                      <p className="text-sm text-red-500">
                        {errors.selectedLanguages}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    拖动排序，第一位为默认语言
                  </p>
                  <div className="flex-1 overflow-y-auto p-2 border rounded-md">
                    {selectedLanguages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                        还未选择语言
                      </div>
                    ) : (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                        modifiers={[
                          restrictToVerticalAxis,
                          restrictToParentElement,
                        ]}
                      >
                        <SortableContext
                          items={selectedLanguages}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-1">
                            {selectedLanguages.map((langCode, index) => (
                              <SortableLanguageItem
                                key={langCode}
                                langCode={langCode}
                                isDefault={index === 0}
                                onRemove={() => removeLanguage(langCode)}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    )}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                取消
              </Button>
              {step === 2 && (
                <Button variant="outline" onClick={handleBack}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  上一步
                </Button>
              )}
              {step === 1 ? (
                <Button onClick={handleNext}>
                  下一步
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleCreate} disabled={disabled}>
                  <Check className="h-4 w-4 mr-1" />
                  {disabled ? "创建中..." : "创建项目"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
