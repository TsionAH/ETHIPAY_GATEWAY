import { Link } from "react-router-dom";
import { isAuthenticated } from "../service/authService";

function HomePage() {
  const authenticated = isAuthenticated();
  
  // Primary color scheme
  const primaryGradient = "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600";
  const primaryGradientLight = "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500";
  const secondaryGradient = "bg-gradient-to-r from-cyan-500 to-blue-600";
  const darkGradient = "bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Modern Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className={`w-10 h-10 ${primaryGradient} rounded-lg flex items-center justify-center`}>
                <span className="text-white text-lg font-bold">EP</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Ethi<span className="font-black">Pay</span>
              </h1>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                Home
              </a>
              <a href="#features" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                How It Works
              </a>
              <a href="#for-users" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                For Users
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {authenticated ? (
                <Link
                  to="/dashboard"
                  className={`${primaryGradient} text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all`}
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className={`${primaryGradient} text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all`}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={`relative min-h-screen flex items-center justify-center overflow-hidden pt-16 ${darkGradient}`} id="home">
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Ethiopia's Digital
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
              Payment Gateway
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Secure, fast, and reliable payment processing for individuals and businesses across Ethiopia.
            Experience smooth transactions with EthiPay.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {!authenticated ? (
              <>
                <Link
                  to="/register"
                  className={`${primaryGradient} text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300`}
                >
                  Start Processing Payments
                </Link>
                <Link
                  to="/login"
                  className="bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/30 transition-all"
                >
                  Sign In to Dashboard
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard"
                className={`${secondaryGradient} text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300`}
              >
                Go to Dashboard
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "10K+", label: "Active Users" },
              { number: "50M+", label: "Transactions" },
              { number: "99.9%", label: "Uptime" },
              { number: "24/7", label: "Support" }
            ].map((stat, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all hover:scale-105"
              >
                <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">EthiPay</span>?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform is designed with simplicity, security, and speed in mind. Here's what makes us different.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: "🔒", 
                title: "High Security", 
                desc: "Advanced encryption and secure protocols protect every transaction.",
                gradient: "from-blue-500 to-cyan-500"
              },
              { 
                icon: "⚡", 
                title: "Fast Processing", 
                desc: "Instant payment confirmations and real-time transaction tracking.",
                gradient: "from-purple-500 to-pink-500"
              },
              { 
                icon: "📱", 
                title: " Responsive Interface", 
                desc: "Fully responsive interface optimized for all devices.",
                gradient: "from-indigo-500 to-purple-500"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-gradient-to-b from-white to-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-200 hover:-translate-y-2 group"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <span className="text-2xl text-white">{feature.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              How <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">EthiPay</span> Works
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Get started in just three simple steps. It's that easy!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { number: "1", title: "Create Your Account", desc: "Sign up in seconds with just your basic information." },
              { number: "2", title: "Connect Payment Methods", desc: "Securely link your preferred payment options." },
              { number: "3", title: "Start Transacting", desc: "Make payments and track transactions in one dashboard." }
            ].map((step, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-purple-500/30 transition-all group"
              >
                <div className={`w-12 h-12 ${index === 0 ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 
                                         index === 1 ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 
                                         'bg-gradient-to-r from-indigo-500 to-purple-500'} 
                               rounded-full flex items-center justify-center text-xl font-bold mb-6 group-hover:scale-110 transition-transform`}>
                  {step.number}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                <p className="text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Users Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50" id="for-users">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built for <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Everyone</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              EthiPay is designed to meet the needs of all users across Ethiopia.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              { 
                title: "For Individuals", 
                subtitle: "Personal Payment Solutions",
                gradient: "from-blue-500 to-cyan-500",
                features: [
                  "Pay bills and shop online securely",
                  "Send and receive money instantly",
                  "Track spending with detailed history",
                  "User friendly financial dashboard"
                ]
              },
              { 
                title: "For Merchants", 
                subtitle: "Business Payment Processing",
                gradient: "from-purple-500 to-pink-500",
                features: [
                  "Accept payments online and in store",
                  "Real-time sales tracking and reporting",
                  "Automated invoicing and receipts",
                  "Secure transaction handling"
                ]
              },
              { 
                title: "For Developers", 
                subtitle: "Integration and API Access In the future",
                gradient: "from-indigo-500 to-purple-500",
                features: [
                  "Easy to use RESTful APIs",
                  "Comprehensive documentation",
                  "Sandbox environment for testing",
                  "Dedicated developer support"
                ]
              }
            ].map((user, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-200 hover:-translate-y-2"
              >
                <div className={`bg-gradient-to-r ${user.gradient} text-white px-6 py-4 rounded-xl mb-6`}>
                  <h3 className="text-2xl font-bold">{user.title}</h3>
                  <p className="text-white/90">{user.subtitle}</p>
                </div>
                <ul className="space-y-4">
                  {user.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className={`w-6 h-6 bg-gradient-to-r ${user.gradient} rounded-full flex items-center justify-center mr-3 flex-shrink-0`}>
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 ${primaryGradient} text-white`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Payment Experience?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust EthiPay for their daily transactions. 
            Sign up today and experience the future of payments in Ethiopia.
          </p>
          {!authenticated ? (
            <Link
              to="/register"
              className="inline-block bg-white text-indigo-600 px-10 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 hover:scale-105 transition-all shadow-lg hover:shadow-xl"
            >
              Secure Your Transactions Now
            </Link>
          ) : (
            <Link
              to="/dashboard"
              className="inline-block bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-10 py-4 rounded-full text-lg font-semibold hover:shadow-xl hover:scale-105 transition-all"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className={`w-10 h-10 ${primaryGradientLight} rounded-lg flex items-center justify-center`}>
                  <span className="text-white font-bold">EP</span>
                </div>
                <h4 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  EthiPay
                </h4>
              </div>
              <p className="text-gray-400 mb-4">
                Revolutionizing payments in Ethiopia with secure, fast transaction solutions built for today's digital economy.
              </p>
              <div className="flex space-x-4">
                {['FB', 'TW', 'IG', 'IN'].map((social, idx) => (
                  <a 
                    key={idx}
                    href="#" 
                    className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 rounded-full flex items-center justify-center text-gray-300 hover:text-white transition-all"
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-4 text-white">Quick Links</h4>
              <ul className="space-y-2">
                {['Home', 'Features', 'How It Works', 'For Users'].map((link, idx) => (
                  <li key={idx}>
                    <a 
                      href={`#${link.toLowerCase().replace(' ', '-')}`} 
                      className="text-gray-400 hover:text-indigo-300 transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-lg font-bold mb-4 text-white">Resources</h4>
              <ul className="space-y-2">
                {['Documentation', 'API Reference', 'Developer Guides', 'Help Center'].map((resource, idx) => (
                  <li key={idx}>
                    <a href="#" className="text-gray-400 hover:text-indigo-300 transition-colors">
                      {resource}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-bold mb-4 text-white">Contact Us</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-start">
                  <span className="w-5 h-5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <span className="text-white text-xs">📍</span>
                  </span>
                  <span>Addis Ababa, Ethiopia</span>
                </li>
                <li className="flex items-start">
                  <span className="w-5 h-5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <span className="text-white text-xs">📞</span>
                  </span>
                  <span>+251 934 208 050</span>
                </li>
                <li className="flex items-start">
                  <span className="w-5 h-5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <span className="text-white text-xs">✉️</span>
                  </span>
                  <span>ethpay.info@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} EthiPay. All rights reserved. | Ethiopian E-payment Gateway</p>
            <p className="text-sm mt-2 text-gray-500">Secure • Fast • Reliable</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;