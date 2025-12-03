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
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-background rounded-lg shadow-2xl p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-primary/10 rounded-full p-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="font-heading text-3xl font-bold text-primary">
              Admin Access
            </h1>
            <p className="font-paragraph text-base text-primary/70">
              Enter your password to access the admin dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-destructive/10 border-2 border-destructive rounded-lg flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="font-paragraph text-sm text-destructive">
                  {error}
                </p>
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="font-paragraph text-sm font-semibold text-primary">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="border-primary/20 focus:border-secondary text-lg py-6"
                autoFocus
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !password}
              className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-lg py-6 font-semibold text-lg disabled:opacity-70"
            >
              {isLoading ? 'Verifying...' : 'Access Dashboard'}
            </Button>
          </form>

          {/* Footer */}
          <div className="pt-6 border-t border-primary/10 text-center">
            <p className="font-paragraph text-xs text-primary/60">
              This area is restricted. Only authorized personnel may proceed.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
