import { type FC } from "react";
import { Input } from "./ui/input";
import { open } from "@tauri-apps/plugin-dialog";
import { Button } from "./ui/button";
import { useControlled } from "@wwog/react";

export interface DirInputProps {
  onChange?: (e: string) => void;
  value?: string;
  placeholder?: string;
}

export const DirInput: FC<DirInputProps> = (props) => {
  const [value, setValue] = useControlled({
    defaultValue: "",
    props,
  });

  const handleClick = async () => {
    const result = await open({
      directory: true,
      multiple: false,
    });
    setValue(result as string);
  };
  return (
    <div className="flex gap-2 relative items-center">
      <Input readOnly value={value} placeholder={props.placeholder} className="pr-23" />
      <Button className="absolute right-0.5" size={"sm"} onClick={handleClick}>
        选择目录
      </Button>
    </div>
  );
};
