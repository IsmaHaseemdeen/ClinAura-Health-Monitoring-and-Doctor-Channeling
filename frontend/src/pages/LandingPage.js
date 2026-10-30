import React, { useEffect, useRef, useState } from "react";
import './LandingPage.css';
import "../App.css";

/* LandingPage renders the public home page shown before user authentication */
function LandingPage({ onNavigate }) {
  /* Tracks the current vertical scroll position for dynamic navbar styling */
  const [scrollY, setScrollY] = useState(0);

  /* Stores which sections have become visible for scroll-based animations */
  const [visibleSections, setVisibleSections] = useState(new Set());

  /* Holds references to page sections observed by the IntersectionObserver */
  const sectionRefs = useRef([]);

  /* Adds and removes the window scroll listener used for navbar effects */
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Observes page sections and marks them visible when they enter the viewport */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.dataset.section]));
          }
        });
      },
      { threshold: 0.1 }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  /* Stores a section element reference at the specified index */
  const addRef = (el, index) => {
    sectionRefs.current[index] = el;
  };

  /* Defines the main feature cards displayed on the landing page */
  const features = [
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      ),
      tag: "AI-Powered",
      title: "Intelligent Symptom Analysis",
      text: "Submit your symptoms and receive structured, evidence-based advisory insights - complete with confidence scores, risk indicators, and category-specific health guidance tailored to your profile.",
      color: "feature-blue"
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
      ),
      tag: "Records",
      title: "Lab Reports & Health Trends",
      text: "Securely upload medical reports and laboratory results. Track biomarker trends across time with clear visual charts designed for easy comprehension by both patients and clinicians.",
      color: "feature-teal"
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      tag: "Appointments",
      title: "Doctor Consultation Booking",
      text: "Schedule consultations with verified general physicians at your convenience. Choose between online or in-person sessions and track your booking status in real time.",
      color: "feature-green"
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
      ),
      tag: "Notifications",
      title: "Smart Follow-Up & Reminders",
      text: "Stay informed at every step - from appointment confirmations and scheduling reminders to health alerts and system updates. Never miss a critical step in your care journey again.",
      color: "feature-purple"
    }
  ];

  /* Defines the guided workflow steps shown to new users */
  const steps = [
    { num: "01", title: "Create Your Profile", desc: "Register and build your personal health profile with medical history, lifestyle notes, and consent preferences.", img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80" },
    { num: "02", title: "Log Symptoms & Records", desc: "Enter current symptoms, upload lab reports, and maintain a comprehensive, time-stamped health record.", img: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80" },
    { num: "03", title: "Receive Advisory Insights", desc: "Our AI engine analyzes your data and presents structured health insights with risk levels and condition categories.", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80" },
    { num: "04", title: "Book a Consultation", desc: "Connect with a verified physician for a structured consultation - online or in-person - when you need professional care.", img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80" },
    { num: "05", title: "Track & Continue Care", desc: "Monitor appointment status, review consultation notes, and maintain continuity across your entire health journey.", img: "https://images.unsplash.com/photo-1576669801775-ff43c5ab079d?w=400&q=80" }
  ];

  /* Defines summary statistics used in the hero section */
  const stats = [
    { value: "98%", label: "Patient satisfaction rate" },
    { value: "3 min", label: "Average symptom analysis time" },
    { value: "24/7", label: "Platform availability" },
    { value: "100%", label: "Secure & encrypted data" }
  ];

  /* Defines testimonial content displayed on the landing page */
  const testimonials = [
    {
      quote: "ClinAura helped me identify a potential issue early. The symptom checker was remarkably thorough, and booking my follow-up consultation took less than two minutes.",
      name: "Amara S.",
      role: "Patient",
      avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80"
    },
    {
      quote: "As a physician, the structured patient records and clear lab trend charts have genuinely improved how I review cases before consultations. This platform is thoughtfully designed.",
      name: "Dr. Rajiv M.",
      role: "General Physician",
      avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&q=80"
    },
    {
      quote: "Managing our clinic's appointments used to take hours daily. ClinAura's admin dashboard reduced that to minutes, with full visibility across the board.",
      name: "Priya N.",
      role: "Clinic Administrator",
      avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&q=80"
    }
  ];

  return (
    <div className="landing-root">
      {/* Top navigation bar for public users */}
      <nav className={`landing-nav ${scrollY > 40 ? "landing-nav--scrolled" : ""}`}>
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <div className="landing-logo-mark">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <span className="landing-logo-text">ClinAura</span>
          </div>

          <div className="landing-nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
          </div>

          <div className="landing-nav-cta">
            <button className="nav-login-btn" onClick={() => onNavigate("login")}>Sign In</button>
            <button className="nav-register-btn" onClick={() => onNavigate("register")}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero section introducing the platform */}
      <section className="hero-section">
        <div className="hero-bg-grid" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              Trusted Health Monitoring Platform
            </div>

            <h1 className="hero-headline">
              Your Health Journey,
              <br />
              <span className="hero-headline-accent">Intelligently Guided</span>
            </h1>

            <p className="hero-subtext">
              ClinAura unifies AI-powered symptom analysis, structured health record management,
              verified doctor consultations, and real-time appointment tracking - giving patients,
              physicians, and administrators a smarter way to manage care.
            </p>

            <div className="hero-actions">
              <button className="hero-btn-primary" onClick={() => onNavigate("register")}>
                Start Your Health Journey
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>

              <button className="hero-btn-secondary" onClick={() => onNavigate("login")}>
                Sign In to Dashboard
              </button>
            </div>

            <div className="hero-trust">
              <div className="hero-trust-avatars">
                {[
                  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=40&q=80",
                  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=40&q=80",
                  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=40&q=80",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&q=80"
                ].map((src, i) => (
                  <img key={i} src={src} alt="" className="trust-avatar" style={{ zIndex: 4 - i }} />
                ))}
              </div>
              <p className="hero-trust-text">Join thousands managing their health with ClinAura</p>
            </div>
          </div>

          {/* Hero image and floating status cards */}
          <div className="hero-visual">
            <div className="hero-img-frame">
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=700&q=85"
                alt="Healthcare professional reviewing patient data"
                className="hero-img"
              />
              <div className="hero-img-overlay" />

              <div className="hero-float-card hero-float-card-1">
                <div className="float-card-icon float-icon-green">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <p className="float-card-label">Appointment Scheduled</p>
                  <p className="float-card-value">Doctor consultation ready</p>
                </div>
              </div>

              <div className="hero-float-card hero-float-card-2">
                <div className="float-card-icon float-icon-blue">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <div>
                  <p className="float-card-label">Risk Level</p>
                  <p className="float-card-value" style={{ color: "#16a34a" }}>Low — Advisory Ready</p>
                </div>
              </div>

              <div className="hero-float-card hero-float-card-3">
                <div className="float-card-icon float-icon-purple">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11l3 3L22 4" />
                  </svg>
                </div>
                <div>
                  <p className="float-card-label">Lab Report Uploaded</p>
                  <p className="float-card-value">CBC Panel — Just now</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero statistics section */}
        <div className="hero-stats-bar">
          {stats.map((s, i) => (
            <div key={i} className="hero-stat">
              <span className="hero-stat-value">{s.value}</span>
              <span className="hero-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features section */}
      <section id="features" className="section-features" ref={(el) => addRef(el, 0)} data-section="features">
        <div className="section-inner">
          <div className={`section-header ${visibleSections.has("features") ? "animate-in" : ""}`}>
            <div className="section-tag">Platform Capabilities</div>
            <h2 className="section-title">Everything You Need,<br />In One Place</h2>
            <p className="section-subtitle">
              ClinAura brings together the tools that matter most - combining AI-driven insights
              with structured clinical workflows and seamless care coordination.
            </p>
          </div>

          <div className={`features-grid ${visibleSections.has("features") ? "animate-in" : ""}`}>
            {features.map((f, i) => (
              <div key={i} className={`feature-card ${f.color}`} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="feature-icon-wrap">{f.icon}</div>
                <div className="feature-tag">{f.tag}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-text">{f.text}</p>
                <div className="feature-arrow">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guided workflow section */}
      <section id="how-it-works" className="section-how" ref={(el) => addRef(el, 1)} data-section="how">
        <div className="how-bg-pattern" />
        <div className="section-inner">
          <div className={`section-header ${visibleSections.has("how") ? "animate-in" : ""}`}>
            <div className="section-tag">Getting Started</div>
            <h2 className="section-title">From Sign-Up to Care,<br />in Five Simple Steps</h2>
            <p className="section-subtitle">
              ClinAura's guided workflow ensures every patient can navigate from their first symptom
              to a confirmed consultation with clarity and confidence.
            </p>
          </div>

          <div className={`steps-grid ${visibleSections.has("how") ? "animate-in" : ""}`}>
            {steps.map((step, i) => (
              <div key={i} className="step-card" style={{ animationDelay: `${i * 0.12}s` }}>
                <div className="step-img-wrap">
                  <img src={step.img} alt={step.title} className="step-img" />
                  <div className="step-img-overlay" />
                  <div className="step-num">{step.num}</div>
                </div>
                <div className="step-content">
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-desc">{step.desc}</p>
                </div>
                {i < steps.length - 1 && <div className="step-connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials section */}
      <section className="section-testimonials" ref={(el) => addRef(el, 3)} data-section="testimonials">
        <div className="section-inner">
          <div className={`section-header ${visibleSections.has("testimonials") ? "animate-in" : ""}`}>
            <div className="section-tag">What People Say</div>
            <h2 className="section-title">Trusted Across the<br />Care Ecosystem</h2>
          </div>

          <div className={`testimonials-grid ${visibleSections.has("testimonials") ? "animate-in" : ""}`}>
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <p className="testimonial-quote">"{t.quote}"</p>
                <div className="testimonial-author">
                  <img src={t.avatar} alt={t.name} className="testimonial-avatar" />
                  <div>
                    <p className="testimonial-name">{t.name}</p>
                    <p className="testimonial-role">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust and privacy section */}
      <section className="section-trust" ref={(el) => addRef(el, 4)} data-section="trust">
        <div className="section-inner">
          <div className={`trust-grid ${visibleSections.has("trust") ? "animate-in" : ""}`}>
            <div className="trust-content">
              <div className="section-tag">Our Commitment</div>
              <h2 className="section-title" style={{ textAlign: "left", margin: "16px 0" }}>
                Built on Privacy,
                <br />
                Transparency & Trust
              </h2>
              <p className="section-subtitle" style={{ textAlign: "left" }}>
                ClinAura is designed with your data security as a first principle. Every symptom report,
                lab record, and consultation note is protected with industry-standard encryption.
                Advisory outputs are clearly labeled as informational - never diagnostic - so you
                can make informed decisions with your care team.
              </p>

              <div className="trust-badges">
                <div className="trust-badge">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>Encrypted Storage</span>
                </div>

                <div className="trust-badge">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>24/7 Availability</span>
                </div>

                <div className="trust-badge">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
                  </svg>
                  <span>Verified Physicians</span>
                </div>

                <div className="trust-badge">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  <span>Non-Diagnostic Advisory</span>
                </div>
              </div>
            </div>

            <div className="trust-visual">
              <img
                src="https://images.unsplash.com/photo-1576671081837-49000212a370?w=600&q=80"
                alt="Medical data security and privacy"
                className="trust-img"
              />
              <div className="trust-img-overlay" />
            </div>
          </div>
        </div>
      </section>

      {/* Final call-to-action section */}
      <section className="section-cta" ref={(el) => addRef(el, 5)} data-section="cta">
        <div className="cta-bg-orb-1" />
        <div className="cta-bg-orb-2" />

        <div className={`section-inner cta-inner ${visibleSections.has("cta") ? "animate-in" : ""}`}>
          <div className="cta-icon-wrap">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>

          <h2 className="cta-title">Start Your Health Journey Today</h2>
          <p className="cta-subtitle">
            Join thousands of patients, physicians, and administrators using ClinAura to
            bring clarity, structure, and intelligence to healthcare - one interaction at a time.
          </p>

          <div className="cta-actions">
            <button className="cta-btn-primary" onClick={() => onNavigate("register")}>
              Create Free Account
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>

            <button className="cta-btn-secondary" onClick={() => onNavigate("login")}>
              Sign In
            </button>
          </div>

          <p className="cta-note">No credit card required · Advisory use only · Secure & encrypted</p>
        </div>
      </section>

      {/* Public footer section */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="landing-logo">
              <div className="landing-logo-mark">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <span className="landing-logo-text" style={{ color: "white" }}>ClinAura</span>
            </div>

            <p className="footer-tagline">
              Intelligent health monitoring and doctor channeling - designed for the modern care journey.
            </p>
          </div>

          <div className="footer-links">
            <p className="footer-disclaimer">
              ClinAura provides advisory health insights for informational purposes only.
              All outputs are non-diagnostic. Always consult a qualified healthcare professional
              for medical decisions. Advisory use only.
            </p>

            <div className="footer-bottom">
              <span>© 2025 ClinAura. All rights reserved.</span>
              <div className="footer-nav">
                <button className="footer-link" onClick={() => onNavigate("login")}>Sign In</button>
                <button className="footer-link" onClick={() => onNavigate("register")}>Register</button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;