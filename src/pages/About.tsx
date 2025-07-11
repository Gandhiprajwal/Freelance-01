import React from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Award, Zap, Github, Linkedin, Twitter } from 'lucide-react';

const About: React.FC = () => {
  const teamMembers = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Founder & CEO',
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Leading robotics researcher with 15+ years of experience in autonomous systems.',
      social: {
        linkedin: '#',
        twitter: '#',
        github: '#'
      }
    },
    {
      name: 'Prof. Michael Chen',
      role: 'CTO & Lead Engineer',
      image: 'https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Former NASA engineer specializing in robotic systems and AI integration.',
      social: {
        linkedin: '#',
        twitter: '#',
        github: '#'
      }
    },
    {
      name: 'Dr. Emily Rodriguez',
      role: 'Head of Education',
      image: 'https://images.pexels.com/photos/3184611/pexels-photo-3184611.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Educational technology expert with a passion for making robotics accessible to all.',
      social: {
        linkedin: '#',
        twitter: '#',
        github: '#'
      }
    }
  ];

  const values = [
    {
      icon: Target,
      title: 'Innovation',
      description: 'We constantly push the boundaries of what\'s possible in robotics education and technology.'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Building a global community of robotics enthusiasts, learners, and professionals.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Delivering world-class education and resources that meet the highest standards.'
    },
    {
      icon: Zap,
      title: 'Accessibility',
      description: 'Making robotics education accessible to everyone, regardless of background or experience.'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About ROBOSTAAN
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Empowering the next generation of roboticists through innovative education and hands-on experience
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                At ROBOSTAAN, we believe that robotics is not just a field of study—it's the future of human innovation. 
                Our mission is to democratize robotics education and make it accessible to learners of all ages and backgrounds.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Through our comprehensive courses, insightful blogs, and hands-on projects, we aim to bridge the gap 
                between theoretical knowledge and practical application in the world of robotics.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Join us on this ageless adventure as we explore the fascinating world of robotics together.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 text-white">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">10K+</div>
                    <div className="text-sm opacity-90">Students Enrolled</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">25+</div>
                    <div className="text-sm opacity-90">Expert Courses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">150+</div>
                    <div className="text-sm opacity-90">Blog Articles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">98%</div>
                    <div className="text-sm opacity-90">Success Rate</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              These core values guide everything we do at ROBOSTAAN
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-700 rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mb-4">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our team of experts brings together decades of experience in robotics, education, and technology
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {member.name}
                  </h3>
                  <p className="text-orange-500 font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {member.description}
                  </p>
                  <div className="flex space-x-3">
                    <motion.a
                      whileHover={{ scale: 1.1 }}
                      href={member.social.linkedin}
                      className="text-gray-400 hover:text-orange-500 transition-colors"
                    >
                      <Linkedin className="w-5 h-5" />
                    </motion.a>
                    <motion.a
                      whileHover={{ scale: 1.1 }}
                      href={member.social.twitter}
                      className="text-gray-400 hover:text-orange-500 transition-colors"
                    >
                      <Twitter className="w-5 h-5" />
                    </motion.a>
                    <motion.a
                      whileHover={{ scale: 1.1 }}
                      href={member.social.github}
                      className="text-gray-400 hover:text-orange-500 transition-colors"
                    >
                      <Github className="w-5 h-5" />
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Join Our Community?
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Be part of the robotics revolution. Start your journey today and unlock your potential in the world of robotics.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-8 py-4 bg-white text-orange-500 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Get Started Now
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;