import { Layout } from "@/components/Layout";
import { useCurrentUser } from "@/hooks/use-auth";
import { useProjects } from "@/hooks/use-projects";
import { Link } from "wouter";
import { Rocket, Target, ArrowRight, Activity, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: user } = useCurrentUser();
  const { data: projects = [], isLoading } = useProjects();

  if (!user) return <Layout><div className="text-center mt-20">Redirecting...</div></Layout>;

  // Filter projects the user is a member of or owns
  const myProjects = projects.filter(p => p.ownerId === user.id || p.isMember);
  
  const activeProjects = myProjects.filter(p => p.status === 'active');
  const completedProjects = myProjects.filter(p => p.status === 'completed');

  return (
    <Layout>
      <div className="mb-10">
        <h1 className="text-4xl font-display font-bold mb-2">
          Welcome back, <span className="gradient-text">{user.displayName || user.username}</span>
        </h1>
        <p className="text-muted-foreground">Mission Control Center • Status: Online</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 rounded-2xl flex items-center gap-5"
        >
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Rocket className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active Missions</p>
            <p className="text-3xl font-bold">{activeProjects.length}</p>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-panel p-6 rounded-2xl flex items-center gap-5"
        >
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
            <Target className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-3xl font-bold">{completedProjects.length}</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-panel p-6 rounded-2xl flex items-center gap-5 justify-between"
        >
          <div>
            <p className="text-sm text-muted-foreground mb-1">Quick Action</p>
            <Link href="/projects" className="text-primary font-medium hover:underline flex items-center gap-1">
              Browse network <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <Activity className="w-8 h-8 text-muted-foreground/30" />
        </motion.div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Your Active Orbits</h2>
        <Link href="/projects" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
          <Plus className="w-4 h-4" /> Start New
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><Activity className="w-8 h-8 text-primary animate-pulse" /></div>
      ) : myProjects.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Telescope className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">No Active Missions</h3>
          <p className="text-muted-foreground mb-6 max-w-md">You haven't joined any space projects yet. Browse the network to find a crew or start your own research mission.</p>
          <Link href="/projects" className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_15px_hsl(var(--primary)/0.3)]">
            Explore Network
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myProjects.map(project => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <motion.div 
                whileHover={{ y: -5 }}
                className="glass-panel p-6 rounded-2xl h-full flex flex-col group border border-white/5 hover:border-primary/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full border border-primary/30">
                    {project.category}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-md ${
                    project.status === 'active' ? 'bg-green-500/20 text-green-400' : 
                    project.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {project.status.toUpperCase()}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{project.description}</p>
                
                <div className="mt-auto">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Mission Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden mb-4">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-accent" 
                      style={{ width: `${project.progress}%` }} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {project.memberCount} Crew</span>
                    <span>Updated {format(new Date(project.updatedAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}

// Ensure Telescope is imported
import { Telescope, Users } from "lucide-react";
