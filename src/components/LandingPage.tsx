import React, { useEffect } from "react";
import "./landing_page/styles.css"; // Ensure your CSS is available here (moved from public/landing_page/styles.css)

const LandingPage: React.FC = () => {
  useEffect(() => {
    // Typing Animation
    const typingText = document.querySelector(".typing");
    const words = ["Track Workouts", "Collect Points", "Earn Rewards"];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
      if (!typingText) return;
      const currentWord = words[wordIndex];

      if (isDeleting) {
        typingText.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typingText.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
      }

      if (!isDeleting && charIndex === currentWord.length) {
        isDeleting = true;
        setTimeout(type, 1500);
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(type, 500);
      } else {
        setTimeout(type, isDeleting ? 50 : 100);
      }
    }

    // Start typing animation
    type();

    // Skill Progress Animation
    const skillProgress = document.querySelectorAll(".skill-progress");

    function animateSkills() {
      skillProgress.forEach((progress) => {
        const value = progress.getAttribute("data-progress");
        if (value) {
          progress.setAttribute("style", `width: ${value}%`);
        }
      });
    }

    // Intersection Observer for skills
    const skillsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateSkills();
            skillsObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    const skillsSections = document.querySelectorAll(".skills");
    skillsSections.forEach((section) => {
      skillsObserver.observe(section);
    });

    // Smooth Scrolling
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        const targetSelector = anchor.getAttribute("href");
        if (targetSelector) {
          const target = document.querySelector(targetSelector);
          if (target) {
            target.scrollIntoView({
              behavior: "smooth",
            });
          }
        }
      });
    });

    // Mobile Navigation
    const navToggle = document.querySelector(".nav-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (navToggle && navLinks) {
      navToggle.addEventListener("click", () => {
        navLinks.classList.toggle("active");
      });
    }

    // Active Navigation Link
    const sections = document.querySelectorAll("section");
    const navItems = document.querySelectorAll(".nav-links a");

    const onScroll = () => {
      let current = "";
      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop - 300) {
          current = section.getAttribute("id") || "";
        }
      });

      navItems.forEach((item) => {
        item.classList.remove("active");
        const href = item.getAttribute("href");
        if (href && href.slice(1) === current) {
          item.classList.add("active");
        }
      });
    };

    window.addEventListener("scroll", onScroll);

    // Form Animation
    const formGroups = document.querySelectorAll(".form-group");
    formGroups.forEach((group) => {
      const input = group.querySelector("input, textarea");
      const label = group.querySelector("label");

      if (input && label) {
        input.addEventListener("focus", () => {
          label.classList.add("active");
        });

        input.addEventListener("blur", () => {
          if ((input as HTMLInputElement).value === "") {
            label.classList.remove("active");
          }
        });
      }
    });
  }, []);

  return (
    <div className="landing-page">
      {/* Animated Background */}
      <div className="animated-background">
        <div className="cube"></div>
        <div className="cube"></div>
        <div className="cube"></div>
        <div className="cube"></div>
        <div className="cube"></div>
      </div>

      {/* Main Content */}
      <div className="container">
        {/* Header Section */}
        <header className="header">
          <div className="logo">FitCoin</div>
          <nav className="nav">
            <div className="nav-toggle">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <ul className="nav-links">
              <li>
                <a href="#home" className="active">
                  Home
                </a>
              </li>
              <li>
                <a href="#work">Work</a>
              </li>
              <li>
                <a href="#about">About</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
            </ul>
          </nav>
        </header>

        {/* Hero Section */}
        <section id="home" className="hero">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="glitch-text" data-text="Rewarding your Fitness">
                Rewarding your Fitness
              </h1>
              <div className="typing-container">
                <span className="typing"></span>
              </div>
              <p className="hero-description">
                Transform your fitness journey into a fun and rewarding
                experience
              </p>
              <div className="cta-buttons">
                <a href="/login" className="btn primary">
                  Sign In
                </a>
                <a href="/signup" className="btn secondary">
                  Sign Up
                </a>
              </div>
            </div>
            <div className="hero-image">
              <div className="circle-container">
                <div className="circle"></div>
                <img
                  src="https://i.imgur.com/T7Am8ag.jpeg?w=500&h=500&fit=crop"
                  alt="Profile"
                  className="profile-img"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Work Section */}
        <section id="work" className="work">
          <h2 className="section-title">Featured Work</h2>
          <div className="work-grid">
            <div className="work-card">
              <div className="work-image">
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=300&fit=crop"
                  alt="Project 1"
                />
              </div>
              <div className="work-content">
                <h3>Project One</h3>
                <p>Web Development</p>
                <a href="#" className="btn small">
                  View Project
                </a>
              </div>
            </div>
            <div className="work-card">
              <div className="work-image">
                <img
                  src="https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=500&h=300&fit=crop"
                  alt="Project 2"
                />
              </div>
              <div className="work-content">
                <h3>Project Two</h3>
                <p>UI/UX Design</p>
                <a href="#" className="btn small">
                  View Project
                </a>
              </div>
            </div>
            <div className="work-card">
              <div className="work-image">
                <img
                  src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&h=300&fit=crop"
                  alt="Project 3"
                />
              </div>
              <div className="work-content">
                <h3>Project Three</h3>
                <p>App Development</p>
                <a href="#" className="btn small">
                  View Project
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="about">
          <h2 className="section-title">About Us</h2>
          <div className="about-content">
            <div className="skills">
              <div className="skill-card">
                <div className="skill-title">Web Development</div>
                <div className="skill-bar">
                  <div className="skill-progress" data-progress="90"></div>
                </div>
              </div>
              <div className="skill-card">
                <div className="skill-title">UI/UX Design</div>
                <div className="skill-bar">
                  <div className="skill-progress" data-progress="85"></div>
                </div>
              </div>
              <div className="skill-card">
                <div className="skill-title">Mobile Development</div>
                <div className="skill-bar">
                  <div className="skill-progress" data-progress="75"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="contact">
          <h2 className="section-title">Get in Touch</h2>
          <div className="contact-container">
            <form className="contact-form">
              <div className="form-group">
                <input type="text" required />
                <label>Name</label>
                <span className="line"></span>
              </div>
              <div className="form-group">
                <input type="email" required />
                <label>Email</label>
                <span className="line"></span>
              </div>
              <div className="form-group">
                <textarea required></textarea>
                <label>Message</label>
                <span className="line"></span>
              </div>
              <button type="submit" className="btn primary">
                Send Message
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
