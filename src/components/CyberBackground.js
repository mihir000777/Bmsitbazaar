import React, { useMemo } from 'react';

/**
 * Cyber-Grid Background from Stitch design.
 * Animated perspective grid with floating data nodes.
 */
export default function CyberBackground() {
  // Generate random data nodes
  const nodes = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      left: `${Math.random() * 100}%`,
      duration: `${5000 + Math.random() * 8000}ms`,
      delay: `${Math.random() * 5000}ms`,
    }));
  }, []);

  return (
    <div className="cyber-background">
      <div className="grid-container">
        <div className="grid-fade"></div>
        <div className="grid-ground"></div>
      </div>
      {nodes.map((node, i) => (
        <div
          key={i}
          className="data-node"
          style={{
            left: node.left,
            animation: `${node.duration} linear ${node.delay} infinite normal none running node-float`,
          }}
        />
      ))}
    </div>
  );
}
