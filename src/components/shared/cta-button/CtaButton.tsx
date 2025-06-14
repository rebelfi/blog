'use client';

interface CtaButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
  target?: string;
  rel?: string;
}

export const CtaButton = ({
  href,
  onClick,
  children,
  variant = 'primary',
  className = '',
  target,
  rel,
}: CtaButtonProps) => {
  const baseClasses = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  const classes = `${baseClasses} ${className}`;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      if (target === '_blank') {
        window.open(href, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = href;
      }
    }
  };

  return (
    <button onClick={handleClick} className={classes} type="button">
      {children}
    </button>
  );
};
