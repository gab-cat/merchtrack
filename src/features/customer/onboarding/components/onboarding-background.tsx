'use client';

import React, { useRef, useEffect } from 'react';

interface OnboardingBackgroundProps {
  density?: number;
  connectionDistance?: number;
  primaryColor?: string;
  secondaryColor?: string;
  particleSize?: number;
  speed?: number;
  interactive?: boolean;
}

const OnboardingBackground: React.FC<OnboardingBackgroundProps> = ({
  density = 50,
  connectionDistance = 150,
  primaryColor = '#2C59DD',
  secondaryColor = '#2C59DD',
  particleSize = 1.5,
  speed = 0.5,
  interactive = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrameId: number;
    let particles: Particle[] = [];
    const mouse = { x: 0, y: 0, radius: interactive ? 100 : 0 };
    
    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Create ecommerce-themed background
      createEcommerceBackground();
      
      initParticles();
    };
    
    // Create ecommerce-themed background with primary color
    const createEcommerceBackground = () => {
      if (!ctx || !canvas) return;
      
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Create color gradient for background
      const gradientBg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradientBg.addColorStop(0, '#f8f9fe');
      gradientBg.addColorStop(1, '#f0f4fd');
      ctx.fillStyle = gradientBg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw ecommerce-themed elements with primary color
      
      // Define primary color with different opacity levels
      const primaryLight = 'rgba(44, 89, 219, 0.2)';
      const primaryMedium = 'rgba(44, 89, 219, 0.5)';
      
      // 1. Draw abstract shopping bag in bottom right
      ctx.fillStyle = primaryLight;
      ctx.beginPath();
      const bagX = canvas.width * 0.85;
      const bagY = canvas.height * 0.75;
      const bagWidth = 280;
      const bagHeight = 320;
      
      // Bag body
      ctx.moveTo(bagX - bagWidth/2, bagY - bagHeight/3);
      ctx.quadraticCurveTo(bagX, bagY - bagHeight/2.5, bagX + bagWidth/2, bagY - bagHeight/3);
      ctx.lineTo(bagX + bagWidth/2, bagY + bagHeight/2);
      ctx.quadraticCurveTo(bagX, bagY + bagHeight/1.8, bagX - bagWidth/2, bagY + bagHeight/2);
      ctx.closePath();
      ctx.fill();
      
      // Bag handle - left
      ctx.beginPath();
      ctx.moveTo(bagX - bagWidth/3, bagY - bagHeight/3);
      ctx.quadraticCurveTo(bagX - bagWidth/2.5, bagY - bagHeight/1.5, bagX - bagWidth/4, bagY - bagHeight/1.1);
      ctx.strokeStyle = primaryMedium;
      ctx.lineWidth = 12;
      ctx.stroke();
      
      // Bag handle - right
      ctx.beginPath();
      ctx.moveTo(bagX + bagWidth/3, bagY - bagHeight/3);
      ctx.quadraticCurveTo(bagX + bagWidth/2.5, bagY - bagHeight/1.5, bagX + bagWidth/4, bagY - bagHeight/1.1);
      ctx.stroke();
      
      // 2. Draw abstract product grid in top left
      const gridSize = 200;
      const gridX = canvas.width * 0.2;
      const gridY = canvas.height * 0.2;
      const cellSize = gridSize / 4;
      
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if ((i + j) % 2 === 0) { // Alternate pattern
            ctx.fillStyle = primaryLight;
            ctx.fillRect(
              gridX + i * cellSize - gridSize/2,
              gridY + j * cellSize - gridSize/2,
              cellSize,
              cellSize
            );
          }
        }
      }
      
      // 3. Draw abstract shopping cart in top right
      const cartX = canvas.width * 0.85;
      const cartY = canvas.height * 0.15;
      const cartSize = 180;
      
      // Cart body
      ctx.fillStyle = primaryLight;
      ctx.beginPath();
      ctx.moveTo(cartX - cartSize/2, cartY);
      ctx.lineTo(cartX + cartSize/2, cartY);
      ctx.lineTo(cartX + cartSize/3, cartY + cartSize/2);
      ctx.lineTo(cartX - cartSize/3, cartY + cartSize/2);
      ctx.closePath();
      ctx.fill();
      
      // Cart wheels
      ctx.beginPath();
      ctx.arc(cartX - cartSize/4, cartY + cartSize/1.5, cartSize/10, 0, Math.PI * 2);
      ctx.fillStyle = primaryMedium;
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(cartX + cartSize/4, cartY + cartSize/1.5, cartSize/10, 0, Math.PI * 2);
      ctx.fill();
      
      // 4. Draw curved payment/checkout flow line
      ctx.beginPath();
      ctx.moveTo(0, canvas.height * 0.4);
      ctx.bezierCurveTo(
        canvas.width * 0.3, canvas.height * 0.3,
        canvas.width * 0.6, canvas.height * 0.7,
        canvas.width, canvas.height * 0.5
      );
      ctx.strokeStyle = primaryLight;
      ctx.lineWidth = 80;
      ctx.stroke();
      
      // 5. Draw abstract price tags
      drawPriceTag(canvas.width * 0.35, canvas.height * 0.75, 80, primaryMedium);
      drawPriceTag(canvas.width * 0.65, canvas.height * 0.3, 60, primaryLight);
    };
    
    // Helper function to draw a price tag
    const drawPriceTag = (x: number, y: number, size: number, color: string) => {
      if (!ctx) return;
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x, y - size/2);
      ctx.lineTo(x + size/2, y);
      ctx.lineTo(x, y + size/2);
      ctx.lineTo(x - size/2, y);
      ctx.closePath();
      ctx.fill();
      
      // Tag hole
      ctx.beginPath();
      ctx.arc(x, y, size/6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fill();
    };
    
    // Handle mouse move
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    class Particle {
      x: number;
      y: number;
      directionX: number;
      directionY: number;
      size: number;
      color: string;
      
      constructor(x: number, y: number, directionX: number, directionY: number, size: number, color: string) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
      }
      
      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
      
      update() {
        if (!canvas) return;
        
        // Boundary collision detection
        if (this.x > canvas.width || this.x < 0) {
          this.directionX = -this.directionX;
        }
        if (this.y > canvas.height || this.y < 0) {
          this.directionY = -this.directionY;
        }
        
        // Mouse interaction
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius) {
          if (mouse.x < this.x && this.x < canvas.width - this.size * 10) {
            this.x += 1;
          }
          if (mouse.x > this.x && this.x > this.size * 10) {
            this.x -= 1;
          }
          if (mouse.y < this.y && this.y < canvas.height - this.size * 10) {
            this.y += 1;
          }
          if (mouse.y > this.y && this.y > this.size * 10) {
            this.y -= 1;
          }
        }
        
        // Move particle
        this.x += this.directionX * speed;
        this.y += this.directionY * speed;
        
        this.draw();
      }
    }
    
    function initParticles() {
      particles = [];
      const particleCount = Math.min(Math.floor((canvas?.width ?? 0) * (canvas?.height ?? 0) / (1000000 / density)), 200);
      
      for (let i = 0; i < particleCount; i++) {
        const size = Math.random() * particleSize + 1;
        const x = Math.random() * ((canvas?.width ?? 0) - size * 2) - (size * 2) + size * 2;
        const y = Math.random() * ((canvas?.height ?? 0) - size * 2) - (size * 2) + size * 2;
        const directionX = (Math.random() - 0.5) * speed;
        const directionY = (Math.random() - 0.5) * speed;
        
        // Alternate between primary and secondary colors
        const color = i % 4 === 0 ? primaryColor : secondaryColor;
        
        particles.push(new Particle(x, y, directionX, directionY, size, color));
      }
    }
    
    function connectParticles() {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < connectionDistance) {
            if (!ctx) return;
            const opacity = 1 - (distance / connectionDistance);
            ctx.strokeStyle = `rgba(44, 89, 219, ${opacity * 0.75})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    }
    
    function animate() {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Redraw the background pattern
      createEcommerceBackground();
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
      }
      
      connectParticles();
      
      animationFrameId = requestAnimationFrame(animate);
    }
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    
    handleResize();
    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [connectionDistance, density, interactive, particleSize, primaryColor, secondaryColor, speed]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 -z-10 flex h-full"
      style={{ opacity: 1 }}
    />
  );
};

export default OnboardingBackground;