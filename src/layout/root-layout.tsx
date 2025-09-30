import type { FC, ReactNode } from "react";
import "./global.css";
import { ThemeProvider } from "@/components/theme-provider";

interface RootLayoutProps {
  children?: ReactNode;
}
export const RootLayout: FC<RootLayoutProps> = (props) => {
  return (
    <div className="w-full h-full">
      <ThemeProvider>{props.children}</ThemeProvider>
    </div>
  );
};
