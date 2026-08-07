const Button = ({ text, type = "button" }) => {
  return (
    <button
      type={type}
      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300"
    >
      {text}
    </button>
  );
};

export default Button;