import React, { useState } from 'react';
import { Eye, EyeOff, Search } from 'lucide-react';

const Input = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    onBlur,
    onFocus,
    placeholder,
    error,
    disabled = false,
    required = false,
    helperText,
    icon,
    showPasswordToggle = false,
    className = '',
    inputClassName = '',
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Determine actual input type
    const inputType = type === 'password' && showPassword ? 'text' : type;

    // Base styles
    const baseStyles = 'w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2';

    // State styles
    const stateStyles = error
        ? 'border-[#C93B3B] bg-[#FFF5F5] text-[#C93B3B] focus:ring-[#C93B3B] focus:border-[#C93B3B]'
        : isFocused
            ? 'border-[#E07A3D] bg-white focus:ring-[#E07A3D] focus:border-[#E07A3D]'
            : 'border-gray-300 bg-white hover:border-gray-400 focus:ring-[#E07A3D] focus:border-[#E07A3D]';

    // Disabled styles
    const disabledStyles = disabled
        ? 'bg-gray-100 text-gray-500 cursor-not-allowed opacity-60'
        : '';

    // Icon padding
    const iconPadding = icon || type === 'search' ? 'pl-10' : '';
    const rightIconPadding = type === 'password' && showPasswordToggle ? 'pr-10' : '';

    // Combine input classes
    const inputClasses = [
        baseStyles,
        stateStyles,
        disabledStyles,
        iconPadding,
        rightIconPadding,
        inputClassName,
    ]
        .filter(Boolean)
        .join(' ');

    const handleFocus = (e) => {
        setIsFocused(true);
        if (onFocus) onFocus(e);
    };

    const handleBlur = (e) => {
        setIsFocused(false);
        if (onBlur) onBlur(e);
    };

    return (
        <div className={`w-full ${className}`}>
            {/* Label */}
            {label && (
                <label
                    htmlFor={name}
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                    {label}
                    {required && <span className="text-[#C93B3B] ml-1">*</span>}
                </label>
            )}

            {/* Input Container */}
            <div className="relative">
                {/* Left Icon */}
                {(icon || type === 'search') && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {type === 'search' ? (
                            <Search size={18} />
                        ) : (
                            icon
                        )}
                    </div>
                )}

                {/* Input Field */}
                <input
                    id={name}
                    name={name}
                    type={inputType}
                    value={value}
                    onChange={onChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    className={inputClasses}
                    {...props}
                />

                {/* Password Toggle */}
                {type === 'password' && showPasswordToggle && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>

            {/* Helper Text or Error */}
            {(helperText || error) && (
                <p
                    className={`mt-1.5 text-sm ${error ? 'text-[#C93B3B]' : 'text-gray-500'
                        }`}
                >
                    {error || helperText}
                </p>
            )}
        </div>
    );
};

// Textarea Component
const Textarea = ({
    label,
    name,
    value,
    onChange,
    onBlur,
    onFocus,
    placeholder,
    error,
    disabled = false,
    required = false,
    helperText,
    rows = 4,
    className = '',
    textareaClassName = '',
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const baseStyles = 'w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 resize-none';

    const stateStyles = error
        ? 'border-[#C93B3B] bg-[#FFF5F5] text-[#C93B3B] focus:ring-[#C93B3B] focus:border-[#C93B3B]'
        : isFocused
            ? 'border-[#E07A3D] bg-white focus:ring-[#E07A3D] focus:border-[#E07A3D]'
            : 'border-gray-300 bg-white hover:border-gray-400 focus:ring-[#E07A3D] focus:border-[#E07A3D]';

    const disabledStyles = disabled
        ? 'bg-gray-100 text-gray-500 cursor-not-allowed opacity-60'
        : '';

    const textareaClasses = [
        baseStyles,
        stateStyles,
        disabledStyles,
        textareaClassName,
    ]
        .filter(Boolean)
        .join(' ');

    const handleFocus = (e) => {
        setIsFocused(true);
        if (onFocus) onFocus(e);
    };

    const handleBlur = (e) => {
        setIsFocused(false);
        if (onBlur) onBlur(e);
    };

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label
                    htmlFor={name}
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                    {label}
                    {required && <span className="text-[#C93B3B] ml-1">*</span>}
                </label>
            )}

            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                rows={rows}
                className={textareaClasses}
                {...props}
            />

            {(helperText || error) && (
                <p
                    className={`mt-1.5 text-sm ${error ? 'text-[#C93B3B]' : 'text-gray-500'
                        }`}
                >
                    {error || helperText}
                </p>
            )}
        </div>
    );
};

// Demo Component
const InputDemo = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        search: '',
        username: '',
        message: '',
        requiredField: '',
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleValidation = () => {
        const newErrors = {};
        if (!formData.requiredField) {
            newErrors.requiredField = 'This field is required';
        }
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        setErrors(newErrors);
    };

    return (
        <div className="min-h-screen bg-[#FEF3EB] p-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Basic Inputs */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="text-2xl font-bold mb-4 text-[#5C4033]">Default Inputs</h2>
                    <div className="space-y-4">
                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                        />
                        <Input
                            label="Username"
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Choose a username"
                            helperText="Username must be unique"
                        />
                        <Input
                            label="Disabled Input"
                            type="text"
                            value="This input is disabled"
                            disabled
                        />
                    </div>
                </div>

                {/* Search Input */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="text-2xl font-bold mb-4 text-[#5C4033]">Search Input</h2>
                    <Input
                        type="search"
                        name="search"
                        value={formData.search}
                        onChange={handleChange}
                        placeholder="Search songs..."
                    />
                </div>

                {/* Password Input */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="text-2xl font-bold mb-4 text-[#5C4033]">Password Input</h2>
                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        showPasswordToggle
                        helperText="Password must be at least 8 characters"
                    />
                </div>

                {/* Input with Error */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="text-2xl font-bold mb-4 text-[#5C4033]">Input with Error</h2>
                    <div className="space-y-4">
                        <Input
                            label="Required Field"
                            type="text"
                            name="requiredField"
                            value={formData.requiredField}
                            onChange={handleChange}
                            placeholder="This field is required"
                            error={errors.requiredField}
                            required
                        />
                        <button
                            onClick={handleValidation}
                            className="px-4 py-2 bg-[#E07A3D] text-white rounded-lg hover:bg-[#C4612A]"
                        >
                            Validate
                        </button>
                    </div>
                </div>

                {/* Textarea */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="text-2xl font-bold mb-4 text-[#5C4033]">Textarea</h2>
                    <Textarea
                        label="Message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Add a note..."
                        rows={5}
                        helperText="Maximum 500 characters"
                    />
                </div>

                {/* Login Form Example */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="text-2xl font-bold mb-4 text-[#5C4033]">Login Form Example</h2>
                    <div className="max-w-md space-y-4">
                        <Input
                            label="Email"
                            type="email"
                            placeholder="Enter your email"
                            error={errors.email}
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="Enter your password"
                            showPasswordToggle
                        />
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="remember" className="w-4 h-4" />
                            <label htmlFor="remember" className="text-sm text-gray-700">
                                Remember me
                            </label>
                        </div>
                        <button className="w-full px-4 py-2.5 bg-[#E07A3D] text-white rounded-lg hover:bg-[#C4612A] font-medium">
                            Sign In
                        </button>
                    </div>
                </div>

                {/* Dark Mode Preview */}
                <div className="bg-[#1A1512] rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4 text-white">Dark Mode Preview</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                Search songs...
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Search size={18} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search songs..."
                                    className="w-full pl-10 px-4 py-2.5 rounded-lg border border-gray-600 bg-[#2A2320] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E07A3D] focus:border-[#E07A3D]"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Usage Code */}
                <div className="bg-[#3D2B1F] text-white rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">Usage Examples</h2>
                    <div className="bg-[#2A2320] p-4 rounded font-mono text-sm overflow-x-auto">
                        <pre className="text-green-400">{`// Basic input
<Input
  label="Email"
  type="email"
  name="email"
  value={email}
  onChange={handleChange}
  placeholder="Enter your email"
/>

// Search input
<Input
  type="search"
  placeholder="Search..."
  value={search}
  onChange={handleChange}
/>

// Password with toggle
<Input
  label="Password"
  type="password"
  name="password"
  value={password}
  onChange={handleChange}
  showPasswordToggle
/>

// Input with error
<Input
  label="Username"
  name="username"
  value={username}
  onChange={handleChange}
  error="Username is required"
  required
/>

// Textarea
<Textarea
  label="Message"
  name="message"
  value={message}
  onChange={handleChange}
  placeholder="Enter message"
  rows={5}
/>

// With helper text
<Input
  label="Email"
  type="email"
  helperText="We'll never share your email"
/>`}</pre>
                    </div>
                </div>

            </div>
        </div>
    );
};

// Export both Input and Textarea
export { Input, Textarea };
export default InputDemo;