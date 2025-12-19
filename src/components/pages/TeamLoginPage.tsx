import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BaseCrudService } from '@/integrations';
import { Teams } from '@/entities';
import { AlertCircle, Lock, Users } from 'lucide-react';

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

      // Get all teams and find the one with matching teamId
      const { items: teams } = await BaseCrudService.getAll<Teams>('teams');
      const team = teams.find(t => t.teamId?.toString() === teamId);

      if (!team) {
        setError('Team not found');
        setLoading(false);
        return;
      }

      // Check password
      if (team.teamPassword !== password) {
        setError('Invalid password');
        setLoading(false);
        return;
      }

      // Store authentication in sessionStorage
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
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <div className="flex justify-center mb-4">
            <div className="bg-primary text-white p-3 rounded-full">
              <Users size={32} />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">Team Login</CardTitle>
          <p className="text-center text-sm text-gray-600">
            Enter your team credentials to access your dashboard
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="teamId" className="text-sm font-medium">
                Team ID
              </label>
              <Input
                id="teamId"
                type="text"
                placeholder="Enter your team ID"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-gray-600 flex items-start gap-2">
              <Lock size={14} className="mt-0.5 flex-shrink-0" />
              <span>Your login credentials are secure and stored in your session.</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
