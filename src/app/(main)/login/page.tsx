"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser, forgotPassword } from "../account/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, X, Mail, CheckCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const router = useRouter();
  const auth = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await loginUser(email, password);
      if (res.token) {
        auth.login(res.token);
        router.push("/");
      } else {
        setError(res.message || "Login failed");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setForgotPasswordLoading(true);
    try {
      const response = await forgotPassword(forgotPasswordEmail.trim());
      
      if (response.success) {
        setForgotPasswordSuccess(true);
        toast({
          title: "Reset Link Sent",
          description: "If an account with that email exists, we've sent a password reset link.",
        });
        
        // Reset form and close modal after 3 seconds
        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotPasswordEmail("");
          setForgotPasswordSuccess(false);
        }, 3000);
      } else {
        throw new Error(response.message || "Failed to send reset link");
      }
    } catch (error: any) {
      toast({
        title: "Request Failed",
        description: error.message || "An error occurred while processing your request",
        variant: "destructive",
      });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPassword(false);
    setForgotPasswordEmail("");
    setForgotPasswordSuccess(false);
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="w-full max-w-md rounded-lg shadow-lg p-8">
          <div className="mb-6 text-center">
            <Link
              href="/"
              className="mb-4 flex items-center w-full gap-2 font-semibold"
            >
              <span className="font-display text-4xl text-center w-full font-bold tracking-tight text-primary">
                timedrop
              </span>
            </Link>
            <h1 className="text-3xl font-bold">Welcome Back</h1>
            <p className="text-muted-foreground mt-1">Sign in to your Timedrop account</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                aria-label="Email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  aria-label="Password"
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-muted-foreground"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive rounded px-3 py-2 text-sm">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </Button>
          </form>
          <div className="flex justify-between mt-4 text-sm">
            <a href="/register" className="text-primary underline">
              Create account
            </a>
            <button
              onClick={() => setShowForgotPassword(true)}
              className="text-muted-foreground hover:text-primary hover:underline transition-colors"
            >
              Forgot password?
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Forgot Password
              </h2>
              <button
                onClick={closeForgotPasswordModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {forgotPasswordSuccess ? (
                <div className="text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Check Your Email
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    We've sent a password reset link to <strong>{forgotPasswordEmail}</strong>. 
                    Please check your email and click the link to reset your password.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This modal will close automatically...
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                  
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="forgot-email"
                          type="email"
                          placeholder="Enter your email"
                          value={forgotPasswordEmail}
                          onChange={(e) => setForgotPasswordEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={closeForgotPasswordModal}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={forgotPasswordLoading || !forgotPasswordEmail.trim()}
                        className="flex-1"
                      >
                        {forgotPasswordLoading ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            Sending...
                          </span>
                        ) : (
                          "Send Reset Link"
                        )}
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
} 