import { toast } from 'sonner';

interface ToastProps {
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string,
}

export default function useToast ({ type, message, title }: ToastProps) {

  const color = (() => {
    switch (type) {
    case 'success':
      return 'green';
    case 'error':
      return 'red';
    case 'info':
      return 'blue';
    case 'warning':
      return 'orange';
    default:
      return 'black';
    }
  })();

  toast[type](title, {
    description: message,
    duration: 5000,
    style: {
      color,
    }
  });
}