const Button = ({ text, type = "button", onClick, disabled, className = "" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed ${className}`}
    >
      {text}
    </button>
  );
};

export default Button;