import React, { useState } from "react";
import { Menu, X, GraduationCap, Facebook, Instagram, Twitter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const featuresData = [
  { title: "Upload", desc: "Upload your questions in any format, or create them directly inside the app.", icon: "☁️" },
  { title: "Auto-generate", desc: "Generate quizzes automatically with random questions and time limits.", icon: "⚡" },
  { title: "Edit", desc: "Edit quizzes easily, assign to students, and adjust difficulty anytime.", icon: "✏️" },
  { title: "Export", desc: "Export results instantly with detailed reports and leaderboards.", icon: "📊" },
];

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-[#000000] bg-[#F1EDE5] relative overflow-x-hidden">

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 bg-[#FFFFFF]/90 backdrop-blur-md shadow-sm border-b border-[#E46036]/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-12 h-12 bg-[#E46036] rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-extrabold text-2xl">SM</span>
            </div>
            <span className="text-2xl font-bold tracking-wide text-[#000000]">Smart Quiz</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 font-semibold text-[#000000]">
            <button className="hover:text-[#E46036] transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</button>
            <button className="hover:text-[#E46036] transition-colors" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>Features</button>
            <button className="hover:text-[#E46036] transition-colors" onClick={() => document.getElementById('News').scrollIntoView({ behavior: 'smooth' })}>News</button>
            <button className="hover:text-[#E46036] transition-colors" onClick={() => navigate("/register")}>Register</button>
            <button className="hover:text-[#E46036] transition-colors" onClick={() => navigate("/login")}>Login</button>
            
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-[#000000]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute top-full left-0 right-0 bg-[#FFFFFF] shadow-xl border-t border-[#E46036]/20"
          >
            <div className="px-6 py-4 space-y-4">
              <div className="flex space-x-4">
                <button className="hover:text-[#E46036] transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</button>
                <button className="hover:text-[#E46036] transition-colors" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>Features</button>
                <button className="hover:text-[#E46036] transition-colors" onClick={() => document.getElementById('News').scrollIntoView({ behavior: 'smooth' })}>News</button>
                <button className="hover:text-[#E46036] transition-colors" onClick={() => navigate("/register")}>Register</button>
                <button className="hover:text-[#E46036] transition-colors" onClick={() => navigate("/login")}>Login</button>
              </div>

              
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20 bg-[#F1EDE5] pt-20">
        <div className="relative max-w-6xl w-full flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row items-center bg-[#FFFFFF] rounded-2xl shadow-xl p-10 md:p-16 gap-10"
          >
            <div className="flex-1 text-left">
              <h1 className="text-5xl md:text-6xl font-extrabold text-[#000000] leading-tight mb-6">
                Create better quizzes, <span className="text-[#E46036]">faster</span>
              </h1>
              <p className="text-lg md:text-xl text-[#000000]/80 mb-6 max-w-xl">
                The quiz platform for students and teachers. Easy to use, fun to play,
                and built to test your{" "}
                <span className="font-semibold text-[#E46036]">knowledge!</span>
              </p>

              <button
                onClick={() => navigate("/Register")}
                className="px-8 py-4 text-lg font-semibold rounded-xl bg-[#E46036] 
                hover:bg-[#000000] text-white transition-all shadow-md transform hover:scale-105"
              >
                Start Now
              </button>
            </div>

            <div className="flex-1 flex justify-center items-center">
              <GraduationCap className="w-48 h-48 md:w-60 md:h-60 lg:w-72 lg:h-72 text-[#E46036]" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-6 relative bg-[#F1EDE5]">
        <div className="relative max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-[#000000] mb-12">
            Features of <span className="text-[#E46036]">SmartQuiz</span>
          </h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ staggerChildren: 0.2 }}
          >
            {featuresData.map((feature, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 40, scale: 0.9 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                whileHover={{
                  scale: 1.05,
                  y: -5,
                  boxShadow: "0px 15px 40px rgba(0, 0, 0, 0.15)",
                }}
                className="flex flex-col items-center text-center bg-[#FFFFFF] shadow-lg border border-[#E46036]/20 rounded-2xl p-12 h-80 cursor-pointer transition hover:shadow-xl group"
              >
                <motion.div
                  initial={{ rotate: -10, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-5xl mb-6 group-hover:scale-110 transition-transform"
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-2xl font-bold text-[#000000] mb-4 group-hover:text-[#E46036] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-[#000000]/70 text-lg leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* News Section */}
      <section id="News" className="py-16 px-6 bg-[#F1EDE5] relative">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-[#000000] mb-12">
            Latest <span className="text-[#E46036]">News</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#FFFFFF] shadow-lg rounded-2xl p-6 text-left transition hover:shadow-xl">
              <h3 className="text-2xl font-semibold text-[#000000] mb-2">New Quiz Templates Added</h3>
              <p className="text-[#000000]/80 mb-4">We added 10+ new quiz templates for different subjects to make it easier for teachers to create engaging assessments.</p>
              <span className="text-[#E46036] font-semibold text-sm">Sep 12, 2025</span>
            </div>
            <div className="bg-[#FFFFFF] shadow-lg rounded-2xl p-6 text-left transition hover:shadow-xl">
              <h3 className="text-2xl font-semibold text-[#000000] mb-2">Auto-Grading Feature Released</h3>
              <p className="text-[#000000]/80 mb-4">Our platform now supports automatic grading for all objective questions, making quiz management faster.</p>
              <span className="text-[#E46036] font-semibold text-sm">Sep 10, 2025</span>
            </div>
            <div className="bg-[#FFFFFF] shadow-lg rounded-2xl p-6 text-left transition hover:shadow-xl">
              <h3 className="text-2xl font-semibold text-[#000000] mb-2">Student Leaderboards Launched</h3>
              <p className="text-[#000000]/80 mb-4">Students can now see rankings in real-time. Encourage friendly competition and track progress with our new leaderboard feature.</p>
              <span className="text-[#E46036] font-semibold text-sm">Sep 8, 2025</span>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Educational Elements */}
      <section className="py-16 px-6 bg-[#FFFFFF] relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#F1EDE5] border border-[#E46036]/20 mb-6">
            <span className="text-[#000000] font-semibold">🎓 Trusted by educators worldwide</span>
          </div>
          <h3 className="text-3xl font-bold text-[#000000] mb-4">Empowering Learning Through Interactive Assessments</h3>
          <p className="text-xl text-[#000000]/80 leading-relaxed">Join thousands of educators who are transforming their classrooms with engaging, data-driven quizzes that make learning both effective and enjoyable.</p>
        </div>
      </section>

      {/* Footer Section with Logo & Social Media */}
      <footer className="bg-[#FFFFFF] border-t border-[#E46036]/20 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col items-center space-y-6">
          {/* Logo and Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#E46036] rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-extrabold text-lg">IQ</span>
            </div>
            <span className="font-bold text-xl text-[#000000]">SmartQuiz</span>
          </div>

          {/* "Follow us" label */}
          <span className="text-[#000000]/70 font-medium text-lg">Follow us</span>

          {/* Social Media Icons */}
          <div className="flex justify-center space-x-8 text-[#000000] text-2xl">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#E46036] transition-colors"
            >
              <Facebook />
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#E46036] transition-colors"
            >
              <Instagram />
            </a>
            <a
              href="https://www.twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#E46036] transition-colors"
            >
              <Twitter />
            </a>
          </div>

          {/* Copyright */}
          <div className="border-t border-[#E46036]/20 w-full mt-6 py-4 text-center text-[#000000]/70 text-sm">
            &copy; {new Date().getFullYear()} SmartQuiz. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;