import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Field, Input } from '../components/common/Field';
import Button from '../components/common/Button';

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@sdms.edu', password: 'Admin@123' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      toast('Welcome back.', 'success');
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
  };

  return (
    <div className="min-h-screen flex bg-surface-light dark:bg-surface-dark">
      {/* Left: brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink-800 relative overflow-hidden flex-col justify-between p-12">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 39px, #C9A227 39px, #C9A227 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, #C9A227 39px, #C9A227 40px)',
          }}
        />
        <div className="relative flex items-center gap-3">
          <div className="h-11 w-11 rounded-full border-2 border-brass-500 flex items-center justify-center">
            <span className="font-display text-brass-400 font-semibold">M</span>
          </div>
          <div>
            <p className="font-display font-semibold text-white">Meridian College</p>
            <p className="text-[11px] text-ink-400 uppercase tracking-wide">Registrar System</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <p className="font-display text-4xl text-white leading-tight max-w-md">
            The complete academic record, kept in one ledger.
          </p>
          <p className="text-ink-300 mt-4 max-w-sm text-sm leading-relaxed">
            Enrollment, attendance, marks, and fees — tracked with the same care as a registrar's
            handwritten register, built for a modern campus.
          </p>
        </motion.div>

        <p className="relative text-ink-500 text-xs">Est. 1962 · Academic Year 2025–26</p>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-full border-2 border-brass-500 flex items-center justify-center">
              <span className="font-display text-brass-600 font-semibold">M</span>
            </div>
            <p className="font-display font-semibold text-ink-800 dark:text-ink-50">Meridian College</p>
          </div>

          <h1 className="font-display text-2xl font-semibold text-ink-800 dark:text-ink-50">Sign in</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1 mb-6">
            Enter your credentials to access the registrar system.
          </p>

          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-lg bg-danger-50 text-danger-600 text-sm border border-danger-500/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Field label="Email" required>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@sdms.edu"
                  className="pl-9"
                />
              </div>
            </Field>

            <Field label="Password" required>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            <div className="flex justify-end mb-6">
              <Link to="/forgot-password" className="text-xs font-medium text-ink-500 hover:text-brass-600">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="brass" className="w-full" loading={loading} icon={ArrowRight}>
              Sign in
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-ink-100 dark:border-ink-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-2">Demo access</p>
            <div className="flex flex-wrap gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => fillDemo(acc)}
                  className="text-xs px-3 py-1.5 rounded-full border border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-300 hover:border-brass-500 hover:text-brass-600"
                >
                  {acc.role}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-ink-400 mt-2">
              Faculty and student demo logins are printed in the terminal after running the seed script.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
