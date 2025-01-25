import { toast } from 'sonner';

interface ToastProps {
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string,
    duration?: number
}

export default function useToast ({ type, message, title, duration = 5000 }: ToastProps) {

  const colorMap = {
    success: 'green',
    error: 'red',
    warning: 'orange',
    info: 'blue',
  };
  const color = colorMap[type] ?? 'black';

  toast[type](title, {
    description: message,
    duration: duration,
    style: {
      color,
    }
  });
}