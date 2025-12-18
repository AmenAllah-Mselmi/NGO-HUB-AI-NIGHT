
import { createBrowserRouter } from 'react-router-dom'
import Login from '../features/Authentication/pages/LoginPage'
import Register from '../features/Authentication/pages/register'
import Home from '../features/Home/pages/home'
import { TeamsPage, TeamDetailsPage } from '../features/Teams'



export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },

   // Protected section
  // Placeholder for now
])
