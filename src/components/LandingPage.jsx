import React from 'react';
import { Utensils, Zap, ShieldCheck, Sparkles, QrCode, ArrowRight, Mic, Cpu, Users, TrendingUp, Clock, Globe, CheckCircle2 } from 'lucide-react';
import './LandingPage.css';

const LandingPage = ({ onStartDemo, onAdminLogin }) => {
  return (
    <div className="landing-container animate-fade-in">

      {/* 🔥 Urgency Banner */}
      <div className="urgency-banner">
        <span className="fire-icon">🔥</span>
        <span><strong>Jaipur Beta Launch</strong> – First 10 Restaurants Get Free Setup & Integration</span>
      </div>

      {/* Background Particles/Blobs */}
      <div className="mesh-gradient"></div>
      <div className="floating-sphere sphere-1"></div>
      <div className="floating-sphere sphere-2"></div>

      {/* 🧭 Navigation */}
      <nav className="premium-nav">
        <div className="brand">
          <div className="logo-box">
            <Cpu className="cpu-icon" size={24} />
          </div>
          <div className="brand-text">
            <span className="brand-name">ROBO</span>
            <span className="brand-tag">INTELLIGENCE</span>
          </div>
        </div>
        <div className="nav-actions">
          <button className="nav-link" onClick={onAdminLogin}>Owner Login</button>
          <button className="nav-cta" onClick={onStartDemo}>Try Robo Live</button>
        </div>
      </nav>

      <main className="main-content">

        {/* 🚀 Hero Section */}
        <section className="hero-grid">
          <div className="hero-text-block">
            <div className="neural-badge">
              <div className="pulse-dot"></div>
              <span>Sentient Waiter v2.5 Online</span>
            </div>

            <h1>No Waiter Needed.<br /> <span className="gradient-text">Just Talk to Robo.</span></h1>
            <p className="hero-sub">
              India's first AI Voice Waiter. Speak naturally in Hinglish, order effortlessly, and experience zero friction.
            </p>

            <div className="hero-buttons">
              <button className="btn-glow" onClick={onStartDemo}>
                <span>Try Cyber Chef Demo</span>
                <ArrowRight size={18} />
              </button>
            </div>

            <div className="social-proof-mini">
              <div className="avatars">
                <div className="avatar a1"></div>
                <div className="avatar a2"></div>
                <div className="avatar a3"></div>
              </div>
              <p>Trusted by <strong>20+</strong> Restaurants in Jaipur</p>
            </div>
          </div>

          {/* 🎥 Live Demo Chat UI */}
          <div className="chat-demo-wrapper">
            <div className="chat-mockup glass-panel">
              <div className="mockup-header">
                <div className="dots"><span></span><span></span><span></span></div>
                <div className="title">Table 5 - Live Order</div>
              </div>
              <div className="chat-body">
                <div className="msg user-msg">
                  <span>"Ek cold coffee bhejo"</span>
                </div>
                <div className="msg bot-msg typing">
                  <div className="typing-dots"><span></span><span></span><span></span></div>
                </div>
                <div className="msg bot-msg">
                  <span>"Cold coffee add kar di 🙂 Aur fries try karoge?"</span>
                </div>
                <div className="msg user-msg delayed">
                  <span>"Haan ek fries bhi kar do"</span>
                </div>
              </div>
              <div className="mockup-footer">
                <Mic size={20} color="#00f2ff" className="mic-pulse" />
                <span>Listening...</span>
              </div>
            </div>
          </div>
        </section>

        {/* 📈 Stats Banner */}
        <section className="stats-banner glass-panel">
          <div className="stat-item">
            <h2>5,000+</h2>
            <p>Orders Processed</p>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <h2>99%</h2>
            <p>Order Accuracy</p>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <h2>18%</h2>
            <p>Avg. Ticket Increase</p>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <h2>0</h2>
            <p>App Downloads Needed</p>
          </div>
        </section>

        {/* 📱 How It Works (B2C Flow) */}
        <section className="how-it-works">
          <div className="section-header">
            <h2>Zero Friction Ordering</h2>
            <p>The perfect customer experience in 3 simple steps.</p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-num">1</div>
              <QrCode size={40} className="step-icon" />
              <h3>Scan QR</h3>
              <p>Customer scans the table QR. No app required.</p>
            </div>
            <div className="step-card">
              <div className="step-num">2</div>
              <Mic size={40} className="step-icon" />
              <h3>Talk Naturally</h3>
              <p>Speak orders in Hindi, English, or Hinglish.</p>
            </div>
            <div className="step-card">
              <div className="step-num">3</div>
              <Utensils size={40} className="step-icon" />
              <h3>Food Arrives</h3>
              <p>Order syncs instantly to KOT. Food is served.</p>
            </div>
          </div>
        </section>

        {/* 💰 Restaurant Owner Benefits (B2B) */}
        <section className="b2b-benefits">
          <div className="section-header">
            <h2>Why Owners Love Robo</h2>
            <p>Transform your restaurant's bottom line.</p>
          </div>
          <div className="benefits-grid">
            <div className="benefit-card">
              <Clock size={32} className="b-icon" />
              <h3>40% Faster Ordering</h3>
              <p>Eliminate waiting times for waiters. Customers order the moment they are ready.</p>
            </div>
            <div className="benefit-card">
              <Users size={32} className="b-icon" />
              <h3>30% Less Staff Load</h3>
              <p>Free up your staff to focus on hospitality and serving, rather than taking orders.</p>
            </div>
            <div className="benefit-card">
              <TrendingUp size={32} className="b-icon" />
              <h3>Automatic Upselling</h3>
              <p>Robo never forgets to ask "Would you like fries with that?", boosting sales by 18%.</p>
            </div>
            <div className="benefit-card">
              <Globe size={32} className="b-icon" />
              <h3>Multi-Language</h3>
              <p>Flawless Hinglish, Hindi, and English support. Connects with every customer.</p>
            </div>
          </div>
        </section>

        {/* 🧠 Security & Tech Stack */}
        <section className="tech-stack glass-panel">
          <div className="tech-content">
            <h2>Enterprise-Grade Tech</h2>
            <ul className="tech-list">
              <li><CheckCircle2 size={20} color="#00f2ff" /> Powered by <strong>OpenAI Realtime</strong></li>
              <li><CheckCircle2 size={20} color="#00f2ff" /> Ultra-fast response <strong>&lt; 1 sec</strong></li>
              <li><CheckCircle2 size={20} color="#00f2ff" /> Secure Table Tokens</li>
              <li><CheckCircle2 size={20} color="#00f2ff" /> UPI Payment Ready (Coming Soon)</li>
            </ul>
          </div>
          <div className="tech-visual">
            <Cpu size={100} color="#0072ff" className="glow-icon" />
          </div>
        </section>

        {/* ⭐ Testimonials */}
        <section className="testimonials">
          <div className="testimonial-card glass-panel">
            <p className="quote">"Customers love talking to Robo. Our table turnaround time has dropped drastically, and tip averages are up because the experience is magical."</p>
            <div className="author">
              <div className="author-img"></div>
              <div>
                <strong>Owner, Premium Cafe</strong>
                <span>Jaipur, Rajasthan</span>
              </div>
            </div>
          </div>
        </section>

        {/* ❓ FAQ */}
        <section className="faq-section">
          <h2>Quick Questions</h2>
          <div className="faq-grid">
            <div className="faq-item glass-panel">
              <h4>Do customers need to download an app?</h4>
              <p>No. They just scan a QR code using their normal phone camera and the web app opens instantly.</p>
            </div>
            <div className="faq-item glass-panel">
              <h4>Does it understand Indian accents?</h4>
              <p>Yes. Robo is specifically trained on Indian accents and seamlessly understands a mix of Hindi and English (Hinglish).</p>
            </div>
            <div className="faq-item glass-panel">
              <h4>How does it connect to our kitchen?</h4>
              <p>Orders are pushed instantly to an Admin Dashboard that your kitchen staff can view in real-time.</p>
            </div>
          </div>
        </section>

        {/* 📞 Bottom CTA */}
        <section className="bottom-cta">
          <h2>Want Robo In Your Restaurant?</h2>
          <p>Join the future of dining today. Get a free demo and setup for your cafe.</p>
          <button className="btn-glow large-btn" onClick={onStartDemo}>
            <span>Try Robo Live Now</span>
            <ArrowRight size={20} />
          </button>
        </section>

      </main>

      <footer className="footer-slim">
        <div className="footer-divider"></div>
        <div className="footer-wrap">
          <div className="footer-brand">
            <strong>ROBO AI</strong>
            <p>Sentient Hospitality Solutions</p>
          </div>
          <div className="social-links">
            <span>Instagram</span>
            <span>LinkedIn</span>
            <span>Contact Sales</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
