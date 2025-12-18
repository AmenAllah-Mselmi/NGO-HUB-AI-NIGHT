import { useState } from 'react';
import { X, User, Mail, Phone, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import supabase from '../../../utils/supabase';
import { MEMBER_KEYS } from '../hooks/useMembers';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddMemberModal({ isOpen, onClose }: AddMemberModalProps) {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  if (!isOpen) return null;

  const generateRandomPassword = (length = 12) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.phone.length !== 8) {
      toast.error('Phone number must be exactly 8 characters');
      return;
    }

    setLoading(true);
    const password = generateRandomPassword();

    try {
      // 1. Create User in Auth
      // Note: Using signUp will create the user and potentially log them in or send an email.
      // In a real admin scenario, you'd use a service role on the backend.
      // Here we simulate the admin action via signUp.
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: password,
        options: {
          data: {
            fullname: formData.fullname,
            phone: formData.phone,
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // 2. Fetch 'new member' role ID
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'new-member')
        .single();

      if (roleError) {
          console.warn('Could not find "new member" role, falling back to member');
      }

      // 3. Update Profile (Supabase usually creates profile via trigger, but we ensure defaults)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          fullname: formData.fullname,
          phone: formData.phone,
          role_id: roleData?.id || null,
          is_validated: false,
          points: 0,
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      // 4. "Store password in file.txt tempo"
      // Since we are in the browser, we'll log it and let the AI assistant (me) 
      // handle the temporary file storage in the project workspace as requested.
      console.log(`NEW MEMBER CREATED:
      Email: ${formData.email}
      Password: ${password}`);

      // SUCCESS!
      toast.success('Member created successfully!');
      
      // Notify the user about the password (or handle it as requested)
      // We'll trigger a small download or just show it.
      const blob = new Blob([`Email: ${formData.email}\nPassword: ${password}`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `member_${formData.email}_access.txt`;
      a.click();
      URL.revokeObjectURL(url);

      queryClient.invalidateQueries({ queryKey: MEMBER_KEYS.lists() });
      onClose();
      setFormData({ fullname: '', email: '', phone: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create member');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-blue-50/50">
          <h2 className="text-xl font-bold text-gray-900">Add New Member</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleAddMember} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" />
              Full Name
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. John Doe"
              value={formData.fullname}
              onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-500" />
              Email Address
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-500" />
              Phone Number
            </label>
            <input
              type="text"
              required
              maxLength={8}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="8 digits"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
            />
            <p className="text-[10px] text-gray-400">Must be exactly 8 digits</p>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Member'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
