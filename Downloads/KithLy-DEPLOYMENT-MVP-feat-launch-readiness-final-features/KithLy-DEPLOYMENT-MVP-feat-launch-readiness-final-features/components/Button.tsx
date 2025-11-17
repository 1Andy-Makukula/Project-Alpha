import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className = '', ...props }) => {
  const baseClasses = 'px-6 py-3 font-semibold rounded-xl text-sm transition-all duration-300 transform focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed';

  const primaryClasses = 'text-white gradient-bg hover:shadow-lg hover:-translate-y-0.5 focus:ring-orange-300 disabled:hover:shadow-none disabled:hover:translate-y-0';
  
  const secondaryClasses = 'gradient-border-button hover:shadow-lg hover:-translate-y-0.5 focus:ring-orange-300 disabled:hover:shadow-none disabled:hover:translate-y-0';

  const dangerClasses = 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-300 hover:shadow-lg hover:-translate-y-0.5 disabled:hover:bg-red-600 disabled:hover:shadow-none disabled:hover:translate-y-0';

  let variantClasses;
  switch (variant) {
    case 'primary':
      variantClasses = primaryClasses;
      break;
    case 'secondary':
      variantClasses = secondaryClasses;
      break;
    case 'danger':
      variantClasses = dangerClasses;
      break;
    default:
        variantClasses = primaryClasses;
  }
  
  return (
    <button className={`${baseClasses} ${variantClasses} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
