const Button = ({ text, type = "button", onClick, disabled, className = "" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3.5 px-4 rounded-2xl font-bold shadow-lg shadow-blue-600/10 hover:shadow-xl hover:shadow-blue-600/20 active:scale-[0.98] transition duration-200 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none ${className}`}
    >
      {text}
    </button>
  );
};

export default Button;