import { Layout } from "@/components/Layout";
import { useCurrentUser } from "@/hooks/use-auth";
import { User, Mail, GraduationCap, Calendar, Rocket } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function Profile() {
  const { data: user } = useCurrentUser();

  if (!user) return <Layout><div className="p-20 text-center">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-3xl overflow-hidden mb-8"
        >
          {/* Banner */}
          <div className="h-48 bg-gradient-to-r from-primary/30 to-accent/30 relative">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-50" />
            <div className="absolute -bottom-16 left-8">
              <img 
                src={user.avatarUrl || `${import.meta.env.BASE_URL}images/astronaut-avatar.png`} 
                alt="Avatar" 
                className="w-32 h-32 rounded-full border-4 border-background bg-card object-cover shadow-[0_0_20px_rgba(0,0,0,0.5)]"
              />
            </div>
          </div>
          
          <div className="pt-20 px-8 pb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-display font-bold">{user.displayName || user.username}</h1>
                <p className="text-primary font-medium">@{user.username}</p>
              </div>
              <span className="px-3 py-1 bg-muted rounded-full text-xs font-bold uppercase tracking-wider border border-white/10">
                {user.role}
              </span>
            </div>

            <p className="text-muted-foreground mb-8 max-w-2xl">
              {user.bio || "No bio provided. This astronaut is currently busy exploring the cosmos and logging orbital mechanics data."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1 p-4 rounded-xl bg-black/20 border border-white/5">
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3"/> Comms</span>
                <span className="text-sm font-medium truncate">{user.email}</span>
              </div>
              <div className="flex flex-col gap-1 p-4 rounded-xl bg-black/20 border border-white/5">
                <span className="text-xs text-muted-foreground flex items-center gap-1"><GraduationCap className="w-3 h-3"/> Orbit</span>
                <span className="text-sm font-medium">{user.grade || 'Unknown'}</span>
              </div>
              <div className="flex flex-col gap-1 p-4 rounded-xl bg-black/20 border border-white/5">
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3"/> Enlisted</span>
                <span className="text-sm font-medium">{format(new Date(user.createdAt || new Date()), 'MMM yyyy')}</span>
              </div>
              <div className="flex flex-col gap-1 p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <span className="text-xs flex items-center gap-1 opacity-80"><Rocket className="w-3 h-3"/> Status</span>
                <span className="text-sm font-bold">Active Duty</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
