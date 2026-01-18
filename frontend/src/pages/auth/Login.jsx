import React, { useState } from 'react';
import { Eye, EyeOff, Music } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

    if (error) setError('');
  };

  const validate = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
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

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      console.log('Login submitted:', formData);
      // Replace with actual login logic: await useAuthStore.getState().login(formData)
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FEF3EB] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#E07A3D] rounded-full mb-4">
            <Music className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-[#5C4033] mb-2">Welcome Back</h1>
          <p className="text-gray-600">Login to your account to continue</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="bg-[#FDEEEE] border border-[#C93B3B] rounded-lg p-4 flex items-start">
                <div className="flex-1">
                  <p className="text-sm text-[#C93B3B] font-medium">Error</p>
                  <p className="text-sm text-[#C93B3B] mt-1">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setError('')}
                  className="text-[#C93B3B] hover:text-[#A02E2E] text-xl leading-none"
                >
                  ×
                </button>
              </div>
            )}

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
                className={`w-full px-4 py-3 rounded-lg border ${
                  validationErrors.email
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
                  placeholder="Enter your password"
                  disabled={isLoading}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    validationErrors.password
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
              {validationErrors.password && (
                <p className="text-sm text-[#C93B3B] mt-1">{validationErrors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-4 h-4 text-[#E07A3D] border-gray-300 rounded focus:ring-[#E07A3D] disabled:opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => console.log('Forgot password clicked')}
                className="text-sm text-[#E07A3D] hover:text-[#C4612A] font-medium"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
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
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => console.log('Navigate to register')}
                className="text-[#E07A3D] hover:text-[#C4612A] font-medium"
              >
                Register here
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2024 Café Music Request. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;