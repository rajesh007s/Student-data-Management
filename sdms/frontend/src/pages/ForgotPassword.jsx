import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { authService } from '../services';
import { Field, Input } from '../components/common/Field';
import Button from '../components/common/Button';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-light dark:bg-surface-dark p-6">
      <div className="w-full max-w-sm">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-800 mb-6">
          <ArrowLeft size={15} /> Back to sign in
        </Link>

        <h1 className="font-display text-2xl font-semibold text-ink-800 dark:text-ink-50">Reset password</h1>
        <p className="text-sm text-ink-500 dark:text-ink-400 mt-1 mb-6">
          Enter the email on your account and we'll help you reset your password.
        </p>

        {sent ? (
          <div className="px-4 py-3 rounded-lg bg-success-50 text-success-600 text-sm border border-success-500/20">
            If that email exists in our system, reset instructions have been generated.
          </div>
        ) : (
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
            <Button type="submit" variant="brass" className="w-full" loading={loading}>
              Send reset instructions
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
