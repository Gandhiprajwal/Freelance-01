import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Zap, Target, Award } from 'lucide-react';

const Hero: React.FC = () => {
  const features = [
    { icon: Zap, text: 'Cutting-edge Technology' },
    { icon: Target, text: 'Hands-on Learning' },
    { icon: Award, text: 'Industry Recognition' }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 text-white">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                <span className="text-orange-500">ROBOSTAAN</span>
                <br />
                <span className="text-2xl md:text-3xl font-medium text-gray-300">
                  An Ageless Adventure
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                Embark on an extraordinary journey into the world of robotics. 
                From beginners to experts, discover cutting-edge courses, insightful blogs, 
                and hands-on experiences that will shape the future of technology.
              </p>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <feature.icon className="w-5 h-5 text-orange-500" />
                  <span className="text-sm text-gray-300">{feature.text}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/courses">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group w-full sm:w-auto px-8 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Explore Courses</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              
              <Link to="/blogs">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group w-full sm:w-auto px-8 py-3 border border-gray-600 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Read Blogs</span>
                  <Play className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* Right Content - 3D Robot Animation */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative w-full h-96 lg:h-[500px]">
              {/* Main Robot Visual */}
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="relative">
                  {/* Robot Body */}
                  <div className="w-32 h-40 bg-gradient-to-b from-gray-600 to-gray-700 rounded-lg shadow-2xl">
                    {/* Robot Head */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full shadow-lg">
                      {/* Eyes */}
                      <div className="absolute top-6 left-4 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                      <div className="absolute top-6 right-4 w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-500"></div>
                      {/* Mouth */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-gray-800 rounded-full"></div>
                    </div>
                    
                    {/* Robot Arms */}
                    <motion.div 
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="absolute top-8 -left-8 w-6 h-16 bg-gradient-to-b from-gray-600 to-gray-700 rounded-full"
                    ></motion.div>
                    <motion.div 
                      animate={{ rotate: [0, -15, 15, 0] }}
                      transition={{ duration: 4, repeat: Infinity, delay: 2 }}
                      className="absolute top-8 -right-8 w-6 h-16 bg-gradient-to-b from-gray-600 to-gray-700 rounded-full"
                    ></motion.div>
                    
                    {/* Robot Chest Panel */}
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-16 h-20 bg-gray-800 rounded-lg">
                      <div className="absolute top-2 left-2 w-12 h-3 bg-orange-500 rounded-full opacity-80"></div>
                      <div className="absolute top-6 left-2 w-12 h-3 bg-blue-500 rounded-full opacity-80"></div>
                      <div className="absolute top-10 left-2 w-12 h-3 bg-green-500 rounded-full opacity-80"></div>
                    </div>
                  </div>
                  
                  {/* Robot Legs */}
                  <div className="absolute top-36 left-8 w-4 h-12 bg-gradient-to-b from-gray-600 to-gray-700 rounded-full"></div>
                  <div className="absolute top-36 right-8 w-4 h-12 bg-gradient-to-b from-gray-600 to-gray-700 rounded-full"></div>
                </div>
              </motion.div>

              {/* Floating Elements */}
              <motion.div
                animate={{ 
                  y: [0, -15, 0],
                  x: [0, 5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-20 left-20 w-8 h-8 bg-orange-500 rounded-full opacity-60"
              ></motion.div>
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  x: [0, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute bottom-20 right-20 w-6 h-6 bg-blue-500 rounded-full opacity-60"
              ></motion.div>
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                  x: [0, 10, 0]
                }}
                transition={{ duration: 5, repeat: Infinity, delay: 2 }}
                className="absolute top-40 right-10 w-4 h-4 bg-purple-500 rounded-full opacity-60"
              ></motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;