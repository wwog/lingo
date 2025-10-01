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
import { Plus } from "lucide-react";
import { useState } from "react";
import { DirInput } from "./dir_input";

type Props = {
  onCreate: (projectName: string, projectPath: string) => void;
};

export function NewProjectCard({
  onCreate,
}: Props) {
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectPath, setProjectPath] = useState("");
  
  const handleOpenChange = (open: boolean) => {
    setOpen(open);
  };
  
  const handleCreate = () => {
    onCreate(projectName, projectPath);
    setOpen(false);
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
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              创建项目
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>创建新项目</DialogTitle>
              <DialogDescription>设置您的新多语言项目的基本信息</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">项目名称</Label>
                <Input
                  id="project-name"
                  placeholder="输入项目名称"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-path">项目路径</Label>
                {/* <Input
                  id="project-path"
                  placeholder="选择项目保存位置"
                  value={projectPath}
                  onChange={(e) => setProjectPath(e.target.value)}
                /> */}
                <DirInput 
                  placeholder="选择项目保存位置"
                  value={projectPath}
                  onChange={(e) => setProjectPath(e)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                取消
              </Button>
              <Button onClick={handleCreate}>创建</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}