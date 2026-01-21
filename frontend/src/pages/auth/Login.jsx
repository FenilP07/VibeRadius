import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Music, AlertCircle, Headphones, ArrowRight } from 'lucide-react';
import useAuthStore from '../../store/authStore.js';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (validationErrors[name]) setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    if (error) clearError();
  };

  const validate = () => {
    const errors = {};
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format';
    if (!formData.password) errors.password = 'Password is required';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    const result = await login({ email: formData.email, password: formData.password });
    if (result.success) navigate('/');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-[#FEF3EB]">
      {/* Background Visuals */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#E07A3D]/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#5C4033]/10 rounded-full blur-[120px]" />
      </div>

      {/* Grainy Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} 
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-[#E07A3D] to-[#f4a261] rounded-3xl shadow-2xl shadow-[#E07A3D]/30 mb-6 rotate-3">
            <Music className="w-10 h-10 text-white" />
            <div className="absolute -top-2 -right-2 bg-white p-1.5 rounded-full shadow-md">
              <Headphones className="w-4 h-4 text-[#E07A3D]" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-[#5C4033] tracking-tighter">VibeRadius</h1>
          <p className="text-[#5C4033]/60 font-medium mt-2">Connect your space to the rhythm.</p>
        </div>

        {/* Glassmorphism Form */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(92,64,51,0.1)] p-10 border border-white/50 animate-in fade-in zoom-in-95 duration-500">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 text-red-600 animate-in slide-in-from-top-2">
                <AlertCircle size={18} />
                <p className="text-sm font-semibold">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-[#5C4033]/50 ml-1">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                disabled={isLoading}
                value={formData.email}
                onChange={handleChange}
                placeholder="host@venue.com"
                className={`w-full px-5 py-4 rounded-2xl bg-white/50 border ${validationErrors.email ? 'border-red-400' : 'border-white'} focus:border-[#E07A3D] focus:ring-4 focus:ring-[#E07A3D]/5 transition-all outline-none text-[#5C4033] font-medium shadow-inner disabled:opacity-50`}
              />
              {validationErrors.email && <p className="text-[10px] text-red-500 font-bold ml-2 uppercase tracking-tight">{validationErrors.email}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-[#5C4033]/50 ml-1">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  disabled={isLoading}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full px-5 py-4 rounded-2xl bg-white/50 border ${validationErrors.password ? 'border-red-400' : 'border-white'} focus:border-[#E07A3D] focus:ring-4 focus:ring-[#E07A3D]/5 transition-all outline-none text-[#5C4033] font-medium shadow-inner pr-14 disabled:opacity-50`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5C4033]/30 hover:text-[#E07A3D] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleChange} 
                  className="w-4 h-4 rounded-lg border-gray-300 text-[#E07A3D] focus:ring-[#E07A3D]" />
                <span className="text-sm text-[#5C4033]/60 group-hover:text-[#5C4033] transition-colors">Remember</span>
              </label>
              <button type="button" className="text-sm font-bold text-[#E07A3D] hover:text-[#C4612A]">Forgot?</button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full bg-[#E07A3D] hover:bg-[#C4612A] text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-[#E07A3D]/25 active:scale-[0.98] disabled:opacity-70"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Enter Dashboard <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button onClick={() => navigate('/register')} className="text-sm text-[#5C4033]/60">
              New venue? <span className="text-[#E07A3D] font-bold hover:underline">Register now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 