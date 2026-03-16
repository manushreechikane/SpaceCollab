import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { useRegister } from "@/hooks/use-auth";
import { Rocket, Loader2, Mail, Lock, User, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    displayName: "",
    grade: "High School"
  });
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const registerMutation = useRegister();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData, {
      onSuccess: () => {
        toast({ title: "Registration Successful", description: "Welcome to SpaceCollab Academy." });
        setLocation("/dashboard");
      },
      onError: (err: any) => {
        toast({ variant: "destructive", title: "Registration Failed", description: err.message });
      }
    });
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[80vh] py-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-8 sm:p-12 rounded-3xl w-full max-w-lg relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-3xl rounded-full mix-blend-screen pointer-events-none" />
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-accent to-primary flex items-center justify-center mb-4 shadow-[0_0_20px_hsl(var(--accent)/0.5)]">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white text-glow-accent">Enlist Now</h2>
            <p className="text-muted-foreground mt-2 text-center">Join the network of orbital researchers</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground pl-1">Callsign (Username)*</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    name="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full glass-input rounded-xl py-3 pl-10 pr-3 text-sm"
                    placeholder="astro_kid"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground pl-1">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    className="w-full glass-input rounded-xl py-3 pl-10 pr-3 text-sm"
                    placeholder="Jane Doe"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground pl-1">Transmission Channel (Email)*</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full glass-input rounded-xl py-3 pl-10 pr-3 text-sm"
                  placeholder="jane@academy.edu"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground pl-1">Security Code (Password)*</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full glass-input rounded-xl py-3 pl-10 pr-3 text-sm"
                  placeholder="Min 6 chars"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground pl-1">Current Academic Orbit</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  className="w-full glass-input rounded-xl py-3 pl-10 pr-3 text-sm appearance-none"
                >
                  <option value="Middle School" className="bg-card text-foreground">Middle School</option>
                  <option value="High School" className="bg-card text-foreground">High School</option>
                  <option value="Undergraduate" className="bg-card text-foreground">Undergraduate</option>
                  <option value="Graduate" className="bg-card text-foreground">Graduate</option>
                  <option value="Enthusiast" className="bg-card text-foreground">Space Enthusiast</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full py-4 rounded-xl font-bold bg-accent text-accent-foreground hover:bg-accent/90 transition-all flex items-center justify-center gap-2 mt-6 shadow-[0_0_15px_hsl(var(--accent)/0.4)] disabled:opacity-50"
            >
              {registerMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Enlistment"}
            </button>
          </form>

          <p className="text-center mt-6 text-muted-foreground text-sm">
            Already enlisted? <Link href="/login" className="text-accent hover:text-accent/80 font-semibold text-glow-accent transition-colors">Dock here</Link>
          </p>
        </motion.div>
      </div>
    </Layout>
  );
}
