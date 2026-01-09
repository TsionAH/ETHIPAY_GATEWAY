import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Landing.css';

function Landing() {
  const navigate = useNavigate();

  const handleButtonClick = (e) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <>
      <header className="siteHeader">
        <div className="container">
          <nav className="navBar">
            <div className="logo">
              <i className="fas fa-money-check-alt"></i>
              <div>Ethi<span>Pay</span></div>
            </div>
            <ul className="navLinks">
              <li><a href="#home">Home</a></li>
              <li><a href="#featuresSection">Features</a></li>
              <li><a href="#howItWorks">How It Works</a></li>
              <li><a href="#forUsers">For Users</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
            <a href="#signup" className="ctaButton" onClick={handleButtonClick}>Get Started</a>
          </nav>
        </div>
      </header>
      <section className="hero" id="home">
        <video autoPlay muted loop playsInline aria-hidden="true">
          <source
            src="https://static.vecteezy.com/system/resources/previews/008/872/256/mp4/tech-earth-globalization-in-3d-animation-global-business-dots-on-rotating-planet-video.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
        <div className="container">
          <h1>Ethiopia's Digital Payment Gateway</h1>
          <p>
            Secure, fast, and reliable payment processing for individuals and businesses across Ethiopia.
            Experience smooth transactions with EthiPay.
          </p>
          <div className="heroButtons">
            <a href="#signup" className="btnPrimary" onClick={handleButtonClick}>Start Processing Payments</a>
            <a href="#featuresSection" className="btnSecondary">Learn More</a>
          </div>
        </div>
      </section>
      <section className="featuresSection" id="featuresSection">
        <div className="container">
          <div className="sectionTitle">
            <h2>Why Choose EthiPay?</h2>
           <strong> <p>Our platform is designed with simplicity, security, and speed in mind. Here's what makes us different.</p></strong>
          </div>
          <div className="featuresGrid">
            <article className="featureCard">
              <div className="featureIcon"><i className="fas fa-shield-alt"></i></div>
              <h3>High Security</h3>
              <p>Advanced encryption and secure protocols protect every transaction, giving you complete peace of mind.</p>
            </article>
            <article className="featureCard">
              <div className="featureIcon"><i className="fas fa-bolt"></i></div>
              <h3>Fast Processing</h3>
              <p>Experience instant payment confirmations and real-time transaction tracking with our optimized platform.</p>
            </article>
            <article className="featureCard">
              <div className="featureIcon"><i className="fas fa-mobile-alt"></i></div>
              <h3>Mobile First Design</h3>
              <p>Access your payment dashboard on any device with our fully responsive and intuitive interface.</p>
            </article>
          </div>
        </div>
      </section>
      <section className="howItWorks" id="howItWorks">
        <div className="container">
          <div className="sectionTitle">
            <h2>How EthiPay Works</h2>
            <strong>
            <p>Get started in just three simple steps.It's that easy</p></strong>
          </div>
          <div className="steps">
            <div className="step">
              <div className="stepNumber">1</div>
              <h3>Create Your Account</h3>
              <p>Sign up in seconds with just your basic information.Quick setup without the hassle.</p>
            </div>
            <div className="step">
              <div className="stepNumber">2</div>
              <h3>Connect Payment Methods</h3>
              <p>Securely link your preferred payment options to your EthPay account.</p>
            </div>
            <div className="step">
              <div className="stepNumber">3</div>
              <h3>Start Transacting</h3>
              <p>Make payments, receive funds, and track all your transactions in one convenient dashboard.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="forUsers" id="forUsers">
        <div className="container">
          <div className="sectionTitle">
            <h2>Built for Everyone</h2>
            <strong>
            <p>EthiPay is designed to meet the needs of all users across Ethiopia.</p></strong>
          </div>
          <div className="userCards">
            <article className="userCard">
              <div className="userCardHeader">
                <h3>For Individuals</h3>
                <p>Personal Payment Solutions</p>
              </div>
              <div className="userCardBody">
                <ul>
                  <li><i className="fas fa-check-circle"></i> Pay bills and shop online securely</li>
                  <li><i className="fas fa-check-circle"></i> Send and receive money instantly</li>
                  <li><i className="fas fa-check-circle"></i> Track spending with detailed history</li>
                  <li><i className="fas fa-check-circle"></i> User friendly financial dashboard</li>
                  <li><i className="fas fa-check-circle"></i> Multiple payment method options</li>
                </ul>
              </div>
            </article>
            <article className="userCard">
              <div className="userCardHeader">
                <h3>For Merchants</h3>
                <p>Business Payment Processing</p>
              </div>
              <div className="userCardBody">
                <ul>
                  <li><i className="fas fa-check-circle"></i> Accept payments online and in store</li>
                  <li><i className="fas fa-check-circle"></i> Real-time sales tracking and reporting</li>
                  <li><i className="fas fa-check-circle"></i> Automated invoicing and receipts</li>
                  <li><i className="fas fa-check-circle"></i> Customer payment management</li>
                  <li><i className="fas fa-check-circle"></i> Secure transaction handling</li>
                </ul>
              </div>
            </article>
            <article className="userCard">
              <div className="userCardHeader">
                <h3>For Developers</h3>
                <p>Integration and API Access</p>
              </div>
              <div className="userCardBody">
                <ul>
                  <li><i className="fas fa-check-circle"></i> Easy to use RESTful APIs</li>
                  <li><i className="fas fa-check-circle"></i> Comprehensive documentation</li>
                  <li><i className="fas fa-check-circle"></i> Sandbox environment for testing</li>
                  <li><i className="fas fa-check-circle"></i> SDKs for popular platforms</li>
                  <li><i className="fas fa-check-circle"></i> Dedicated developer support</li>
                </ul>
              </div>
            </article>
          </div>
        </div>
      </section>
      <section className="ctaSection" id="signup">
        <div className="container">
          <h2>Ready to Transform Your Payment Experience?</h2>
          <p>
            Join thousands of users who trust EthiPay for their daily transactions. Sign up today and experience the future of payments in Ethiopia.
          </p>
          <a href="#signup" className="btnPrimary" onClick={handleButtonClick}>Secure Your Transactions Now</a>
        </div>
      </section>
      <footer className="siteFooter" id="contact">
        <div className="container">
          <div className="footerContent">
            <div className="footerColumn">
              <h4>EthiPay</h4>
              <p>
    Revolutionizing payments in Ethiopia with secure, fast transaction solutions built for today's digital economy.
              </p>
              <div className="socialLinks">
                <a href="#"><i className="fab fa-facebook-f"></i></a>
                <a href="#"><i className="fab fa-twitter"></i></a>
                <a href="#"><i className="fab fa-linkedin-in"></i></a>
                <a href="#"><i className="fab fa-instagram"></i></a>
              </div>
            </div>
            <div className="footerColumn">
              <h4>Quick Links</h4>
              <ul className="footerLinks">
                <li><a href="#home">Home</a></li>
                <li><a href="#featuresSection">Features</a></li>
                <li><a href="#howItWorks">How It Works</a></li>
                <li><a href="#forUsers">For Users</a></li>
                <li><a href="#signup">Get Started</a></li>
              </ul>
            </div>
            <div className="footerColumn">
              <h4>Resources</h4>
              <ul className="footerLinks">
                <li><a href="#">Documentation</a></li>
                <li><a href="#">API Reference</a></li>
                <li><a href="#">Developer Guides</a></li>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Blog</a></li>
              </ul>
            </div>
            <div className="footerColumn">
              <h4>Contact Us</h4>
              <ul className="footerLinks">
                <li><i className="fas fa-map-marker-alt"></i> Addis Ababa, Ethiopia</li>
                <li><i className="fas fa-phone"></i> +251 934 208 050</li>
                <li><i className="fas fa-envelope"></i> ethpay.info@gmail.com</li>
              </ul>
            </div>
          </div>
          <div className="copyright">
            <p>&copy; 2026 EthiPay. All rights reserved. | Ethiopian E-payment Gateway</p>
          </div>
        </div>
      </footer>
    </>
  );
}
export default Landing;