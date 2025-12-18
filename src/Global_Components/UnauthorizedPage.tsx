import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 text-center p-8 animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert className="w-12 h-12 text-red-600" />
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                <p className="text-gray-600 mb-8">
                    You don't have the required permissions to access this page. This area is reserved for VPs, Advisors, and the President.
                </p>
                
                <button
                    onClick={() => navigate(-1)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Go Back
                </button>
                
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                        Junior Chamber International
                    </p>
                </div>
            </div>
        </div>
    );
}
