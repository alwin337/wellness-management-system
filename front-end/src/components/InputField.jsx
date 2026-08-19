import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const InputField = ({
  label,
  type,
  name,
  placeholder,
  value,
  onChange,
  error,
}) => {

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label}
      </label>

      <div className="relative">
        <input
          type={
            type === "password"
              ? showPassword
                ? "text"
                : "password"
              : type
          }
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full border rounded-xl py-3 px-4 text-[15px] font-medium bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition duration-200 ${
            error
              ? "border-red-300 focus:ring-red-500"
              : "border-slate-200 focus:ring-blue-600 focus:border-transparent"
          }`}
        />

        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-xs font-semibold mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;