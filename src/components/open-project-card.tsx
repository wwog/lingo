import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FolderOpen } from "lucide-react";

type Props = {
  onOpenProject: () => void;
};

export function OpenProjectCard({ onOpenProject }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          打开现有项目
        </CardTitle>
        <CardDescription>浏览并打开本地的项目文件夹</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" className="w-full" onClick={onOpenProject}>
          <FolderOpen className="h-4 w-4 mr-2" />
          浏览文件夹
        </Button>
      </CardContent>
    </Card>
  );
}