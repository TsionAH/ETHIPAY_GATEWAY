import { Link } from "react-router-dom";
import { isAuthenticated } from "../service/authService";

function HomePage() {
  const authenticated = isAuthenticated();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">ETHPAY</h1>
            </div>
            <div className="flex items-center space-x-4">
              {authenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-white hover:text-indigo-200 px-4 py-2 rounded-md transition"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-white hover:text-indigo-200 px-4 py-2 rounded-md transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition shadow-lg"
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
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Animated Gradient Text */}
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 animate-fade-in">
              Welcome to{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500">
                ETHPAY
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Secure, Fast, and Reliable Payment Solutions for Ethiopia
            </p>
            <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto">
              Experience seamless digital payments with our cutting-edge platform. 
              Send money, pay bills, and manage transactions with ease.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!authenticated && (
                <>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                  >
                    Create Account
                  </Link>
                  <Link
                    to="/login"
                    className="bg-white/10 backdrop-blur-md text-white border-2 border-white/30 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/20 transition"
                  >
                    Sign In
                  </Link>
                </>
              )}
              {authenticated && (
                <Link
                  to="/dashboard"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Floating Cards Animation */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          Why Choose ETHPAY?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 hover:bg-white/15 transition transform hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Secure</h3>
            <p className="text-gray-300">
              Bank-level encryption and security measures to keep your transactions safe and protected.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 hover:bg-white/15 transition transform hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-600 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Fast</h3>
            <p className="text-gray-300">
              Instant payments and real-time transaction processing. Send money in seconds, not minutes.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 hover:bg-white/15 transition transform hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Easy</h3>
            <p className="text-gray-300">
              Simple, intuitive interface designed for everyone. Manage your finances with ease.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl md:text-5xl font-bold text-white mb-2">10K+</div>
            <div className="text-gray-300">Active Users</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-white mb-2">50M+</div>
            <div className="text-gray-300">Transactions</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-white mb-2">99.9%</div>
            <div className="text-gray-300">Uptime</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-white mb-2">24/7</div>
            <div className="text-gray-300">Support</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-md border-t border-white/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-300">
            <p>&copy; 2024 ETHPAY. All rights reserved.</p>
            <p className="mt-2 text-sm">Secure Payment Platform for Ethiopia</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;


