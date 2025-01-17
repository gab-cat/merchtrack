'use client';

import { forwardRef, useState } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'focus-visible:ring-ring inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'text-primary-foreground bg-primary shadow hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
        outline:
          'border-input bg-background hover:bg-accent hover:text-accent-foreground border shadow-sm',
        secondary:
          'text-secondary-foreground bg-secondary shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const [isClicked, setIsClicked] = useState(false); // Track whether the button is clicked
    const Comp = asChild ? Slot : 'button';

    // Handle button click to toggle the "clicked" state
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsClicked(!isClicked); // Toggle the clicked state
      if (props.onClick) {
        props.onClick(e); // Call the passed onClick function (if any)
      }
    };

    // Define the classes for the button background when clicked
    const outlineClickedClass = isClicked ? 'bg-blue-500' : ''; // Change to desired color when clicked

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          variant === 'outline' && outlineClickedClass // Apply the background color change when clicked
        )}
        ref={ref}
        {...props}
        onClick={handleClick} // Attach the click handler
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };