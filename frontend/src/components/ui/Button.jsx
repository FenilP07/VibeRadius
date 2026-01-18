// src/components/Button.jsx
// Follows styleguide

export default function Button({ 
  children, 
  variant = "primary", 
  onClick,
  className = "" 
}) {
  const base = "px-6 py-3 rounded-lg font-medium transition-colors"
  
  const variants = {
    primary: "bg-primary hover:bg-primary-dark text-white",
    outline: "border-2 border-primary text-primary hover:bg-primary-subtle",
    ghost: "text-primary hover:bg-primary-subtle",
    dark: "bg-accent-dark hover:bg-accent-charcoal text-white",
    spotify: "bg-[#1DB954] hover:bg-[#1AA34A] text-white",
  }

  return (
    <button 
      className={`${base} ${variants[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}