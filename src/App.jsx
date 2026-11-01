import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
import Layout from './components/Layout'
import Home from './components/Home'
import Dashboard from './components/Dashboard'
import QuizList from './components/QuizList'
import CreateQuiz from './components/CreateQuiz'
import TakeQuiz from './components/TakeQuiz'
import QuizSubmissions from './components/QuizSubmissions'
import SubmissionDetail from './components/SubmissionDetail'
import MyResults from './components/MyResults'
import Schedule from './components/Schedule'
import ScheduleAdmin from './components/ScheduleAdmin'
import VideoList from './components/VideoList'
import VideoForm from './components/VideoForm'
import VideoPlayer from './components/VideoPlayer'
import Settings from './components/Settings'
import Library from './components/Library'
import LibraryUpload from './components/LibraryUpload'
import LibraryViewer from './components/LibraryViewer'
import { getUser, isAdmin, applyTheme, getInitialTheme } from './auth'
import './App.css'

function ProtectedRoute({ children, adminOnly = false }) {
  const user = getUser()
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin(user)) return <Navigate to="/dashboard" replace />
  return children
}

function App() {
  useEffect(() => {
    applyTheme(getInitialTheme())
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/quizzes" element={<ProtectedRoute><QuizList /></ProtectedRoute>} />
          <Route path="/quizzes/create" element={<ProtectedRoute adminOnly><CreateQuiz /></ProtectedRoute>} />
          <Route path="/quizzes/:id/take" element={<ProtectedRoute><TakeQuiz /></ProtectedRoute>} />
          <Route path="/quizzes/:id/submissions" element={<ProtectedRoute adminOnly><QuizSubmissions /></ProtectedRoute>} />
          <Route path="/submissions/:id" element={<ProtectedRoute><SubmissionDetail /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute><MyResults /></ProtectedRoute>} />
          <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
          <Route path="/schedule/admin" element={<ProtectedRoute adminOnly><ScheduleAdmin /></ProtectedRoute>} />
          <Route path="/videos" element={<ProtectedRoute><VideoList /></ProtectedRoute>} />
          <Route path="/videos/create" element={<ProtectedRoute adminOnly><VideoForm /></ProtectedRoute>} />
          <Route path="/videos/:id/edit" element={<ProtectedRoute adminOnly><VideoForm /></ProtectedRoute>} />
          <Route path="/videos/:id" element={<ProtectedRoute><VideoPlayer /></ProtectedRoute>} />
          <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
          <Route path="/library/upload" element={<ProtectedRoute adminOnly><LibraryUpload /></ProtectedRoute>} />
          <Route path="/library/:id" element={<ProtectedRoute><LibraryViewer /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
