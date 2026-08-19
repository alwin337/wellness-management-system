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
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
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
          className={`w-full border rounded-2xl py-3 px-4 text-sm font-medium bg-slate-50 text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition duration-200 ${
            error
              ? "border-rose-300 focus:ring-rose-500 focus:bg-white"
              : "border-slate-200 focus:border-transparent focus:ring-blue-600 focus:bg-white"
          }`}
        />

        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>

      {error && (
        <p className="text-rose-500 text-xs font-semibold mt-1.5">
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;