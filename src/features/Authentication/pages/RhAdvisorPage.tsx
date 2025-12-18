import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, MessageCircle } from 'lucide-react';
import { useAuth } from '../auth.context';

export default function RhAdvisorPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-300">
        <div className="bg-blue-600 p-8 flex justify-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
            <ShieldCheck className="w-12 h-12 text-white" />
          </div>
        </div>
        
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Pending Validation</h1>
          <p className="text-gray-600 mb-8">
            Your account has been successfully created, but it needs to be validated by an administrator before you can access the platform.
          </p>
          
          <div className="bg-blue-50 rounded-2xl p-6 mb-8 border border-blue-100 flex items-start gap-4 text-left">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex-shrink-0 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-blue-900 text-sm">Action Required</p>
              <p className="text-blue-700 text-xs mt-1">
                Please contact your RH Advisor to complete your onboarding and gain full access.
              </p>
            </div>
          </div>
          
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
          >
            <LogOut className="w-5 h-5" />
            Sign Out & Return Home
          </button>
        </div>
        
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
            Junior Chamber International
          </p>
        </div>
      </div>
    </div>
  );
}
