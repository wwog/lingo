import type { FC, ReactNode } from "react";
import { Input } from "./ui/input";

interface DirInputProps {
  children?: ReactNode
}
export const DirInput: FC<DirInputProps> = (props) => {
  return <Input placeholder=""/>
}