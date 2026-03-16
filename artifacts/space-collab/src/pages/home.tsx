import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { Rocket, Telescope, Users, Shield } from "lucide-react";

export default function Home() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center text-center py-20 lg:py-32">
        
        {/* Floating Planet Image */}
        <motion.img 
          src={`${import.meta.env.BASE_URL}images/planet-illustration.png`}
          alt="Glowing Planet"
          className="w-64 h-64 md:w-80 md:h-80 object-cover mb-8 rounded-full mix-blend-screen opacity-90 box-glow"
          animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.h1 
          className="text-5xl md:text-7xl font-display font-extrabold mb-6 leading-tight"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          Explore the <span className="gradient-text">Cosmos</span> <br/>
          <span className="text-white text-glow">Together.</span>
        </motion.h1>

        <motion.p 
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Join a global network of students collaborating on space science missions, 
          astrophysics experiments, and orbital research projects.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Link 
            href="/register" 
            className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-full text-lg hover:bg-primary/90 hover:scale-105 transition-all shadow-[0_0_20px_hsl(var(--primary)/0.5)] flex items-center justify-center gap-2"
          >
            <Rocket className="w-5 h-5" />
            Launch Mission
          </Link>
          <Link 
            href="/projects" 
            className="px-8 py-4 glass-panel text-white font-bold rounded-full text-lg hover:bg-white/10 hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <Telescope className="w-5 h-5" />
            Browse Projects
          </Link>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full text-left">
          {[
            { icon: Users, title: "Global Collaboration", desc: "Form squads with students worldwide to tackle complex astronomical challenges." },
            { icon: Telescope, title: "Live Experiments", desc: "Log orbital data, analyze telemetry, and share your findings in real-time." },
            { icon: Shield, title: "Academy Resources", desc: "Access curated data feeds from NASA, ESA, and top space research institutes." }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              className="glass-panel p-8 rounded-3xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 * i, duration: 0.5 }}
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 border border-primary/30 shadow-[0_0_15px_hsl(var(--primary)/0.2)]">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl mb-3 text-white">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
