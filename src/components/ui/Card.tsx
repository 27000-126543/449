import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className, hoverable = false, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-700/50 overflow-hidden',
        hoverable && 'cursor-pointer hover:bg-gray-700/80 hover:border-gray-600 transition-all duration-200',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

Card.Header = function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('px-4 py-3 border-b border-gray-700/50', className)}>
      {children}
    </div>
  );
};

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

Card.Body = function CardBody({ children, className }: CardBodyProps) {
  return <div className={cn('p-4', className)}>{children}</div>;
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

Card.Footer = function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('px-4 py-3 border-t border-gray-700/50 bg-gray-900/30', className)}>
      {children}
    </div>
  );
};
