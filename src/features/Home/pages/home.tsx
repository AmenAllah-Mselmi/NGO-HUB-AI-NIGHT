import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import Navbar from '../../../Global_Components/navBar'
import ActivityCard from '../../Activities/components/ActivityCard'
import ActivitiesFilter from '../components/ActivitiesFilter'
import { useActivities } from '../../Activities/hooks/useActivities'
import type { ActivityFilterDTO } from '../../Activities/dto/ActivityDTOs'

import TopPerformers from '../components/TopPerformers'
import TeamsOverview from '../components/TeamsOverview'
import PendingCandidates from '../components/PendingCandidates'
import ComplaintsOverview from '../../../Global_Components/ComplaintsOverview'
import { useAuth } from '../../Authentication/auth.context'
import { EXECUTIVE_LEVELS } from '../../../utils/roles'

const Home = () => {
  const { activities, loading, fetchActivities } = useActivities() 
  const { user, role } = useAuth()
  const isExecutive = EXECUTIVE_LEVELS.includes(role?.toLowerCase() || '')
  
  // Handlers
  const handleFilterChange = useCallback((filters: ActivityFilterDTO) => {
    fetchActivities(filters)
  }, [fetchActivities])

  return (
    <div className='min-h-screen flex flex-col bg-gray-50'>
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <main className="md:ml-64 pt-16 md:pt-6">
        {/* Hero Section (Visible to guests) */}
        {!user && (
          <section className='bg-white border-b border-gray-100 py-20 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-7xl mx-auto text-center'>
              <h1 className='text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 animate-in fade-in slide-in-from-top-4 duration-700'>
                Empowering <span className='text-(--color-myPrimary)'>JCI Members</span> <br className='hidden md:block' /> for a Better Tomorrow
              </h1>
              <p className='text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10 animate-in fade-in slide-in-from-top-6 duration-1000'>
                Manage your activities, track your points, and collaborate with your team in one unified platform designed for growth and impact.
              </p>
              <div className='flex flex-wrap justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000'>
                <Link 
                  to="/register" 
                  className='px-8 py-3.5 bg-(--color-myPrimary) text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100'
                >
                  Get Started
                </Link>
                <Link 
                  to="/login" 
                  className='px-8 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition'
                >
                  Member Log In
                </Link>
              </div>
            </div>
          </section>
        )}
        {/* Dashboard Widgets Section (Visible to logged in users) */}
        {user && (
          <section className='py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full'>
            <div className="flex items-center gap-2 mb-6 px-1">
                 <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Management Dashboard</h2>
                 <div className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full uppercase tracking-widest border border-blue-200">Internal</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <TopPerformers />
              <TeamsOverview />
              {isExecutive && <ComplaintsOverview />}
              {isExecutive && <PendingCandidates />}
            </div>
          </section>
        )}

        {/* Activities Section */}
        <section className='py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full'>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className='text-3xl font-bold text-gray-900'>Upcoming Activities</h2>
              <p className='text-gray-500 mt-2'>Find and join activities that interest you.</p>
            </div>
          </div>

          {/* Filters */}
          <ActivitiesFilter onFilterChange={handleFilterChange} />

          {/* Content */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
          ) : activities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {activities.map((activity) => (
                <div key={activity.id} className="h-full">
                  <ActivityCard activity={activity} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
              <p className="text-xl text-gray-500 font-medium">No activities found matching your criteria.</p>
              <button 
                onClick={() => fetchActivities()} 
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                Clear filters to see all activities
              </button>
            </div>
          )}
        </section>
      </main>
      {/* Footer */}
   
    </div>
  )
}

export default Home
