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
import { GitBranch } from "lucide-react";
import { useState } from "react";

type Props = {
  onClone: (repoUrl: string, clonePath: string) => void;
};

export function CloneRepoCard({ onClone }: Props) {
  const [open, setOpen] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const [clonePath, setClonePath] = useState("");

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
  };

  const handleClone = () => {
    onClone(repoUrl, clonePath);
    setOpen(false);
  };
  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          从Git仓库克隆
        </CardTitle>
        <CardDescription>从远程Git仓库克隆现有项目</CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <GitBranch className="h-4 w-4 mr-2" />
              克隆仓库
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>克隆Git仓库</DialogTitle>
              <DialogDescription>输入Git仓库URL来克隆项目</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="repo-url">仓库URL</Label>
                <Input
                  id="repo-url"
                  placeholder="https://github.com/user/repo.git"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clone-path">本地路径</Label>
                <Input
                  id="clone-path"
                  placeholder="选择克隆到的本地位置"
                  value={clonePath}
                  onChange={(e) => setClonePath(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                取消
              </Button>
              <Button onClick={handleClone}>克隆</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
