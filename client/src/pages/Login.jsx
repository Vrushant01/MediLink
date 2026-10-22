import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AuthShell from '../layouts/AuthShell';
import Button from '../components/Button';
import Input from '../components/Input';
import { usePageTitle } from '../hooks/usePageTitle';
import { AlertCircle, Clock } from 'lucide-react';

// Login page featuring demo account autofill, approval status warning, and role redirection
export default function Login() {
  usePageTitle('Sign In');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPendingApproval, setIsPendingApproval] = useState(false);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setIsPendingApproval(false);

    try {
      const user = await login(email, password);
      toast.success(`Signed in as ${user.businessName || user.name}`);

      // Redirect to target path or role home
      const destination =
        location.state?.from?.pathname ||
        (user.role === 'store'
          ? '/store'
          : user.role === 'supplier'
          ? '/supplier'
          : '/admin');

      navigate(destination, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Unable to sign in';
      setErrorMessage(msg);

      // Check if account is waiting for admin approval (HTTP 403)
      if (err.response?.status === 403 || msg.toLowerCase().includes('approval')) {
        setIsPendingApproval(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Autofill helpers for demo accounts
  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage('');
    setIsPendingApproval(false);
  };

  return (
    <AuthShell formMaxWidth="max-w-[400px]">
      <div>
        {/* Title */}
        <h2 className="font-display text-[36px] font-medium leading-tight text-ink mb-2">
          Sign in
        </h2>
        <p className="text-[15px] font-sans text-ink-soft mb-8">
          Enter your registered pharmacy credentials to access your portal.
        </p>

        {/* Inline Error Message */}
        {errorMessage && (
          <div
            className={`p-3.5 rounded-[6px] border text-xs mb-6 flex items-start gap-2.5 animate-fade-in ${
              isPendingApproval
                ? 'bg-status-warning-bg text-status-warning border-[#F2DE97]'
                : 'bg-status-expired-bg text-status-expired border-[#F5C2BC]'
            }`}
          >
            {isPendingApproval ? (
              <Clock className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <div className="leading-relaxed">
              <span className="font-medium">
                {isPendingApproval ? 'Approval Pending: ' : 'Authentication Failed: '}
              </span>
              {errorMessage}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="store@medilink.test"
            required
            autoComplete="email"
          />

          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              Sign in
            </Button>
          </div>
        </form>

        {/* Demo Accounts Bar */}
        <div className="mt-8 pt-6 border-t border-line">
          <span className="block text-[12px] font-sans font-medium text-ink-soft mb-2">
            Demo accounts
          </span>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-paper/60 border border-line rounded-[8px]">
            <button
              type="button"
              onClick={() => fillDemoAccount('jayambe@medilink.test', 'store123')}
              className="px-2 py-1.5 text-xs font-sans font-medium rounded-[5px] hover:bg-surface text-ink transition-colors text-center"
            >
              Store
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('ganesh@medilink.test', 'supplier123')}
              className="px-2 py-1.5 text-xs font-sans font-medium rounded-[5px] hover:bg-surface text-ink transition-colors text-center"
            >
              Supplier
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@medilink.test', 'admin123')}
              className="px-2 py-1.5 text-xs font-sans font-medium rounded-[5px] hover:bg-surface text-ink transition-colors text-center"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Register link */}
        <p className="mt-6 text-center text-xs text-ink-soft">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="text-ink font-medium underline underline-offset-4 hover:text-brand"
          >
            Apply for access
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
