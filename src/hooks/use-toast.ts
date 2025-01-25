import { toast } from 'sonner';

interface ToastProps {
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string,
    duration?: number
}

/**
 * Custom hook for displaying toast notifications with specified type, message, title and duration
 * @param {Object} props - The toast notification properties
 * @param {('success'|'error'|'warning'|'info')} props.type - The type of toast notification
 * @param {string} props.message - The message to display in the toast
 * @param {string} props.title - The title of the toast notification
 * @param {number} [props.duration=5] - The duration in seconds for which the toast will be displayed
 * @returns {void}
 */
export default function useToast ({ type, message, title, duration = 5 }: ToastProps): void {

  const colorMap = {
    success: 'green',
    error: 'red',
    warning: 'orange',
    info: 'blue',
  };
  const color = colorMap[type] ?? 'black';

  toast[type](title, {
    description: message,
    duration: duration * 1000,
    style: {
      color,
    },
    className: 'text-base font-bold',
    descriptionClassName: 'text-xs text-neutral-7 font-inter',
  });
}