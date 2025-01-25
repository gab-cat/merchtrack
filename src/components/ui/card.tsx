import * as React from "react";

// Card component: A container with a background, border, and shadow.
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={`bg-card text-card-foreground rounded-lg border shadow-sm ${className}`} {...props} />
));
Card.displayName = "Card"; // Sets the display name for debugging purposes.

// CardHeader component: A header section for the card, typically used for titles and descriptions.
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
  ),
);
CardHeader.displayName = "CardHeader"; // Sets the display name for debugging purposes.

// CardTitle component: A title for the card, typically used within the CardHeader.
const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={`text-heading-foreground text-2xl font-semibold leading-none tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  ),
);
CardTitle.displayName = "CardTitle"; // Sets the display name for debugging purposes.

// CardDescription component: A description for the card, typically used within the CardHeader.
const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => <p ref={ref} className={`text-muted-foreground text-sm ${className}`} {...props} />,
);
CardDescription.displayName = "CardDescription"; // Sets the display name for debugging purposes.

// CardContent component: The main content area of the card.
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={`p-6 pt-0 ${className}`} {...props} />,
);
CardContent.displayName = "CardContent"; // Sets the display name for debugging purposes.

// CardFooter component: A footer section for the card, typically used for actions or additional information.
const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={`flex items-center p-6 pt-0 ${className}`} {...props} />,
);
CardFooter.displayName = "CardFooter"; // Sets the display name for debugging purposes.

// Export all card-related components for use in other parts of the application.
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };