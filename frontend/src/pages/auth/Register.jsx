import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, Music, Check, X, AlertCircle, Headphones, ShieldCheck } from 'lucide-react';
import useAuthStore from '../../store/authStore.js';

const Register = () => {
  const navigate = useNavigate();
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
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (error) clearError();
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: 'bg-gray-200' };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: 'Weak', color: 'bg-red-500', text: 'text-red-500' };
    if (strength <= 3) return { strength, label: 'Fair', color: 'bg-orange-400', text: 'text-orange-400' };
    if (strength <= 4) return { strength, label: 'Good', color: 'bg-blue-400', text: 'text-blue-400' };
    return { strength, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-500' };
  };

  const strength = getPasswordStrength(formData.password);

  const validate = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email';
    if (formData.password.length < 8) errors.password = 'Min. 8 characters required';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (!formData.agreeToTerms) errors.agreeToTerms = 'Agreement required';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });
    if (result.success) navigate('/');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-[#FEF3EB]">
      
      {/* ================= BACKGROUND VISUALS ================= */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#E07A3D]/15 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#5C4033]/10 rounded-full blur-[120px]" />
      </div>

      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} 
      />

      {/* ================= MAIN CONTENT ================= */}
      <div className="relative z-10 w-full max-w-lg">
        
        {/* Branding */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-[#E07A3D] to-[#f4a261] rounded-2xl shadow-xl mb-4 -rotate-2">
            <Music className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-[#5C4033] tracking-tighter">Join VibeRadius</h1>
          <p className="text-[#5C4033]/60 font-medium text-sm">Create an account to start hosting live sessions.</p>
        </div>

        {/* Glassmorphism Card */}
        <div className="bg-white/75 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(92,64,51,0.08)] p-8 md:p-10 border border-white/50 animate-in fade-in zoom-in-95 duration-500">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 text-red-600 animate-in slide-in-from-top-2">
                <AlertCircle size={18} />
                <p className="text-sm font-semibold">{error}</p>
                <button onClick={clearError} className="ml-auto text-lg leading-none">×</button>
              </div>
            )}

            {/* Name & Email Group */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#5C4033]/50 ml-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`w-full px-4 py-3.5 rounded-xl bg-white/50 border ${validationErrors.name ? 'border-red-400' : 'border-white'} focus:border-[#E07A3D] transition-all outline-none text-sm shadow-inner`}
                />
                {validationErrors.name && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase">{validationErrors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#5C4033]/50 ml-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="host@cafe.com"
                  className={`w-full px-4 py-3.5 rounded-xl bg-white/50 border ${validationErrors.email ? 'border-red-400' : 'border-white'} focus:border-[#E07A3D] transition-all outline-none text-sm shadow-inner`}
                />
                {validationErrors.email && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase">{validationErrors.email}</p>}
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#5C4033]/50 ml-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  className={`w-full px-4 py-3.5 rounded-xl bg-white/50 border ${validationErrors.password ? 'border-red-400' : 'border-white'} focus:border-[#E07A3D] transition-all outline-none text-sm pr-12 shadow-inner`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Enhanced Strength Indicator */}
              {formData.password && (
                <div className="px-1 pt-1">
                  <div className="flex gap-1.5 mb-1.5">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <div key={lvl} className={`h-1 flex-1 rounded-full transition-all duration-500 ${lvl <= strength.strength ? strength.color : 'bg-gray-200/50'}`} />
                    ))}
                  </div>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${strength.text}`}>
                    Strength: {strength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#5C4033]/50 ml-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Verify password"
                  className={`w-full px-4 py-3.5 rounded-xl bg-white/50 border ${validationErrors.confirmPassword ? 'border-red-400' : 'border-white'} focus:border-[#E07A3D] transition-all outline-none text-sm pr-12 shadow-inner`}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formData.confirmPassword && (
                <div className="flex items-center gap-1.5 mt-1 ml-1">
                  {formData.password === formData.confirmPassword ? 
                    <><Check size={12} className="text-emerald-500" /> <span className="text-[10px] text-emerald-500 font-bold uppercase">Match</span></> : 
                    <><X size={12} className="text-red-500" /> <span className="text-[10px] text-red-500 font-bold uppercase">No Match</span></>
                  }
                </div>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    name="agreeToTerms" 
                    checked={formData.agreeToTerms} 
                    onChange={handleChange} 
                    className="peer hidden"
                  />
                  <div className="w-5 h-5 border-2 border-[#5C4033]/20 rounded-lg peer-checked:bg-[#E07A3D] peer-checked:border-[#E07A3D] transition-all flex items-center justify-center">
                    <Check size={12} className="text-white opacity-0 peer-checked:opacity-100" />
                  </div>
                </div>
                <span className="text-xs text-[#5C4033]/60 leading-tight">
                  I accept the <button type="button" className="text-[#E07A3D] font-bold hover:underline">Terms</button> & <button type="button" className="text-[#E07A3D] font-bold hover:underline">Privacy Policy</button>
                </span>
              </label>
              {validationErrors.agreeToTerms && <p className="text-[10px] text-red-500 font-bold mt-2 ml-1 uppercase">{validationErrors.agreeToTerms}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#E07A3D] hover:bg-[#C4612A] text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-[#E07A3D]/25 active:scale-[0.98] disabled:opacity-70 mt-4 overflow-hidden relative group"
            >
              {isLoading ? (
                 <div className="flex items-center justify-center gap-2">
                   <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                   <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                   <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
                 </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Create Account <ShieldCheck size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-[#5C4033]/5">
            <button onClick={() => navigate('/login')} className="text-sm text-[#5C4033]/60">
              Already have an account? <span className="text-[#E07A3D] font-bold hover:underline">Log in</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;