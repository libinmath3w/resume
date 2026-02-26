'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';

// Add WebGL detector function
const isWebGLAvailable = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
};

const Skills = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [webGLSupported, setWebGLSupported] = useState(true);
  
  // Three.js animation setup
  useEffect(() => {
    // Check for WebGL support
    if (!isWebGLAvailable()) {
      setWebGLSupported(false);
      return;
    }
    
    if (!canvasRef.current) return;
    
    try {
      // Initialize Three.js scene
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      
      // Create renderer with error handling
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current,
          alpha: true,
          antialias: true,
          powerPreference: 'default',
          failIfMajorPerformanceCaveat: false
        });
      } catch (error) {
        console.error("Error creating WebGL renderer:", error);
        setWebGLSupported(false);
        return;
      }
      
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      
      // Create particles for background
      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = 500;
      
      const positionArray = new Float32Array(particlesCount * 3);
      const colorArray = new Float32Array(particlesCount * 3);
      
      for (let i = 0; i < particlesCount * 3; i++) {
        // Position
        positionArray[i] = (Math.random() - 0.5) * 10;
        
        // Color
        if (i % 3 === 0) {
          // Red component (for primary color)
          colorArray[i] = 0.5 + Math.random() * 0.2;
        } else if (i % 3 === 1) {
          // Green component (for secondary color)
          colorArray[i] = 0.2 + Math.random() * 0.2;
        } else {
          // Blue component (for accent color)
          colorArray[i] = 0.7 + Math.random() * 0.3;
        }
      }
      
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
      particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
      
      // Material for particles
      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.02,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        alphaTest: 0.001,
        opacity: 0.8
      });
      
      // Create points
      const particles = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particles);
      
      // Position camera
      camera.position.z = 3;
      
      // Handle window resize
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      
      window.addEventListener('resize', handleResize);
      
      // Animation loop
      const clock = new THREE.Clock();
      
      const animate = () => {
        const elapsedTime = clock.getElapsedTime();
        
        // Rotate particles
        particles.rotation.y = elapsedTime * 0.05;
        particles.rotation.x = elapsedTime * 0.03;
        
        // Render
        renderer.render(scene, camera);
        
        // Call animate again on the next frame
        window.requestAnimationFrame(animate);
      };
      
      animate();
      
      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        scene.remove(particles);
        particlesGeometry.dispose();
        particlesMaterial.dispose();
        renderer.dispose();
      };
    } catch (error) {
      console.error("Error in Three.js setup:", error);
      setWebGLSupported(false);
    }
  }, []);

  const skillCategories = [
    {
      title: "Programming Languages",
      icon: "💻",
      skills: ["Node.js", "TypeScript", "JavaScript", "Python", "GoLang", "Java", "C#"]
    },
    {
      title: "Backend Frameworks",
      icon: "⚙️",
      skills: ["Express.js", "NestJS", "GraphQL", "REST APIs"]
    },
    {
      title: "Cloud & DevOps",
      icon: "☁️",
      skills: [
        "AWS (EKS, ECS, Lambda, API Gateway, IAM, S3, CloudFormation, CDK)",
        "Azure (AKS, Functions, App Services, Blob Storage, Event Grid, Service Bus)"
      ]
    },
    {
      title: "Infrastructure as Code",
      icon: "🏗️",
      skills: ["AWS CDK (TypeScript)", "Terraform", "CloudFormation", "ARM Templates"]
    },
    {
      title: "Containerization & Orchestration",
      icon: "🐳",
      skills: ["Docker", "Kubernetes", "Podman", "Istio", "Helm"]
    },
    {
      title: "Monitoring & Logging",
      icon: "📊",
      skills: ["Prometheus", "Grafana", "CloudWatch", "Azure Monitor", "ELK Stack"]
    },
    {
      title: "CI/CD & Automation",
      icon: "🔄",
      skills: ["Jenkins", "GitHub Actions", "GitLab CI/CD", "Bamboo", "ArgoCD", "GitOps", "Azure DevOps Pipelines"]
    },
    {
      title: "Security & Authentication",
      icon: "🔒",
      skills: ["HashiCorp Vault", "EJBCA", "Certbot", "ACM", "OAuth2", "JWT"]
    },
    {
      title: "Databases",
      icon: "🗃️",
      skills: ["MySQL", "PostgreSQL", "DynamoDB", "MongoDB", "CosmosDB", "PLSQL"]
    },
    {
      title: "Version Control & Collaboration",
      icon: "🤝",
      skills: ["Git", "Bitbucket", "Jira", "Confluence"]
    }
  ];

  // Animation variants for Framer Motion
  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants: any = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };
  
  const tagVariants: any = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };
  
  const skillItemVariants: any = {
    initial: { 
      x: 0, 
      opacity: 1 
    },
    animate: { 
      x: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    },
    hover: { 
      x: 5, 
      opacity: 1,
      color: "var(--color-accent)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 10
      } 
    }
  };

  // Create a fallback background style for when WebGL is not supported
  const fallbackBackgroundStyle = {
    background: 'linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.05) 0%, rgba(var(--color-secondary-rgb), 0.05) 100%)'
  };

  return (
    <section id="skills" className="section relative overflow-hidden py-24" style={!webGLSupported ? fallbackBackgroundStyle : {}}>
      {/* Three.js Canvas Background - Only render if WebGL is supported */}
      {webGLSupported && (
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full -z-10"
        />
      )}
      
      {/* Fallback background for non-WebGL browsers */}
      {!webGLSupported && (
        <div className="absolute inset-0 w-full h-full -z-10 bg-gradient-to-br from-primary/5 to-secondary/5" />
      )}
      
      <div className="container-custom relative z-10">
        <motion.div 
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.span 
            className="inline-block px-4 py-1.5 mb-4 bg-primary/10 rounded-full text-primary text-sm font-semibold backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            My Expertise
          </motion.span>
          <h2 className="heading-lg mb-4 inline-block bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Technical Skills
          </h2>
          <p className="text-xl text-gray-dark max-w-3xl mx-auto">
            Diverse technical expertise spanning programming languages, frameworks, cloud platforms, and tools
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {skillCategories.map((category, index) => (
            <motion.div 
              key={index} 
              variants={itemVariants}
              className={`card card-animated backdrop-blur-lg bg-opacity-40 hover:bg-opacity-70 border border-gray/20 hover:border-primary/40 transition-all duration-500 overflow-hidden ${activeCategory === index ? 'border-primary/60 bg-opacity-60 transform -translate-y-1' : ''}`}
              onMouseEnter={() => setActiveCategory(index)}
              onMouseLeave={() => setActiveCategory(null)}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl transition-all duration-300">
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: activeCategory === index ? 360 : 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  >
                    {category.icon}
                  </motion.div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                    {category.title}
                  </h3>
                  <ul className="space-y-3">
                    {category.skills.map((skill, idx) => (
                      <motion.li 
                        key={idx} 
                        initial="initial"
                        animate={activeCategory === index ? "hover" : "initial"}
                        variants={skillItemVariants}
                        className="relative pl-5 before:absolute before:left-0 before:top-2.5 before:h-1.5 before:w-1.5 before:rounded-full before:bg-secondary transition-all duration-300"
                        style={{
                          paddingLeft: activeCategory === index ? '8px' : '20px',
                          transform: activeCategory === index ? 'translateX(5px)' : 'translateX(0px)'
                        }}
                      >
                        {skill}
                        {activeCategory === index && (
                          <motion.div
                            className="absolute left-0 top-2.5 h-1.5 w-1.5 rounded-full bg-accent"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-bl-full transform -translate-y-1/2 translate-x-1/2 opacity-70 blur-lg"></div>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          className="flex justify-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <motion.div 
            className="inline-flex flex-wrap justify-center gap-3 p-4 rounded-xl bg-background/30 backdrop-blur-lg border border-gray/20"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={tagVariants} className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm hover:bg-primary/20 transition-colors cursor-pointer">Node.js</motion.div>
            <motion.div variants={tagVariants} className="px-4 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm hover:bg-secondary/20 transition-colors cursor-pointer">TypeScript</motion.div>
            <motion.div variants={tagVariants} className="px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm hover:bg-accent/20 transition-colors cursor-pointer">AWS</motion.div>
            <motion.div variants={tagVariants} className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm hover:bg-primary/20 transition-colors cursor-pointer">Docker</motion.div>
            <motion.div variants={tagVariants} className="px-4 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm hover:bg-secondary/20 transition-colors cursor-pointer">Kubernetes</motion.div>
            <motion.div variants={tagVariants} className="px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm hover:bg-accent/20 transition-colors cursor-pointer">CI/CD</motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Skills; 