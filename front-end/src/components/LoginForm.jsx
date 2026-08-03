import InputField from "./InputField";
import Button from "./Button";

const LoginForm = () => {
  return (
    <form className="space-y-5">

      <InputField
        label="Email"
        type="email"
        placeholder="Enter your email"
      />

      <InputField
        label="Password"
        type="password"
        placeholder="Enter your password"
      />

      <Button text="Login" />

    </form>
  );
};

export default LoginForm;