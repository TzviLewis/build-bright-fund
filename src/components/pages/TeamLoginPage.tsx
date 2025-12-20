import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BaseCrudService } from '@/integrations';
import { Teams } from '@/entities';
import { AlertCircle, Lock, Users, Shield, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TeamLoginPage() {
  const [teamId, setTeamId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!teamId || !password) {
        setError('Please enter both Team ID and password');
        setLoading(false);
        return;
      }

      const { items: teams } = await BaseCrudService.getAll<Teams>('teams');
      const team = teams.find(t => t.teamId?.toString() === teamId);

      if (!team) {
        setError('Team not found');
        setLoading(false);
        return;
      }

      if (team.teamPassword !== password) {
        setError('Invalid password');
        setLoading(false);
        return;
      }

      sessionStorage.setItem('teamAuth', 'true');
      sessionStorage.setItem('teamId', team._id);
      sessionStorage.setItem('teamName', team.teamName || '');

      navigate('/team-dashboard');
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          style={{ top: '-10%', right: '-5%' }}
        />
        <motion.div
          className="absolute w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl"
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          style={{ bottom: '-10%', left: '-5%' }}
        />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 relative z-10">
        {/* Left side - Info */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex flex-col justify-center space-y-8"
        >
          <div className="space-y-4">
            <h1 className="font-heading text-5xl font-bold text-primary-foreground leading-tight">
              Team Dashboard
            </h1>
            <p className="font-paragraph text-xl text-primary-foreground/80">
              Manage your fundraising campaign, track donations, and engage with supporters
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Shield, text: 'Secure authentication' },
              { icon: Users, text: 'Manage team members' },
              { icon: CheckCircle, text: 'Real-time analytics' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-secondary" />
                </div>
                <span className="font-paragraph text-lg text-primary-foreground/90">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col justify-center"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8 lg:p-10 space-y-8">
            {/* Header */}
            <div className="space-y-3 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex justify-center"
              >
                <div className="bg-gradient-to-br from-primary to-secondary text-white p-4 rounded-xl">
                  <Users size={32} />
                </div>
              </motion.div>
              <h2 className="font-heading text-3xl font-bold text-primary">Team Login</h2>
              <p className="font-paragraph text-base text-primary/70">
                Access your team dashboard with secure credentials
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <div className="space-y-3">
                <label htmlFor="teamId" className="block font-heading font-semibold text-primary text-sm">
                  Team ID
                </label>
                <Input
                  id="teamId"
                  type="text"
                  placeholder="Enter your team ID"
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  disabled={loading}
                  className="h-12 border-primary/20 focus:border-secondary focus:ring-secondary"
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="password" className="block font-heading font-semibold text-primary text-sm">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="h-12 border-primary/20 focus:border-secondary focus:ring-secondary"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-heading font-semibold text-base rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Logging in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={18} />
                  </>
                )}
              </Button>
            </form>

            {/* Security Info */}
            <div className="pt-6 border-t border-primary/10">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Lock size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="font-paragraph text-sm text-blue-900">
                  Your credentials are encrypted and stored securely in your session. Never share your password.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-4">
              <p className="font-paragraph text-sm text-primary/70">
                Need help?{' '}
                <Link to="/" className="text-secondary font-semibold hover:underline">
                  Contact support
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
