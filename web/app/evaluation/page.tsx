"use client";
import { motion } from "framer-motion";

export default function EvaluationPage() {
  return (
    <div className="min-h-screen bg-bg-dark p-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-heading-xl font-bold text-text-primary">Evaluation Dashboard</h1>
          <p className="mt-2 text-body text-text-secondary">
            Performance metrics and evaluation results.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 rounded-lg border border-gray-800 bg-bg-card p-8 text-center"
        >
          <p className="text-body text-text-secondary">
            Evaluation dashboard interface coming soon...
          </p>
        </motion.div>
      </div>
    </div>
  );
}
