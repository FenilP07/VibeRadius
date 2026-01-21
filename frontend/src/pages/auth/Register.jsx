import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, Music, Check, X } from 'lucide-react';
import useAuthStore from '../../store/authStore.js'

const Register = () => {

  // For navigation
  const navigate = useNavigate();

  // Connect to Zustand store
  const { register, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: '',
      });
    }

    if (error) clearError();
  };

  // Password strength checker
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: 'Weak', color: 'bg-[#C93B3B]' };
    if (strength <= 3) return { strength, label: 'Fair', color: 'bg-[#D4920A]' };
    if (strength <= 4) return { strength, label: 'Good', color: 'bg-[#3B82C9]' };
    return { strength, label: 'Strong', color: 'bg-[#2D8A4E]' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const validate = () => {
    const errors = {};

    if (!formData.name) {
      errors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      errors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Call Zustand register action
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      // Navigate to dashboard (you'll need to add routing)
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#FEF3EB] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#E07A3D] rounded-full mb-4">
            <Music className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-[#5C4033] mb-2">Create Account</h1>
          <p className="text-gray-600">Join us and start your journey</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="space-y-6">
            {/* Error Alert - from Zustand */}
            {error && (
              <div className="bg-[#FDEEEE] border border-[#C93B3B] rounded-lg p-4 flex items-start">
                <div className="flex-1">
                  <p className="text-sm text-[#C93B3B] font-medium">Error</p>
                  <p className="text-sm text-[#C93B3B] mt-1">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={clearError}
                  className="text-[#C93B3B] hover:text-[#A02E2E] text-xl leading-none"
                >
                  ×
                </button>
              </div>
            )}

            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                disabled={isLoading}
                className={`w-full px-4 py-3 rounded-lg border ${validationErrors.name
                    ? 'border-[#C93B3B] bg-[#FDEEEE]'
                    : 'border-gray-300 bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-[#E07A3D] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed`}
              />
              {validationErrors.name && (
                <p className="text-sm text-[#C93B3B] mt-1">{validationErrors.name}</p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                disabled={isLoading}
                className={`w-full px-4 py-3 rounded-lg border ${validationErrors.email
                    ? 'border-[#C93B3B] bg-[#FDEEEE]'
                    : 'border-gray-300 bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-[#E07A3D] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed`}
              />
              {validationErrors.email && (
                <p className="text-sm text-[#C93B3B] mt-1">{validationErrors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  disabled={isLoading}
                  className={`w-full px-4 py-3 rounded-lg border ${validationErrors.password
                      ? 'border-[#C93B3B] bg-[#FDEEEE]'
                      : 'border-gray-300 bg-white'
                    } focus:outline-none focus:ring-2 focus:ring-[#E07A3D] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded ${level <= passwordStrength.strength
                            ? passwordStrength.color
                            : 'bg-gray-200'
                          }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${passwordStrength.color.replace('bg-', 'text-')}`}>
                    Password strength: {passwordStrength.label}
                  </p>
                </div>
              )}
              {validationErrors.password && (
                <p className="text-sm text-[#C93B3B] mt-1">{validationErrors.password}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                  className={`w-full px-4 py-3 rounded-lg border ${validationErrors.confirmPassword
                      ? 'border-[#C93B3B] bg-[#FDEEEE]'
                      : 'border-gray-300 bg-white'
                    } focus:outline-none focus:ring-2 focus:ring-[#E07A3D] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className="flex items-center gap-2 mt-1">
                  {formData.password === formData.confirmPassword ? (
                    <>
                      <Check className="w-4 h-4 text-[#2D8A4E]" />
                      <p className="text-xs text-[#2D8A4E]">Passwords match</p>
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 text-[#C93B3B]" />
                      <p className="text-xs text-[#C93B3B]">Passwords don't match</p>
                    </>
                  )}
                </div>
              )}
              {validationErrors.confirmPassword && (
                <p className="text-sm text-[#C93B3B] mt-1">{validationErrors.confirmPassword}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div>
              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-4 h-4 mt-0.5 text-[#E07A3D] border-gray-300 rounded focus:ring-[#E07A3D] disabled:opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => console.log('Terms clicked')}
                    className="text-[#E07A3D] hover:text-[#C4612A] font-medium"
                  >
                    Terms and Conditions
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={() => console.log('Privacy clicked')}
                    className="text-[#E07A3D] hover:text-[#C4612A] font-medium"
                  >
                    Privacy Policy
                  </button>
                </span>
              </label>
              {validationErrors.agreeToTerms && (
                <p className="text-sm text-[#C93B3B] mt-1">{validationErrors.agreeToTerms}</p>
              )}
            </div>

            {/* Register Button - uses Zustand isLoading */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-[#E07A3D] hover:bg-[#C4612A] text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-[#E07A3D] hover:text-[#C4612A] font-medium"
              >
                Login here
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2026 Vibe Radius Inc. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;