import { IoMdAlert } from "react-icons/io";
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

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  content: {
    title: string;
    description: string;
    action: string;
  };
  variant?: 'destructive' | 'primary';
}

export function ConfirmationDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  content,
  variant = 'destructive' 
}: Readonly<ConfirmationDialogProps>) {
  const buttonClass = variant === 'destructive' ? 'bg-accent-destructive' : 'bg-primary';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center">
            <IoMdAlert className={`mr-2 ${variant === 'destructive' ? 'text-accent-destructive' : 'text-primary'}`} />
            {content.title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {content.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            className={`${buttonClass} text-white`} 
            onClick={onConfirm}
          >
            {content.action}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
