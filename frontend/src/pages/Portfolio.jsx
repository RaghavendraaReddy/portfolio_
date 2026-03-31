import React, { useEffect, useRef } from 'react';
import { ArrowRight, Rocket, Smartphone, ExternalLink, Mail, Github, Linkedin, Globe } from 'lucide-react';
import './Portfolio.css';

const Portfolio = () => {
  const sectionsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const projects = [
    {
      id: 1,
      title: 'Alt DRX Platform',
      description: 'Performance optimization & backend migration from Laravel to Node.js',
      tags: ['Node.js', 'Sequelize', 'Vue.js', 'MySQL'],
      link: '#',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop'
    },
    {
      id: 2,
      title: 'Icarus E-commerce',
      description: 'Full-featured e-commerce platform with cart, wishlist & order management',
      tags: ['React', 'JavaScript', 'CSS'],
      link: 'https://github.com/rahul5564/p-deploy',
      image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&h=600&fit=crop'
    },
    {
      id: 3,
      title: 'TripGo API',
      description: 'RESTful API for travel destination management',
      tags: ['Node.js', 'Express', 'REST API'],
      link: '#',
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop'
    },
    {
      id: 4,
      title: 'Real-time Video Platform',
      description: 'Scalable distributed system for 2D/3D video calling',
      tags: ['React', 'Redux', 'Docker', 'Cloud'],
      link: '#',
      image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop'
    }
  ];

  return (
    <div className="portfolio">
      {/* Navigation */}
      <nav className="portfolio-nav">
        <button onClick={() => scrollToSection('hero')} className="nav-logo">
          <Rocket size={24} />
        </button>
        <button onClick={() => scrollToSection('contact')} className="nav-mobile">
          <Smartphone size={24} />
        </button>
      </nav>

      {/* Hero Section */}
      <section 
        id="hero" 
        className="hero-section fade-in" 
        ref={(el) => (sectionsRef.current[0] = el)}
      >
        <div className="hero-content">
          <div className="hero-image-container">
            <div className="hero-image-placeholder">
              <div className="avatar-illustration">
                <div className="avatar-head"></div>
                <div className="avatar-body"></div>
              </div>
            </div>
          </div>
          <h1 className="hero-title">
            RAGHAVENDRA
            <br />
            <span className="hero-title-accent">REDDY</span>
          </h1>
          <p className="hero-subtitle">Software Engineer / Full-Stack Developer</p>
          <button 
            onClick={() => scrollToSection('contact')} 
            className="hero-cta"
          >
            Get in touch
            <ArrowRight size={20} />
          </button>
        </div>
        <div className="scroll-indicator" onClick={() => scrollToSection('about')}>
          <div className="scroll-icon"></div>
        </div>
      </section>

      {/* About Section */}
      <section 
        id="about" 
        className="about-section fade-in" 
        ref={(el) => (sectionsRef.current[1] = el)}
      >
        <div className="section-header-sticky">
          <h2 className="section-title-small">RAGHAVENDRA <span className="title-accent">REDDY</span></h2>
          <p className="section-subtitle-small">Software Engineer / Full-Stack Developer</p>
        </div>
        <div className="about-content">
          <h2 className="about-heading">
            Hi, I'm Raghavendra, a software
            <br />
            engineer and full-stack developer.
          </h2>
          <p className="about-text">
            With two years of experience developing and optimizing backend systems using Node.js, 
            Laravel, and Vue.js. I specialize in performance analysis and improving system responsiveness 
            through ORM optimizations and seamless migrations.
          </p>
          <p className="about-text">
            Passionate about building observability solutions and cloud infrastructure tools to enhance 
            platform reliability. I work with modern technologies including TypeScript, React, Next.js, 
            and distributed systems.
          </p>
          <div className="skills-grid">
            <div className="skill-category">
              <h3>Frontend</h3>
              <p>React, Vue.js, Next.js, TypeScript</p>
            </div>
            <div className="skill-category">
              <h3>Backend</h3>
              <p>Node.js, Express, Laravel, REST APIs</p>
            </div>
            <div className="skill-category">
              <h3>Database</h3>
              <p>MySQL, MongoDB, Sequelize, Mongoose</p>
            </div>
            <div className="skill-category">
              <h3>DevOps</h3>
              <p>Docker, Cloud Computing, Distributed Systems</p>
            </div>
          </div>
        </div>
        <div className="scroll-indicator" onClick={() => scrollToSection('work')}>
          <div className="scroll-icon"></div>
        </div>
      </section>

      {/* Latest Work Section */}
      <section 
        id="work" 
        className="work-section fade-in" 
        ref={(el) => (sectionsRef.current[2] = el)}
      >
        <h2 className="section-title">LATEST WORK</h2>
        <div className="projects-grid">
          {projects.map((project, index) => (
            <div 
              key={project.id} 
              className="project-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="project-image">
                <img src={project.image} alt={project.title} />
                <div className="project-overlay">
                  <a 
                    href={project.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="project-link"
                  >
                    <ExternalLink size={24} />
                  </a>
                </div>
              </div>
              <div className="project-info">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>
                <div className="project-tags">
                  {project.tags.map((tag, i) => (
                    <span key={i} className="project-tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="scroll-indicator" onClick={() => scrollToSection('contact')}>
          <div className="scroll-icon"></div>
        </div>
      </section>

      {/* Contact Section */}
      <section 
        id="contact" 
        className="contact-section fade-in" 
        ref={(el) => (sectionsRef.current[3] = el)}
      >
        <h2 className="contact-title">
          GET IN <span className="title-accent">TOUCH</span>
        </h2>
        <a href="mailto:sraghavendra5564@gmail.com" className="contact-email">
          <Mail size={20} />
          sraghavendra5564@gmail.com
        </a>
        <div className="contact-links">
          <a 
            href="https://github.com/RaghavendraaReddy" 
            target="_blank" 
            rel="noopener noreferrer"
            className="contact-link"
          >
            <Github size={24} />
            GitHub
          </a>
          <a 
            href="https://linkedin.com/in/raghavendraareddy" 
            target="_blank" 
            rel="noopener noreferrer"
            className="contact-link"
          >
            <Linkedin size={24} />
            LinkedIn
          </a>
          <a 
            href="https://rahul96.netlify.app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="contact-link"
          >
            <Globe size={24} />
            Portfolio
          </a>
        </div>
        <p className="contact-footer">Bengaluru, India • Available for opportunities</p>
      </section>
    </div>
  );
};

export default Portfolio;