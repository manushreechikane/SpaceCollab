import { Layout } from "@/components/Layout";
import { Link } from "wouter";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AlertCircle className="w-24 h-24 text-destructive mb-6 mx-auto opacity-80" />
          <h1 className="text-6xl font-display font-bold text-white mb-4">404</h1>
          <h2 className="text-2xl text-muted-foreground mb-8">Navigation Error: Sector Not Found</h2>
          <p className="max-w-md mx-auto text-muted-foreground mb-8">
            The coordinates you entered point to empty space. Please recalculate your trajectory.
          </p>
          <Link href="/" className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-full hover:bg-primary/90 transition-all shadow-[0_0_20px_hsl(var(--primary)/0.4)]">
            Return to Base
          </Link>
        </motion.div>
      </div>
    </Layout>
  );
}
