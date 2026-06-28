"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export function Sidebar() {
  return (
    <motion.div
      className="fixed left-0 top-0 h-screen w-64 border-r border-gray-800 bg-bg-dark p-6"
      initial={{ x: -256 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="mb-8">
        <h1 className="text-heading font-bold text-text-primary">TransitLens</h1>
        <p className="text-xs text-text-secondary">Exoplanet Detection</p>
      </div>

      <nav className="space-y-2">
        <Link href="/analyze" className="block rounded-md px-4 py-2 text-sm hover:bg-gray-900 transition-colors">
          Analyze
        </Link>
        <Link href="/candidates" className="block rounded-md px-4 py-2 text-sm hover:bg-gray-900 transition-colors">
          Candidates
        </Link>
        <Link href="/evaluation" className="block rounded-md px-4 py-2 text-sm hover:bg-gray-900 transition-colors">
          Evaluation
        </Link>
      </nav>
    </motion.div>
  );
}
