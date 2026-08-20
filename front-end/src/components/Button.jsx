const Button = ({ text, type = "button", onClick, disabled, className = "" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-4 rounded-xl font-semibold shadow-sm transition duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed ${className}`}
    >
      {text}
    </button>
  );
};

export default Button;