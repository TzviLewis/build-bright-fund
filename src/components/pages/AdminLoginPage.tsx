import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));

    if (password === 'admin5786') {
      // Store auth token in sessionStorage (cleared when browser closes)
      sessionStorage.setItem('adminAuth', 'true');
      navigate('/admin');
    } else {
      setError('Invalid password. Please try again.');
      setPassword('');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -ml-48 -mb-48"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-8 border border-blue-100">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-full p-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="font-heading text-3xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
              Admin Portal
            </h1>
            <p className="font-paragraph text-base text-blue-600/80">
              Restricted access - authorized personnel only
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border-2 border-red-300 rounded-lg flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="font-paragraph text-sm text-red-700">
                  {error}
                </p>
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="font-paragraph text-sm font-semibold text-blue-900">
                Access Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="border-blue-200 focus:border-blue-600 focus:ring-blue-500 text-lg py-6 bg-blue-50/50"
                autoFocus
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !password}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg py-6 font-semibold text-lg disabled:opacity-70 shadow-lg"
            >
              {isLoading ? 'Verifying...' : 'Enter Dashboard'}
            </Button>
          </form>

          {/* Footer */}
          <div className="pt-6 border-t border-blue-100 text-center">
            <p className="font-paragraph text-xs text-blue-600/60">
              This portal is restricted to authorized administrators only.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
