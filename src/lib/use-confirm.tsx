import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmOptions {
  title?: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmState {
  isOpen: boolean;
  options: ConfirmOptions;
  resolve?: (value: boolean) => void;
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({
    isOpen: false,
    options: { description: "" },
  });

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        options,
        resolve,
      });
    });
  };

  const handleConfirm = () => {
    state.resolve?.(true);
    setState({ ...state, isOpen: false });
  };

  const handleCancel = () => {
    state.resolve?.(false);
    setState({ ...state, isOpen: false });
  };

  const ConfirmDialog = () => (
    <AlertDialog open={state.isOpen} onOpenChange={handleCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {state.options.title || "确认操作"}
          </AlertDialogTitle>
          <AlertDialogDescription style={{ whiteSpace: "pre-line" }}>
            {state.options.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            {state.options.cancelText || "取消"}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            {state.options.confirmText || "确认"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { confirm, ConfirmDialog };
}
