/*
  # Sample Data for ROBOSTAAN

  1. Sample Blogs
    - Comprehensive blog posts with rich content
    - Various categories and tags
    - Featured and regular posts

  2. Sample Courses
    - Different difficulty levels
    - Various durations and categories
    - Featured courses

  3. Demo User Profiles
    - Admin, instructor, and user roles
    - Complete profile information
*/

-- Insert comprehensive blog data
INSERT INTO blogs (title, content, snippet, image, tags, author, featured) VALUES
(
  'Getting Started with Robotics Programming',
  '<h2>Introduction to Robotics Programming</h2><p>Robotics programming is an exciting field that combines hardware and software to create intelligent machines. In this comprehensive guide, we''ll explore the fundamental concepts you need to know to start your journey in robotics programming.</p><h3>What is Robotics Programming?</h3><p>Robotics programming involves writing code that controls robotic systems. This includes:</p><ul><li>Sensor data processing</li><li>Motor control algorithms</li><li>Decision-making logic</li><li>Communication protocols</li></ul><h3>Popular Programming Languages</h3><p>Several programming languages are commonly used in robotics:</p><ol><li><strong>Python</strong> - Great for beginners, extensive libraries</li><li><strong>C++</strong> - High performance, real-time applications</li><li><strong>ROS (Robot Operating System)</strong> - Framework for robot software development</li></ol><h3>Getting Started</h3><p>To begin your robotics programming journey:</p><ol><li>Choose a programming language</li><li>Set up your development environment</li><li>Start with simple projects</li><li>Join robotics communities</li><li>Practice regularly</li></ol><p>Remember, robotics programming is a skill that develops over time. Start with simple projects and gradually work your way up to more complex systems.</p>',
  'Discover the essential concepts and tools needed to begin your journey in robotics programming.',
  'https://images.pexels.com/photos/2085831/pexels-photo-2085831.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['Programming', 'Python', 'ROS', 'Beginner'],
  'Dr. Sarah Johnson',
  true
),
(
  'Advanced Sensor Integration in Robotics',
  '<h2>Mastering Sensor Integration</h2><p>Sensors are the eyes and ears of robotic systems. Understanding how to integrate and process sensor data is crucial for creating intelligent robots that can interact with their environment.</p><h3>Types of Sensors</h3><p>Modern robots use various types of sensors:</p><ul><li><strong>Vision Sensors</strong> - Cameras, depth sensors, LiDAR</li><li><strong>Motion Sensors</strong> - IMUs, encoders, gyroscopes</li><li><strong>Environmental Sensors</strong> - Temperature, humidity, gas sensors</li><li><strong>Proximity Sensors</strong> - Ultrasonic, infrared, capacitive</li></ul><h3>Sensor Fusion Techniques</h3><p>Combining data from multiple sensors provides more accurate and reliable information:</p><ol><li><strong>Kalman Filtering</strong> - Optimal estimation for linear systems</li><li><strong>Particle Filtering</strong> - Non-linear state estimation</li><li><strong>Complementary Filtering</strong> - Simple but effective fusion</li></ol><h3>Implementation Example</h3><p>Here''s a basic example of sensor fusion:</p><pre><code>import numpy as np
from scipy import signal

class SensorFusion:
    def __init__(self):
        self.alpha = 0.98  # Complementary filter coefficient
        
    def fuse_imu_data(self, accel_angle, gyro_rate, dt):
        # Complementary filter
        angle = self.alpha * (self.prev_angle + gyro_rate * dt) + (1 - self.alpha) * accel_angle
        self.prev_angle = angle
        return angle</code></pre><p>These techniques help reduce noise and improve the overall performance of your robotic system.</p>',
  'Master the art of sensor fusion and integration for creating intelligent robotic systems.',
  'https://images.pexels.com/photos/2085831/pexels-photo-2085831.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['Sensors', 'Hardware', 'Advanced', 'Integration'],
  'Prof. Michael Chen',
  false
),
(
  'Machine Learning for Autonomous Navigation',
  '<h2>AI-Powered Robot Navigation</h2><p>Machine learning has revolutionized how robots navigate and interact with their environment. This article explores cutting-edge techniques for autonomous navigation.</p><h3>Navigation Challenges</h3><p>Autonomous navigation involves solving several complex problems:</p><ul><li>Path planning and obstacle avoidance</li><li>Localization and mapping (SLAM)</li><li>Dynamic environment adaptation</li><li>Real-time decision making</li></ul><h3>ML Approaches</h3><p>Various machine learning techniques are used in navigation:</p><ol><li><strong>Reinforcement Learning</strong> - Learning through trial and error</li><li><strong>Deep Learning</strong> - Neural networks for perception</li><li><strong>Computer Vision</strong> - Visual understanding of environment</li></ol><h3>Implementation Example</h3><p>Here''s a simple example of how you might implement a basic navigation algorithm:</p><pre><code>import numpy as np
from sklearn.neural_network import MLPRegressor

class NavigationAgent:
    def __init__(self):
        self.model = MLPRegressor(hidden_layer_sizes=(100, 50))
    
    def train(self, sensor_data, actions):
        self.model.fit(sensor_data, actions)
    
    def predict_action(self, current_sensors):
        return self.model.predict([current_sensors])[0]
        
    def navigate(self, goal, obstacles):
        # Simple path planning with ML
        path = []
        current_pos = self.get_position()
        
        while not self.reached_goal(current_pos, goal):
            sensor_data = self.get_sensor_data()
            action = self.predict_action(sensor_data)
            current_pos = self.execute_action(action)
            path.append(current_pos)
            
        return path</code></pre><p>This demonstrates how machine learning can be integrated into robotic navigation systems.</p>',
  'Learn how to use AI and ML techniques to create self-navigating robots.',
  'https://images.pexels.com/photos/2085831/pexels-photo-2085831.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['AI', 'Machine Learning', 'Navigation', 'Autonomous'],
  'Dr. Emily Rodriguez',
  true
),
(
  'Building Your First Robot: A Complete Guide',
  '<h2>Welcome to Robot Building!</h2><p>Building your first robot is an exciting journey that combines creativity, engineering, and programming. This comprehensive guide will walk you through every step of the process.</p><h3>Planning Your Robot</h3><p>Before you start building, it''s important to plan what you want your robot to do:</p><ul><li>Define the robot''s purpose (cleaning, entertainment, education)</li><li>Set a realistic budget</li><li>Choose appropriate components</li><li>Design the mechanical structure</li></ul><h3>Essential Components</h3><p>Every robot needs these basic components:</p><ol><li><strong>Microcontroller</strong> - The brain of your robot (Arduino, Raspberry Pi)</li><li><strong>Motors</strong> - For movement (servo, stepper, DC motors)</li><li><strong>Sensors</strong> - To perceive the environment (ultrasonic, camera, IMU)</li><li><strong>Power Supply</strong> - Batteries or power adapters</li><li><strong>Chassis</strong> - The physical structure</li></ol><h3>Step-by-Step Building Process</h3><p>Follow these steps to build your robot:</p><h4>1. Design the Chassis</h4><p>Start with a simple design using materials like:</p><ul><li>Acrylic sheets</li><li>3D printed parts</li><li>Aluminum extrusions</li><li>Cardboard (for prototyping)</li></ul><h4>2. Install the Electronics</h4><p>Mount your microcontroller and connect the components according to your circuit diagram.</p><h4>3. Programming Your Robot</h4><p>Start with simple behaviors and gradually add complexity.</p><p>Remember, building robots is a learning process. Don''t be discouraged by initial failures – they''re part of the journey!</p>',
  'A comprehensive step-by-step guide to building your first robot, from planning to programming.',
  'https://images.pexels.com/photos/2085831/pexels-photo-2085831.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['Beginner', 'Hardware', 'Arduino', 'Tutorial', 'DIY'],
  'Prof. Michael Chen',
  true
),
(
  'The Future of Humanoid Robots',
  '<h2>Humanoid Robots: The Next Frontier</h2><p>Humanoid robots represent one of the most fascinating and challenging areas of robotics. These machines, designed to resemble and interact like humans, are pushing the boundaries of what''s possible in robotics.</p><h3>Current State of Humanoid Robotics</h3><p>Today''s humanoid robots have achieved remarkable capabilities:</p><ul><li><strong>Boston Dynamics Atlas</strong> - Advanced mobility and agility</li><li><strong>Honda ASIMO</strong> - Pioneering bipedal locomotion</li><li><strong>SoftBank Pepper</strong> - Social interaction and emotion recognition</li><li><strong>Tesla Optimus</strong> - General-purpose humanoid worker</li></ul><h3>Key Technologies</h3><p>Several breakthrough technologies are driving humanoid robot development:</p><h4>Advanced Actuators</h4><p>Modern humanoid robots use sophisticated actuators for natural movement and human-like interaction.</p><h4>AI and Machine Learning</h4><p>Artificial intelligence enables humanoid robots to understand and respond to natural language, recognize faces and emotions, and learn from demonstrations.</p><h3>Applications and Use Cases</h3><p>Humanoid robots are being developed for various applications including healthcare, service industry, and education.</p><p>The future of humanoid robots is bright, with continued advances in AI, materials science, and engineering bringing us closer to truly human-like machines.</p>',
  'Exploring the current state and future potential of humanoid robots in various industries.',
  'https://images.pexels.com/photos/2085831/pexels-photo-2085831.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['Humanoid', 'AI', 'Future Tech', 'Advanced'],
  'Dr. Emily Rodriguez',
  true
);

-- Insert comprehensive course data
INSERT INTO courses (title, description, content, image, duration, category, video_url, materials, featured) VALUES
(
  'Introduction to Robotics',
  'A comprehensive introduction to the world of robotics, covering basic concepts, history, and applications.',
  '<h2>Course Overview</h2><p>Welcome to Introduction to Robotics! This course is designed for beginners who want to understand the fundamentals of robotics.</p><h3>What You''ll Learn</h3><ul><li>History and evolution of robotics</li><li>Basic mechanical components</li><li>Introduction to programming robots</li><li>Safety considerations</li><li>Real-world applications</li></ul><h3>Course Structure</h3><p>The course is divided into 8 weekly modules:</p><ol><li>Week 1: Introduction and History</li><li>Week 2: Mechanical Systems</li><li>Week 3: Sensors and Actuators</li><li>Week 4: Basic Programming</li><li>Week 5: Control Systems</li><li>Week 6: Navigation Basics</li><li>Week 7: Human-Robot Interaction</li><li>Week 8: Final Project</li></ol><h3>Prerequisites</h3><p>No prior experience required! This course is perfect for:</p><ul><li>Complete beginners</li><li>Students interested in STEM</li><li>Hobbyists and makers</li><li>Anyone curious about robotics</li></ul>',
  'https://images.pexels.com/photos/2085831/pexels-photo-2085831.jpeg?auto=compress&cs=tinysrgb&w=800',
  '8 weeks',
  'Beginner',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  ARRAY['Course Handbook PDF', 'Arduino Starter Kit', 'Programming Exercises', 'Video Tutorials'],
  true
),
(
  'Advanced Robot Programming',
  'Deep dive into advanced programming techniques for robotics using Python, C++, and ROS.',
  '<h2>Advanced Programming Concepts</h2><p>This advanced course covers sophisticated programming techniques used in modern robotics.</p><h3>Prerequisites</h3><ul><li>Basic programming knowledge</li><li>Understanding of robotics fundamentals</li><li>Familiarity with Linux/Unix systems</li></ul><h3>Technologies Covered</h3><ul><li>ROS (Robot Operating System)</li><li>OpenCV for computer vision</li><li>TensorFlow for machine learning</li><li>Real-time programming concepts</li></ul><h3>Course Modules</h3><ol><li>Advanced Python for Robotics</li><li>C++ Performance Programming</li><li>ROS Framework Mastery</li><li>Computer Vision Integration</li><li>Machine Learning Applications</li><li>Real-time Systems</li></ol>',
  'https://images.pexels.com/photos/2085831/pexels-photo-2085831.jpeg?auto=compress&cs=tinysrgb&w=800',
  '12 weeks',
  'Advanced',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  ARRAY['ROS Installation Guide', 'Code Examples Repository', 'Virtual Machine Image', 'Development Tools'],
  false
),
(
  'Mechatronics Fundamentals',
  'Learn the integration of mechanical, electrical, and software engineering in robotic systems.',
  '<h2>Mechatronics Integration</h2><p>Mechatronics combines mechanical engineering, electronics, and software to create intelligent systems.</p><h3>Core Topics</h3><ul><li>Mechanical design principles</li><li>Electronic circuit design</li><li>Microcontroller programming</li><li>System integration</li></ul><h3>Hands-on Projects</h3><p>This course includes several practical projects:</p><ol><li>Automated conveyor system</li><li>Robotic arm control</li><li>Smart home automation</li><li>Industrial process control</li></ol>',
  'https://images.pexels.com/photos/2085831/pexels-photo-2085831.jpeg?auto=compress&cs=tinysrgb&w=800',
  '10 weeks',
  'Intermediate',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  ARRAY['Circuit Design Software', 'Component List', 'Lab Manual', 'Project Kits'],
  true
),
(
  'Autonomous Drone Programming',
  'Learn to program autonomous drones using Python, ROS, and computer vision for various applications.',
  '<h2>Course Overview</h2><p>This comprehensive course teaches you how to program autonomous drones from scratch. You''ll learn flight control, computer vision, and autonomous navigation.</p><h3>Prerequisites</h3><ul><li>Basic Python programming</li><li>Understanding of physics and mathematics</li><li>Familiarity with Linux command line</li></ul><h3>What You''ll Learn</h3><ul><li>Drone hardware and components</li><li>Flight dynamics and control theory</li><li>PX4 and ArduPilot flight stacks</li><li>Computer vision for drones</li><li>Autonomous mission planning</li><li>Safety protocols and regulations</li></ul><h3>Course Modules</h3><h4>Module 1: Drone Fundamentals</h4><ul><li>Quadcopter physics and aerodynamics</li><li>Electronic speed controllers (ESCs)</li><li>Flight control units (FCUs)</li><li>Sensors: IMU, GPS, barometer</li></ul><h4>Module 2: Flight Control Programming</h4><ul><li>PID controllers for stability</li><li>Attitude and position control</li><li>Waypoint navigation</li><li>Emergency procedures</li></ul>',
  'https://images.pexels.com/photos/2085831/pexels-photo-2085831.jpeg?auto=compress&cs=tinysrgb&w=800',
  '16 weeks',
  'Advanced',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  ARRAY['Drone Hardware Kit', 'Flight Simulator Access', 'Programming Exercises', 'Safety Manual'],
  true
),
(
  'Robot Operating System (ROS) Fundamentals',
  'Master the Robot Operating System (ROS) framework for building complex robotic applications.',
  '<h2>ROS Fundamentals Course</h2><p>Learn the Robot Operating System (ROS), the most popular framework for robot software development.</p><h3>Course Overview</h3><p>This course covers ROS from basics to advanced topics, preparing you to develop professional robotic applications.</p><h3>Learning Path</h3><h4>Week 1-2: ROS Basics</h4><ul><li>ROS architecture and concepts</li><li>Nodes, topics, and messages</li><li>Services and actions</li><li>Parameter server</li></ul><h4>Week 3-4: ROS Tools</h4><ul><li>roslaunch and launch files</li><li>rosbag for data recording</li><li>rviz for visualization</li><li>rqt tools for debugging</li></ul><h4>Week 5-6: Programming in ROS</h4><ul><li>Writing ROS nodes in Python</li><li>C++ development with ROS</li><li>Custom message types</li><li>Package creation and management</li></ul>',
  'https://images.pexels.com/photos/2085831/pexels-photo-2085831.jpeg?auto=compress&cs=tinysrgb&w=800',
  '8 weeks',
  'Intermediate',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  ARRAY['ROS Installation Guide', 'Virtual Machine Image', 'Code Examples', 'Project Templates'],
  false
);

-- Insert demo user profiles (these would normally be created through Supabase Auth)
-- Note: In production, these would be created when users sign up
INSERT INTO user_profiles (user_id, email, full_name, avatar_url, bio, role) VALUES
(
  gen_random_uuid(),
  'admin@robostaan.com',
  'Admin User',
  'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400',
  'System administrator with full access to manage content and users. Passionate about robotics education and technology.',
  'admin'
),
(
  gen_random_uuid(),
  'instructor@robostaan.com',
  'Dr. Sarah Johnson',
  'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Lead instructor specializing in robotics programming and AI integration. PhD in Robotics from MIT.',
  'instructor'
),
(
  gen_random_uuid(),
  'student@robostaan.com',
  'John Student',
  'https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Enthusiastic robotics student learning the fundamentals of robot programming and design.',
  'user'
);