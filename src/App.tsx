import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './components/Auth/AuthProvider';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyBlogs from './pages/MyBlogs';
import MyCourses from './pages/MyCourses';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="blogs" element={<Blogs />} />
              <Route path="blog/:id" element={<BlogDetail />} />
              <Route path="courses" element={<Courses />} />
              <Route path="course/:id" element={<CourseDetail />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="my-blogs" element={<MyBlogs />} />
              <Route path="my-courses" element={<MyCourses />} />
              <Route path="admin" element={<AdminPanel />} />
            </Route>
          </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;