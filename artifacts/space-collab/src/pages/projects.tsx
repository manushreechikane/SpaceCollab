import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useProjects, useCreateProject } from "@/hooks/use-projects";
import { useCurrentUser } from "@/hooks/use-auth";
import { Link } from "wouter";
import { format } from "date-fns";
import { Search, Plus, X, Users, Rocket, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = ["All", "Astronomy", "Rocketry", "Space Biology", "Astrophysics", "Mars Exploration", "Satellite Tech", "Space Medicine"];

export default function Projects() {
  const { data: projects = [], isLoading } = useProjects();
  const { data: user } = useCurrentUser();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || p.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2 text-glow">Mission Network</h1>
          <p className="text-muted-foreground">Discover and join space science projects worldwide.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_15px_hsl(var(--primary)/0.4)] flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Start Mission
        </button>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 rounded-2xl mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search missions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full glass-input rounded-xl py-2 pl-10 pr-4"
          />
        </div>
        <div className="flex-1 overflow-x-auto w-full pb-2 md:pb-0 hide-scrollbar">
          <div className="flex gap-2 min-w-max">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === c 
                    ? "bg-primary text-primary-foreground shadow-[0_0_10px_hsl(var(--primary)/0.5)]" 
                    : "bg-background/50 text-muted-foreground hover:text-white hover:bg-white/10"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <motion.div 
                whileHover={{ y: -5 }}
                className="glass-panel p-6 rounded-2xl h-full flex flex-col group border border-white/5 hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden"
              >
                {/* Visual Flair */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full group-hover:bg-primary/20 transition-colors pointer-events-none" />
                
                <div className="flex justify-between items-start mb-4 z-10">
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
                
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors z-10">{project.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1 z-10">{project.description}</p>
                
                <div className="mt-auto z-10">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-md border border-white/5"><Users className="w-3.5 h-3.5" /> {project.memberCount}</span>
                    <span className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-md border border-white/5"><Rocket className="w-3.5 h-3.5" /> {project.progress}%</span>
                  </div>
                  <div className="flex gap-2 overflow-hidden">
                    {project.tags?.slice(0,3).map(tag => (
                      <span key={tag} className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded uppercase tracking-wider">{tag}</span>
                    ))}
                    {project.tags && project.tags.length > 3 && <span className="text-[10px] text-muted-foreground">+{project.tags.length - 3}</span>}
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
          {filteredProjects.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted-foreground">
              No missions found matching your criteria.
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateProjectModal onClose={() => setShowCreateModal(false)} />
        )}
      </AnimatePresence>
    </Layout>
  );
}

function CreateProjectModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Astronomy",
    tags: ""
  });
  const createMutation = useCreateProject();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    }, {
      onSuccess: () => {
        toast({ title: "Mission Created", description: "Your project has been launched successfully." });
        onClose();
      },
      onError: (err: any) => {
        toast({ variant: "destructive", title: "Error", description: err.message });
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel w-full max-w-xl rounded-3xl p-6 relative"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-muted-foreground hover:text-white"><X /></button>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Rocket className="text-primary" /> Launch New Mission</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Mission Title*</label>
            <input 
              required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full glass-input rounded-xl py-2 px-4" placeholder="e.g. Lunar Soil Analysis"
            />
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Description*</label>
            <textarea 
              required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full glass-input rounded-xl py-2 px-4 min-h-[100px]" placeholder="Detail the objectives of your mission..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground block mb-1">Scientific Category</label>
              <select 
                value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full glass-input rounded-xl py-2 px-4 appearance-none"
              >
                {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c} className="bg-card text-foreground">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1">Tags (comma separated)</label>
              <input 
                value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})}
                className="w-full glass-input rounded-xl py-2 px-4" placeholder="mars, botany, data"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-xl text-muted-foreground hover:bg-white/5">Cancel</button>
            <button type="submit" disabled={createMutation.isPending} className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-xl shadow-[0_0_15px_hsl(var(--primary)/0.3)] hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Submit
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
