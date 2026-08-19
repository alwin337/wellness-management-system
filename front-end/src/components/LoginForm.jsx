import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loginUser } from "../services/authApi";
import InputField from "./InputField";
import Button from "./Button";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Please enter email and password");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const res = await loginUser({ email, password });
      
      const { token, user } = res.data;
      
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success(res.data.message || "Login successful!");

      // Route based on role
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "counsellor") {
        navigate("/counsellor");
      } else {
        navigate("/student");
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error(
        error.response?.data?.message || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <InputField
        label="Email"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <InputField
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button 
        text={loading ? "Logging in..." : "Login"} 
        type="submit" 
        disabled={loading}
      />
    </form>
  );
};

export default LoginForm;