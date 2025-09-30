import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatLastOpened } from "@/lib/time";
import { Clock, Folder } from "lucide-react";

type Props = {
  onOpenProject: () => void;
};

export function RecentProjectsCard({ onOpenProject }: Props) {
  const recentProjects = [
    {
      name: "项目1",
      path: "/Users/snto_web_1/dev/lingo/src/windows/index",
      lastOpened: new Date(),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-4 w-4" />
          最近项目
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentProjects.length > 0 ? (
          <>
            {recentProjects.map((project) => (
              <div
                key={`${project.path}+${project.name}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                onClick={() => onOpenProject()}
              >
                <div className="flex-shrink-0">
                  <Folder className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{project.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {project.path}
                  </p>
                </div>
                <div className="flex-shrink-0 text-xs text-muted-foreground">
                  {formatLastOpened(project.lastOpened)}
                </div>
              </div>
            ))}
            {recentProjects.length > 4 && (
              <>
                <Separator className="my-3" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground"
                >
                  查看更多...
                </Button>
              </>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <div className="flex justify-center mb-3">
              <Folder className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              还没有最近打开的项目
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
