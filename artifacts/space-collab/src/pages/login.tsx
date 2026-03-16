import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { useLogin } from "@/hooks/use-auth";
import { Orbit, Loader2, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password }, {
      onSuccess: () => {
        toast({ title: "Welcome back commander", description: "Successfully docked with the station." });
        setLocation("/dashboard");
      },
      onError: (err: any) => {
        toast({ variant: "destructive", title: "Access Denied", description: err.message });
      }
    });
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[70vh]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-8 sm:p-12 rounded-3xl w-full max-w-md relative overflow-hidden"
        >
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full mix-blend-screen pointer-events-none" />
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center mb-4 shadow-[0_0_20px_hsl(var(--primary)/0.5)]">
              <Orbit className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white text-glow">Academy Access</h2>
            <p className="text-muted-foreground mt-2">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground pl-1">Transmission Channel (Email)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input rounded-xl py-3 pl-12 pr-4"
                  placeholder="astronaut@academy.edu"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground pl-1">Security Code (Password)</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass-input rounded-xl py-3 pl-12 pr-4"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-4 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-2 mt-4 shadow-[0_0_15px_hsl(var(--primary)/0.4)] disabled:opacity-50"
            >
              {loginMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Initiate Launch sequence"}
            </button>
          </form>

          <p className="text-center mt-8 text-muted-foreground text-sm">
            New recruit? <Link href="/register" className="text-primary hover:text-primary/80 font-semibold text-glow transition-colors">Join the Academy</Link>
          </p>
        </motion.div>
      </div>
    </Layout>
  );
}
