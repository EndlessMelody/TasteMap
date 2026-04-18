"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

function TopProgressBar() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setProgress(40), 60);
    const t2 = setTimeout(() => setProgress(75), 200);
    const t3 = setTimeout(() => setProgress(95), 400);
    const t4 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => setDone(true), 250);
    }, 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  if (done) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <motion.div
        initial={{ width: "0%" }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        style={{
          height: "100%",
          background:
            "linear-gradient(90deg, #ff6b35 0%, #AF52DE 60%, #FF6B6B 100%)",
          borderRadius: "0 3px 3px 0",
          boxShadow: "0 0 10px rgba(255,107,53,0.45)",
        }}
      />
    </div>
  );
}

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopProgressBar />
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        style={{ display: "contents" }}
      >
        {children}
      </motion.div>
    </>
  );
}
