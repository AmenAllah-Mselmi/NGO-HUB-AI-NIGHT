import { Toaster } from 'sonner'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Register from './features/Authentication/pages/register'
import ErrorBoundary from './lib/ErrorBoundary'
import ProtectedRoute from './Global_Components/ProtectedRoute'
import Home from './features/Home/pages/home'
import Login from './features/Authentication/pages/LoginPage'
import ActivityForm from './features/Activities/pages/ActivityForm'
import ActivityDetails from './features/Activities/pages/ActivityDetails'
import RecruitmentPage from './features/Recruitment/pages/RecruitmentPage'
import TemplateCreatePage from './features/Recruitment/pages/TemplateCreatePage'
import CandidateEvaluationPage from './features/Recruitment/pages/CandidateEvaluationPage'
import MembersPage from './features/Members/pages/MembersPage'
import MemberDetailsPage from './features/Members/pages/MemberDetailsPage'
import { TeamDetailsPage, TeamsPage } from './features/Teams'
import AllActivitiesPage from './features/Activities/pages/AllActivitiesPage'
import RhAdvisorPage from './features/Authentication/pages/RhAdvisorPage'
import UnauthorizedPage from './Global_Components/UnauthorizedPage'
import { EXECUTIVE_LEVELS } from './utils/roles'

function App() {

  return (
    <>

    <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/pending-validation' element={<RhAdvisorPage />} />
        <Route path='/unauthorized' element={<UnauthorizedPage />} />
        <Route
          path='/register'
          element={
            <ProtectedRoute requireGuest={true}>
              <ErrorBoundary>
                <Register />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path='/login'
          element={
            <ProtectedRoute requireGuest={true}>
              <Login />
            </ProtectedRoute>
          }
        />
      
        <Route
          path='/activities'
          element={
            <ProtectedRoute>
              <AllActivitiesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/activities/new'
          element={
            <ProtectedRoute allowedRoles={EXECUTIVE_LEVELS}>
              <ActivityForm />
            </ProtectedRoute>
          }
        />
        <Route
          path='/teams'
          element={
            <ProtectedRoute>
              <TeamsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/teams/:id'
          element={
            <ProtectedRoute>
              <TeamDetailsPage />
            </ProtectedRoute>
          }
        />    
        <Route
          path='/activities/:id/edit'
          element={
            <ProtectedRoute allowedRoles={EXECUTIVE_LEVELS}>
              <ActivityForm />
            </ProtectedRoute>
          }
        />
      <Route
      path='/activities/:id/GET'
      element={<ActivityDetails></ActivityDetails>}
      
      ></Route>

      {/* Recruitment Routes */}
      <Route
        path='/recruitment'
        element={
          <ProtectedRoute allowedRoles={EXECUTIVE_LEVELS}>
            <RecruitmentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path='/recruitment/templates/:id/edit'
        element={
          <ProtectedRoute allowedRoles={EXECUTIVE_LEVELS}>
            <TemplateCreatePage />
          </ProtectedRoute>
        }
      />
      <Route
        path='/recruitment/templates/new'
        element={
          <ProtectedRoute allowedRoles={EXECUTIVE_LEVELS}>
            <TemplateCreatePage />
          </ProtectedRoute>
        }
      />
      <Route
        path='/recruitment/candidates/:id'
        element={
          <ProtectedRoute allowedRoles={EXECUTIVE_LEVELS}>
            <CandidateEvaluationPage />
          </ProtectedRoute>
        }
      />
      {/* Members Routes */}
      <Route
        path='/members'
        element={
          <ProtectedRoute allowedRoles={EXECUTIVE_LEVELS}>
            <MembersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path='/members/:id'
        element={
          <ProtectedRoute>
            <MemberDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path='/me'
        element={
          <ProtectedRoute>
            <MemberDetailsPage />
          </ProtectedRoute>
        }
      />
      </Routes>
      <Toaster richColors position='top-center' />
      
    </>
  )
}

export default App
