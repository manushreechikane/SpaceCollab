import { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { 
  useProject, useJoinProject, useLeaveProject, 
  useProjectComments, useAddComment, 
  useProjectExperiments, useAddExperiment,
  useProjectMessages, useSendMessage,
  useUpdateProject
} from "@/hooks/use-projects";
import { useCurrentUser } from "@/hooks/use-auth";
import { useRoute } from "wouter";
import { format } from "date-fns";
import { 
  Rocket, Users, MessageSquare, TestTubes, Activity, 
  Settings, LogOut, Send, Plus, Calendar, Edit3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function ProjectDetail() {
  const [, params] = useRoute("/projects/:id");
  const projectId = parseInt(params?.id || "0");
  
  const { data: project, isLoading } = useProject(projectId);
  const { data: user } = useCurrentUser();
  const { toast } = useToast();
  
  const joinMutation = useJoinProject();
  const leaveMutation = useLeaveProject();
  const updateMutation = useUpdateProject();

  const [activeTab, setActiveTab] = useState<'overview'|'members'|'discussions'|'experiments'|'chat'>('overview');
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [newProgress, setNewProgress] = useState(0);

  if (isLoading || !project) return <Layout><div className="flex justify-center p-20"><Activity className="w-8 h-8 text-primary animate-pulse" /></div></Layout>;

  const isOwner = user?.id === project.ownerId;
  const isMember = project.isMember || isOwner;

  const handleJoin = () => {
    joinMutation.mutate(projectId, {
      onSuccess: () => toast({ title: "Success", description: "You have joined the mission crew." })
    });
  };

  const handleLeave = () => {
    leaveMutation.mutate(projectId, {
      onSuccess: () => toast({ title: "Success", description: "You have left the mission." })
    });
  };

  const handleUpdateProgress = () => {
    updateMutation.mutate({ id: projectId, data: { progress: newProgress } }, {
      onSuccess: () => {
        setIsEditingProgress(false);
        toast({ title: "Progress Updated", description: "Mission telemetry updated." });
      }
    });
  };

  return (
    <Layout>
      {/* Header */}
      <div className="glass-panel p-8 rounded-3xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-3xl rounded-full mix-blend-screen pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full border border-primary/30 shadow-[0_0_10px_hsl(var(--primary)/0.2)]">
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
            <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-2">{project.title}</h1>
            <p className="text-muted-foreground flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1"><Users className="w-4 h-4"/> {project.memberCount} Crew</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> Launched {format(new Date(project.createdAt), 'MMM yyyy')}</span>
            </p>
          </div>

          <div className="flex flex-col gap-3 min-w-[200px]">
            {isMember ? (
              <div className="flex gap-2">
                <div className="px-4 py-2 bg-green-500/10 text-green-400 rounded-xl border border-green-500/20 flex-1 text-center font-semibold text-sm">
                  Crew Member
                </div>
                {!isOwner && (
                  <button onClick={handleLeave} disabled={leaveMutation.isPending} className="p-2 text-destructive hover:bg-destructive/10 rounded-xl transition-colors" title="Leave Mission">
                    <LogOut className="w-5 h-5" />
                  </button>
                )}
              </div>
            ) : (
              <button 
                onClick={handleJoin} 
                disabled={joinMutation.isPending}
                className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-[0_0_15px_hsl(var(--primary)/0.3)] hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
              >
                <Rocket className="w-5 h-5" /> Join Mission
              </button>
            )}

            {/* Progress */}
            <div className="glass-panel p-3 rounded-xl border border-white/5 relative">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-muted-foreground">Mission Progress</span>
                <span className="text-primary font-bold">{project.progress}%</span>
              </div>
              <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden mb-1">
                <div className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000" style={{ width: `${project.progress}%` }} />
              </div>
              
              {isOwner && (
                <button onClick={() => { setIsEditingProgress(!isEditingProgress); setNewProgress(project.progress); }} className="absolute -top-2 -right-2 p-1.5 bg-card rounded-full border border-border text-muted-foreground hover:text-white transition-colors">
                  <Edit3 className="w-3 h-3" />
                </button>
              )}
              
              {isEditingProgress && (
                <div className="mt-3 flex gap-2 items-center">
                  <input type="range" min="0" max="100" value={newProgress} onChange={e => setNewProgress(parseInt(e.target.value))} className="flex-1 accent-primary" />
                  <button onClick={handleUpdateProgress} className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Save</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 p-1 glass-panel rounded-xl max-w-fit">
        {[
          { id: 'overview', label: 'Overview', icon: Rocket },
          { id: 'members', label: 'Crew', icon: Users },
          { id: 'discussions', label: 'Discussions', icon: MessageSquare },
          { id: 'experiments', label: 'Experiments', icon: TestTubes },
          { id: 'chat', label: 'Comm Channel', icon: Activity },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-primary/20 text-primary border border-primary/30' : 'text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="min-h-[400px]"
      >
        {activeTab === 'overview' && (
          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-4">Mission Objective</h2>
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed mb-8">{project.description}</p>
            
            <h3 className="font-semibold mb-3">Keywords & Tags</h3>
            <div className="flex flex-wrap gap-2">
              {project.tags?.map(tag => (
                <span key={tag} className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs uppercase tracking-wider border border-white/5">{tag}</span>
              ))}
              {!project.tags?.length && <span className="text-sm text-muted-foreground italic">No tags specified.</span>}
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {project.members?.map(member => (
              <div key={member.id} className="glass-panel p-4 rounded-xl flex items-center gap-4">
                <img src={member.avatarUrl || `${import.meta.env.BASE_URL}images/astronaut-avatar.png`} alt={member.username} className="w-12 h-12 rounded-full border border-white/10" />
                <div>
                  <p className="font-bold text-sm">{member.displayName || member.username}</p>
                  <p className="text-xs text-primary">{member.id === project.ownerId ? 'Commander' : 'Specialist'}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'discussions' && <ProjectDiscussions projectId={projectId} />}
        {activeTab === 'experiments' && <ProjectExperiments projectId={projectId} isMember={isMember} />}
        {activeTab === 'chat' && <ProjectChat projectId={projectId} isMember={isMember} />}
      </motion.div>
    </Layout>
  );
}

// --- SUB-COMPONENTS ---

function ProjectDiscussions({ projectId }: { projectId: number }) {
  const { data: comments = [], isLoading } = useProjectComments(projectId);
  const addMutation = useAddComment();
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    addMutation.mutate({ projectId, data: { content } }, {
      onSuccess: () => setContent("")
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="glass-panel p-4 rounded-2xl flex gap-4">
        <input 
          value={content} onChange={e => setContent(e.target.value)}
          placeholder="Start a discussion..."
          className="flex-1 glass-input rounded-xl px-4 py-2"
        />
        <button type="submit" disabled={addMutation.isPending || !content.trim()} className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50">
          Post
        </button>
      </form>

      {isLoading ? <Activity className="w-6 h-6 text-primary animate-pulse mx-auto" /> : (
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="glass-panel p-5 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                  {(comment.displayName || comment.username || '?')[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm">{comment.displayName || comment.username}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(comment.createdAt), 'MMM d, h:mm a')}</p>
                </div>
              </div>
              <p className="text-sm pl-11">{comment.content}</p>
            </div>
          ))}
          {comments.length === 0 && <p className="text-center text-muted-foreground py-10">No discussions yet. Be the first to initiate comms.</p>}
        </div>
      )}
    </div>
  );
}

function ProjectExperiments({ projectId, isMember }: { projectId: number, isMember: boolean }) {
  const { data: experiments = [], isLoading } = useProjectExperiments(projectId);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", results: "" });
  const addMutation = useAddExperiment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate({ projectId, data: formData }, {
      onSuccess: () => {
        setShowForm(false);
        setFormData({ title: "", description: "", results: "" });
      }
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Experiment Logs</h2>
        {isMember && (
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-accent/20 text-accent font-medium border border-accent/30 rounded-xl hover:bg-accent/30 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Log Result
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl mb-6 space-y-4 overflow-hidden"
          >
            <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Experiment Title" className="w-full glass-input rounded-xl px-4 py-2" />
            <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Methodology & Setup..." className="w-full glass-input rounded-xl px-4 py-2 min-h-[80px]" />
            <textarea value={formData.results} onChange={e => setFormData({...formData, results: e.target.value})} placeholder="Findings / Data Output..." className="w-full glass-input rounded-xl px-4 py-2 min-h-[80px]" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-muted-foreground hover:text-white">Cancel</button>
              <button type="submit" disabled={addMutation.isPending} className="px-6 py-2 bg-accent text-accent-foreground font-bold rounded-xl hover:bg-accent/90">Save Log</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {isLoading ? <Activity className="w-6 h-6 text-primary animate-pulse mx-auto" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {experiments.map(exp => (
            <div key={exp.id} className="glass-panel p-5 rounded-2xl border-l-2 border-l-accent">
              <h3 className="font-bold mb-1">{exp.title}</h3>
              <p className="text-xs text-muted-foreground mb-3">Logged by {exp.displayName || exp.username} • {format(new Date(exp.createdAt), 'MMM d, yyyy')}</p>
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground font-medium">Method:</span> {exp.description}</p>
                {exp.results && <p><span className="text-muted-foreground font-medium">Results:</span> {exp.results}</p>}
              </div>
            </div>
          ))}
          {experiments.length === 0 && !showForm && <p className="col-span-full text-center text-muted-foreground py-10">No experiment logs available.</p>}
        </div>
      )}
    </div>
  );
}

function ProjectChat({ projectId, isMember }: { projectId: number, isMember: boolean }) {
  const { data: messages = [], isLoading } = useProjectMessages(projectId);
  const { data: user } = useCurrentUser();
  const sendMutation = useSendMessage();
  const [content, setContent] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !isMember) return;
    sendMutation.mutate({ projectId, data: { content } }, {
      onSuccess: () => setContent("")
    });
  };

  return (
    <div className="glass-panel rounded-2xl h-[500px] flex flex-col overflow-hidden">
      <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2"><Activity className="w-4 h-4 text-primary animate-pulse" /> Live Telemetry Comm</h3>
        {!isMember && <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">Read-only (Join crew to transmit)</span>}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && <p className="text-center text-muted-foreground text-sm">Establishing connection...</p>}
        {messages.map(msg => {
          const isMe = msg.userId === user?.id;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] text-muted-foreground mb-1 ml-1">{msg.displayName || msg.username} • {format(new Date(msg.createdAt), 'HH:mm')}</span>
              <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm ${isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted text-foreground rounded-tl-sm'}`}>
                {msg.content}
              </div>
            </div>
          );
        })}
        {messages.length === 0 && !isLoading && <p className="text-center text-muted-foreground text-sm mt-10">Comm channel is quiet.</p>}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 bg-black/40 border-t border-white/5 flex gap-2">
        <input 
          value={content} onChange={e => setContent(e.target.value)} disabled={!isMember}
          placeholder={isMember ? "Transmit message..." : "Access denied"}
          className="flex-1 glass-input rounded-xl px-4 py-2 text-sm disabled:opacity-50"
        />
        <button type="submit" disabled={!content.trim() || !isMember || sendMutation.isPending} className="p-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors">
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
