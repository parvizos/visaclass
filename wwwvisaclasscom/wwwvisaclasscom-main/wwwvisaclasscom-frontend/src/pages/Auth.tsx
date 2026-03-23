import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { loginLocal, onLocalAuthStateChange, signupLocal } from "@/lib/localAuth";

const Auth = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">(
    searchParams.get("mode") === "signup" ? "signup" : "login",
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const redirect = searchParams.get("redirect");
    return onLocalAuthStateChange((user) => {
      if (user) navigate(redirect || "/");
    });
  }, [navigate, searchParams]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);
    try {
      loginLocal(loginData.email, loginData.password);
      toast({
        title: language === "en" ? "Welcome back!" : "Welcome back!",
        description: language === "en" ? "You have successfully logged in." : "You have successfully logged in.",
      });
      const redirect = searchParams.get("redirect");
      navigate(redirect || "/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: language === "en" ? "Login Failed" : "Login Failed",
        description: error.message ?? "Invalid email or password.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!signupData.fullName.trim()) {
      setErrors({ fullName: "Full name is required" });
      return;
    }
    if (signupData.password !== signupData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }
    if (signupData.password.length < 6) {
      setErrors({ password: "Password must be at least 6 characters" });
      return;
    }

    setIsLoading(true);
    try {
      signupLocal(signupData.fullName, signupData.email, signupData.password);
      toast({
        title: language === "en" ? "Account created!" : "Account created!",
        description: language === "en" ? "You are now signed in." : "You are now signed in.",
      });
      const redirect = searchParams.get("redirect");
      navigate(redirect || "/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: language === "en" ? "Sign Up Failed" : "Sign Up Failed",
        description: error.message ?? "Could not create account.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-white via-gray-50 to-gray-100">
      <div className="w-full max-w-md">
        <div className="flex bg-gray-200 rounded-xl p-1 mb-8">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium ${mode === "login" ? "bg-white text-blue-600 shadow-md" : "text-gray-600"}`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium ${mode === "signup" ? "bg-white text-blue-600 shadow-md" : "text-gray-600"}`}
          >
            Sign Up
          </button>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="pl-12 py-3 h-12 rounded-lg border-2 border-gray-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="pl-12 pr-12 py-3 h-12 rounded-lg border-2 border-gray-300"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full h-12">
              <span>{isLoading ? "Signing in..." : "Sign In"}</span>
              {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  value={signupData.fullName}
                  onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                  className="pl-12 py-3 h-12 rounded-lg border-2 border-gray-300"
                />
              </div>
              {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  className="pl-12 py-3 h-12 rounded-lg border-2 border-gray-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  className="pl-12 pr-12 py-3 h-12 rounded-lg border-2 border-gray-300"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  className="pl-12 pr-12 py-3 h-12 rounded-lg border-2 border-gray-300"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
            <Button type="submit" disabled={isLoading} className="w-full h-12">
              <span>{isLoading ? "Creating account..." : "Create Account"}</span>
              {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;
