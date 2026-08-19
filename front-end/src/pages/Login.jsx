import LoginForm from "../components/LoginForm";
import AuthLayout from "../layouts/AuthLayout";
import { Link } from "react-router-dom";
import { HeartPulse, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const Login = () => {
  return (
    <AuthLayout>
      <div className="w-full max-w-5xl bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50 flex flex-col md:flex-row min-h-[600px] z-20">
        
        {/* LEFT SIDE - Branding & Visuals (hidden on mobile, visible on medium screens and up) */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-tr from-blue-900 via-blue-800 to-teal-800 p-12 flex-col justify-between relative overflow-hidden text-white">
          {/* Subtle Abstract Shapes */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl -ml-20 -mb-20"></div>
          <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-yellow-200/10 rounded-full blur-2xl"></div>

          {/* Top Logo / Branding */}
          <div className="relative z-10 flex items-center gap-2">
            <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/20">
              <HeartPulse className="w-6 h-6 text-yellow-300 animate-pulse" />
            </div>
            <span className="text-xl font-bold tracking-tight">Wellness Management System</span>
          </div>

          {/* Middle Messaging */}
          <div className="relative z-10 space-y-6 my-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold text-teal-300">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Wellness System
            </div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-100">
              Your Mental Wellness <br />
              Is Our Priority.
            </h1>
            <p className="text-blue-100 text-sm max-w-md leading-relaxed">
              Connect with certified professional student counsellors, schedule secure wellness sessions, and track your emotional health journey in a fully private, confidential space.
            </p>
          </div>

          {/* Bottom Footer / Subtle Quote */}
          <div className="relative z-10 text-xs text-blue-200/80 border-t border-white/10 pt-6">
            "Your mind is a garden. Your thoughts are the seeds. You can grow flowers or you can grow weeds."
          </div>
        </div>

        {/* RIGHT SIDE - Form Card */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-slate-50/50">
          <div className="max-w-md w-full mx-auto space-y-8">
            <div>
              {/* Mobile Branding (only visible when left side is hidden) */}
              <div className="flex items-center gap-2 md:hidden mb-4">
                <HeartPulse className="w-8 h-8 text-blue-600" />
                <span className="text-lg font-bold text-slate-800">Wellness Management System</span>
              </div>
              
              <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">
                Welcome Back 👋
              </h2>
              <p className="text-sm text-slate-500 mt-2 font-medium">
                Log in to coordinate your counselling sessions and check availability slots.
              </p>
            </div>

            <div className="mt-8">
              <LoginForm />
            </div>

            <p className="text-center text-sm text-slate-600 mt-8">
              Don't have a student account?
              <Link
                to="/register"
                className="text-blue-600 ml-1.5 font-bold hover:text-blue-700 hover:underline transition-colors"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>

      </div>
    </AuthLayout>
  );
};

export default Login;