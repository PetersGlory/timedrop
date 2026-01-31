"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithGoogle, registerUser } from "../account/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { parseJwt } from "@/utils/google";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const googleDivRef = useRef<HTMLDivElement | null>(null);

  
    // Initialize Google Identity Services
    useEffect(() => {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) return; // silently skip if not configured
  
      const initialize = () => {
        // @ts-ignore - google is injected globally
        if (!window.google || !window.google.accounts || !googleDivRef.current) return;
        // @ts-ignore
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            const payload = parseJwt(response.credential);
            if (!payload) {
              toast({ title: "Google sign-in failed", variant: "destructive" });
              return;
            }
            const email = payload.email as string | undefined;
            const fullName = (payload.name as string | undefined) || "";
            const givenName = (payload.given_name as string | undefined) || fullName.split(" ")[0] || "";
            const familyName = (payload.family_name as string | undefined) || fullName.split(" ").slice(1).join(" ") || "";
  
            if (!email) {
              toast({ title: "No email returned from Google", variant: "destructive" });
              return;
            }
  
            try {
              // setGoogleLoading(true);
              const res = await loginWithGoogle({
                firstName: givenName,
                lastName: familyName,
                email,
              });
              if (res && res.token) {
                auth.login(res.token);              
                window.dispatchEvent(new Event('auth-changed'));
                router.push("/");
              } else {
                toast({ title: "Google login failed", description: res?.message || "Unknown error", variant: "destructive" });
              }
            } catch (err: any) {
              toast({ title: "Google login failed", description: err?.message || "Request error", variant: "destructive" });
            } finally {
              // setGoogleLoading(false);
              console.log("Google login attempt finished");
            }
          },
          auto_select: false,
          ux_mode: "popup",
        });
        // @ts-ignore
        window.google.accounts.id.renderButton(googleDivRef.current, {
          theme: "outline",
          size: "large",
          width: 360,
          type: "standard",
          text: "continue_with",
          shape: "rectangular",
        });
      };
  
      // Load the script if not already present
      const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]') as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener("load", initialize);
        initialize();
        return () => existing.removeEventListener("load", initialize);
      }
  
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initialize;
      document.body.appendChild(script);
      return () => {
        script.onload = null;
      };
    }, [auth, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await registerUser({ firstName, lastName, email, password });
      if (res.token) {
        auth.login(res.token);
        router.push("/");
      } else {
        setError(res.message || "Registration failed");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
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
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="text-muted-foreground mt-1">Sign up for Timedrop</p>
        </div>
        
        <div className="mt-4 flex flex-col-reverse">
          <div className="flex items-center gap-2 my-4">
            <div className="h-px bg-border w-full" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px bg-border w-full" />
          </div>
          <div className="flex flex-col gap-3">
            <div ref={googleDivRef} className="flex justify-center" />
            {!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
              <Button variant="outline" className="w-full" disabled>
                Configure NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable Google Sign-In
              </Button>
            )}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium mb-1">
              First Name
            </label>
            <Input
              id="firstName"
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              required
              aria-label="First Name"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium mb-1">
              Last Name
            </label>
            <Input
              id="lastName"
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              required
              aria-label="Last Name"
            />
          </div>
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
                autoComplete="new-password"
                placeholder="Create a password"
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
                Registering...
              </span>
            ) : (
              "Register"
            )}
          </Button>
        </form>
        <div className="flex justify-between mt-4 text-sm">
          <a href="/login" className="text-primary underline">
            Already have an account?
          </a>
        </div>
      </div>
    </div>
  );
} 