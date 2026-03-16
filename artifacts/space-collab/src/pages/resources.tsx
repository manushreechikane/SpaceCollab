import { Layout } from "@/components/Layout";
import { useResources } from "@/hooks/use-resources";
import { BookOpen, Video, Database, Wrench, GraduationCap, Loader2, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export default function Resources() {
  const { data: resources = [], isLoading } = useResources();

  const getIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5" />;
      case 'dataset': return <Database className="w-5 h-5" />;
      case 'tool': return <Wrench className="w-5 h-5" />;
      case 'course': return <GraduationCap className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <Layout>
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-display font-bold mb-4 text-glow">Academy Archives</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto md:mx-0">
          Access curated educational materials, telemetry data streams, and orbital mechanics tutorials provided by global space agencies.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {resources.map((res, i) => (
            <motion.a 
              key={res.id} 
              href={res.url} target="_blank" rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-panel rounded-2xl overflow-hidden group flex flex-col hover:border-primary/50 transition-all hover:-translate-y-1 shadow-lg hover:shadow-[0_10px_30px_hsl(var(--primary)/0.2)]"
            >
              <div className="h-40 bg-muted relative overflow-hidden flex items-center justify-center">
                {res.imageUrl ? (
                  <img src={res.imageUrl} alt={res.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    {getIcon(res.type)}
                  </div>
                )}
                <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-bold uppercase tracking-wide border border-white/10 text-white flex items-center gap-1.5">
                  {getIcon(res.type)} {res.type}
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <span className="text-xs text-primary font-semibold mb-1">{res.category}</span>
                <h3 className="font-bold text-lg mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">{res.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">{res.description}</p>
                <div className="flex items-center text-xs font-semibold text-muted-foreground group-hover:text-white transition-colors mt-auto">
                  Access Resource <ExternalLink className="w-3 h-3 ml-1" />
                </div>
              </div>
            </motion.a>
          ))}
          
          {/* Mock resources if API is empty for visual demonstration */}
          {resources.length === 0 && (
            [
              { id: 'm1', title: 'NASA Open Data Portal', desc: 'Tens of thousands of datasets relating to earth science, aerospace, and planetary defense.', category: 'Astrophysics', type: 'dataset' },
              { id: 'm2', title: 'Orbital Mechanics 101', desc: 'A comprehensive video series on understanding Keplerian orbits and transfer maneuvers.', category: 'Rocketry', type: 'course' },
              { id: 'm3', title: 'ESA Sky Tool', desc: 'Interactive celestial map visualizing the cosmos in multiple wavelengths.', category: 'Astronomy', type: 'tool' },
              { id: 'm4', title: 'Astrobiology Journal', desc: 'Recent publications on the effects of microgravity on cellular structures.', category: 'Space Biology', type: 'article' },
            ].map((res, i) => (
              <motion.div 
                key={res.id} 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-panel rounded-2xl overflow-hidden group flex flex-col hover:border-primary/50 transition-all opacity-70 hover:opacity-100"
              >
                <div className="h-40 bg-gradient-to-br from-muted to-black relative overflow-hidden flex items-center justify-center">
                  {getIcon(res.type)}
                  <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 rounded-md text-[10px] font-bold uppercase tracking-wide border border-white/10 flex items-center gap-1.5">
                    {getIcon(res.type)} {res.type}
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <span className="text-xs text-primary font-semibold mb-1">{res.category}</span>
                  <h3 className="font-bold text-lg mb-2">{res.title}</h3>
                  <p className="text-sm text-muted-foreground flex-1">{res.desc}</p>
                  <span className="text-[10px] text-muted-foreground mt-4 italic">Demo Content</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </Layout>
  );
}
