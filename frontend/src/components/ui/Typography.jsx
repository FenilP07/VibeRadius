import React from 'react';

const Typography = ({
    variant = 'body',
    weight = 'normal',
    size,
    color,
    className = '',
    children,
    ...props
}) => {
    // Base styles for all typography
    const baseStyles = 'font-roboto';

    // Variant styles
    const variantStyles = {
        h1: 'text-5xl font-bold leading-tight',
        h2: 'text-4xl font-bold leading-tight',
        h3: 'text-3xl font-semibold leading-snug',
        h4: 'text-2xl font-semibold leading-snug',
        h5: 'text-xl font-medium leading-normal',
        h6: 'text-lg font-medium leading-normal',
        body: 'text-base leading-relaxed',
        bodySecondary: 'text-sm leading-relaxed',
        bodyMuted: 'text-sm leading-relaxed text-gray-500',
        small: 'text-xs leading-normal',
        large: 'text-lg leading-relaxed',
    };

    // Weight styles
    const weightStyles = {
        light: 'font-light',
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
    };

    // Size styles (optional override)
    const sizeStyles = {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl',
        '3xl': 'text-3xl',
        '4xl': 'text-4xl',
        '5xl': 'text-5xl',
    };

    // Color styles
    const colorStyles = {
        primary: 'text-[#E07A3D]',
        accent: 'text-[#5C4033]',
        success: 'text-[#2D8A4E]',
        error: 'text-[#C93B3B]',
        warning: 'text-[#D4920A]',
        info: 'text-[#3B82C9]',
        muted: 'text-gray-500',
        dark: 'text-gray-900',
        light: 'text-gray-600',
        white: 'text-white',
    };

    // Determine HTML element based on variant
    const getElement = () => {
        if (variant.startsWith('h')) return variant;
        return 'p';
    };

    // Build className
    const classes = [
        baseStyles,
        variantStyles[variant] || variantStyles.body,
        size ? sizeStyles[size] : '',
        weight && !variant.startsWith('h') ? weightStyles[weight] : '',
        color ? colorStyles[color] : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    const Element = getElement();

    return (
        <Element className={classes} {...props}>
            {children}
        </Element>
    );
};

// Demo Component
const TypographyDemo = () => {
    return (
        <div className="min-h-screen bg-[#FEF3EB] p-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Headings Section */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <Typography variant="h3" className="mb-4 text-[#5C4033]">
                        Headings
                    </Typography>
                    <div className="space-y-3">
                        <Typography variant="h1">Heading 1 - Main Title</Typography>
                        <Typography variant="h2">Heading 2 - Section Title</Typography>
                        <Typography variant="h3">Heading 3 - Subsection</Typography>
                        <Typography variant="h4">Heading 4 - Component Title</Typography>
                        <Typography variant="h5">Heading 5 - Small Section</Typography>
                        <Typography variant="h6">Heading 6 - Smallest Heading</Typography>
                    </div>
                </div>

                {/* Body Text Section */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <Typography variant="h3" className="mb-4 text-[#5C4033]">
                        Body Text
                    </Typography>
                    <div className="space-y-3">
                        <Typography variant="body">
                            Body text primary - Use this for main content and important information.
                        </Typography>
                        <Typography variant="bodySecondary">
                            Body text secondary - Use this for supporting content and descriptions.
                        </Typography>
                        <Typography variant="bodyMuted">
                            Body text muted - Use this for timestamps, hints, and less important info.
                        </Typography>
                    </div>
                </div>

                {/* Sizes Section */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <Typography variant="h3" className="mb-4 text-[#5C4033]">
                        Text Sizes
                    </Typography>
                    <div className="space-y-3">
                        <Typography variant="small">Small text - Perfect for captions and metadata</Typography>
                        <Typography variant="body">Base text - Default body text size</Typography>
                        <Typography variant="large">Large text - Emphasized content</Typography>
                    </div>
                </div>

                {/* Weights Section */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <Typography variant="h3" className="mb-4 text-[#5C4033]">
                        Font Weights
                    </Typography>
                    <div className="space-y-3">
                        <Typography variant="body" weight="light">Light weight text</Typography>
                        <Typography variant="body" weight="normal">Normal weight text</Typography>
                        <Typography variant="body" weight="medium">Medium weight text</Typography>
                        <Typography variant="body" weight="semibold">Semibold weight text</Typography>
                        <Typography variant="body" weight="bold">Bold weight text</Typography>
                    </div>
                </div>

                {/* Colors Section */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <Typography variant="h3" className="mb-4 text-[#5C4033]">
                        Text Colors
                    </Typography>
                    <div className="space-y-3">
                        <Typography variant="body" color="primary">Primary color - For main brand elements</Typography>
                        <Typography variant="body" color="accent">Accent color - For secondary emphasis</Typography>
                        <Typography variant="body" color="success">Success color - For positive actions</Typography>
                        <Typography variant="body" color="error">Error color - For warnings and errors</Typography>
                        <Typography variant="body" color="warning">Warning color - For caution messages</Typography>
                        <Typography variant="body" color="info">Info color - For informational messages</Typography>
                        <Typography variant="body" color="muted">Muted color - For subtle text</Typography>
                        <Typography variant="body" color="dark">Dark color - For high contrast</Typography>
                        <Typography variant="body" color="light">Light color - For soft emphasis</Typography>
                    </div>
                </div>

                {/* Combined Examples */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <Typography variant="h3" className="mb-4 text-[#5C4033]">
                        Combined Examples
                    </Typography>
                    <div className="space-y-4">
                        <div>
                            <Typography variant="h4" color="primary" className="mb-2">
                                Login to Your Account
                            </Typography>
                            <Typography variant="bodySecondary" color="muted">
                                Enter your credentials to access your dashboard
                            </Typography>
                        </div>

                        <div className="bg-[#E8F5ED] p-4 rounded">
                            <Typography variant="body" weight="semibold" color="success" className="mb-1">
                                Success!
                            </Typography>
                            <Typography variant="bodySecondary" color="success">
                                Your account has been created successfully
                            </Typography>
                        </div>

                        <div className="bg-[#FDEEEE] p-4 rounded">
                            <Typography variant="body" weight="semibold" color="error" className="mb-1">
                                Error
                            </Typography>
                            <Typography variant="bodySecondary" color="error">
                                Invalid email or password. Please try again.
                            </Typography>
                        </div>
                    </div>
                </div>

                {/* Usage Example */}
                <div className="bg-[#3D332D] text-white rounded-lg p-6">
                    <Typography variant="h3" className="mb-4 text-white">
                        Usage Examples
                    </Typography>
                    <div className="bg-[#2A2320] p-4 rounded font-mono text-sm overflow-x-auto">
                        <pre className="text-green-400">{`// Basic usage
<Typography variant="h1">Page Title</Typography>
<Typography variant="body">Regular text</Typography>

// With custom weight
<Typography variant="body" weight="bold">
  Bold text
</Typography>

// With color
<Typography variant="body" color="error">
  Error message
</Typography>

// Combined
<Typography 
  variant="h2" 
  color="primary" 
  className="mb-4"
>
  Custom Heading
</Typography>`}</pre>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TypographyDemo;