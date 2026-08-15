import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext";

const CareerNetworkBackground = () => {
  const { darkMode } = useTheme();
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ w: window.innerWidth, h: window.innerHeight });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setDimensions({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    // Scale for high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.w * dpr;
    canvas.height = dimensions.h * dpr;
    ctx.scale(dpr, dpr);

    // Node & Particle Configuration
    const numNodes = Math.floor((dimensions.w * dimensions.h) / 20000); // Responsive density
    const nodes = [];
    const maxDistance = 180; // Distance to form connections

    // Colors derived from the theme spec
    // Dark: Graphite base + electric violet/cyan
    // Light: Ivory base + dusty rose/plum/gold
    const themeColors = darkMode 
      ? {
          nodes: "rgba(139, 92, 246, 0.4)", // Violet
          lines: "rgba(34, 211, 238, 0.15)", // Cyan
          blobs: [
            "rgba(139, 92, 246, 0.08)", // Violet
            "rgba(34, 211, 238, 0.05)", // Cyan
            "rgba(245, 158, 11, 0.03)"  // Amber
          ]
        }
      : {
          nodes: "rgba(84, 44, 75, 0.3)", // Plum
          lines: "rgba(184, 92, 110, 0.15)", // Dusty Rose
          blobs: [
            "rgba(84, 44, 75, 0.05)",  // Plum
            "rgba(200, 155, 74, 0.04)", // Gold
            "rgba(184, 92, 110, 0.04)"  // Dusty Rose
          ]
        };

    // Initialize nodes
    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * dimensions.w,
        y: Math.random() * dimensions.h,
        vx: (Math.random() - 0.5) * 0.3, // Extremely slow movement
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 1,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }

    let animationFrameId;
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, dimensions.w, dimensions.h);
      time += 0.01;

      // Draw subtle ambient blobs behind the network
      ctx.globalCompositeOperation = 'lighter';
      const drawBlob = (x, y, radius, color) => {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      };

      // Moving light blobs
      drawBlob(dimensions.w * 0.2 + Math.sin(time * 0.5) * 100, dimensions.h * 0.3 + Math.cos(time * 0.3) * 100, dimensions.w * 0.4, themeColors.blobs[0]);
      drawBlob(dimensions.w * 0.8 + Math.cos(time * 0.4) * 150, dimensions.h * 0.7 + Math.sin(time * 0.6) * 100, dimensions.w * 0.5, themeColors.blobs[1]);
      drawBlob(dimensions.w * 0.5 + Math.sin(time * 0.7) * 200, dimensions.h * 0.5 + Math.cos(time * 0.2) * 50, dimensions.w * 0.3, themeColors.blobs[2]);

      ctx.globalCompositeOperation = 'source-over';

      // Update and draw nodes/connections
      for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i];

        // Move
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges smoothly
        if (node.x < 0 || node.x > dimensions.w) node.vx *= -1;
        if (node.y < 0 || node.y > dimensions.h) node.vy *= -1;

        // Draw connections
        for (let j = i + 1; j < nodes.length; j++) {
          let node2 = nodes[j];
          let dx = node.x - node2.x;
          let dy = node.y - node2.y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(node2.x, node2.y);
            // Opacity falls off based on distance
            const opacity = 1 - (distance / maxDistance);
            
            // Extract the rgb base of the lines color and inject opacity
            // The themeColors.lines is rgba, we approximate by replacing the alpha part
            const baseColor = themeColors.lines.substring(0, themeColors.lines.lastIndexOf(','));
            ctx.strokeStyle = `${baseColor}, ${opacity * 0.5})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        // Draw node
        ctx.beginPath();
        // Pulsing effect
        const pulse = Math.sin(time * 2 + node.pulseOffset) * 0.5 + 0.5;
        const currentRadius = node.radius + pulse * 1.5;
        
        ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = themeColors.nodes;
        ctx.fill();
        
        // Very subtle glow around some nodes
        if (i % 5 === 0) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, currentRadius * 3, 0, Math.PI * 2);
          const baseNodeColor = themeColors.nodes.substring(0, themeColors.nodes.lastIndexOf(','));
          const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, currentRadius * 3);
          grad.addColorStop(0, `${baseNodeColor}, 0.2)`);
          grad.addColorStop(1, `${baseNodeColor}, 0)`);
          ctx.fillStyle = grad;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [dimensions, darkMode]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none transition-colors duration-700 z-0 ${darkMode ? 'bg-[#080A0F]' : 'bg-[#F7F5F0]'}`}
      style={{
        width: "100%",
        height: "100%",
        opacity: 0.8 // Keeps it subtle so it never distracts
      }}
    />
  );
};

export default CareerNetworkBackground;
