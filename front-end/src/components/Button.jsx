const Button = ({ text }) => {
  return (
    <button
      className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition duration-300"
    >
      {text}
    </button>
  );
};

export default Button;