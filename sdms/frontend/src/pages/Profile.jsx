import { useState } from 'react';
import { Save, KeyRound } from 'lucide-react';
import { authService } from '../services';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import { Field, Input } from '../components/common/Field';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '' });
  const [saving, setSaving] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authService.updateProfile(form);
      updateUser(res.data.data.user);
      toast('Profile updated successfully.', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast('New passwords do not match.', 'error');
      return;
    }
    setPwSaving(true);
    try {
      await authService.changePassword(pwForm);
      toast('Password changed successfully.', 'success');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to change password.', 'error');
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-ink-800 dark:text-ink-50">Profile</h1>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={user.name} src={user.avatar} size="xl" />
          <div>
            <p className="font-display text-lg font-semibold text-ink-800 dark:text-ink-50">{user.name}</p>
            <p className="text-sm text-ink-500">{user.email}</p>
            <Badge tone="good">{user.role}</Badge>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit}>
          <div className="grid sm:grid-cols-2 gap-x-4">
            <Field label="Full Name">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Phone">
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
          </div>
          <div className="flex justify-end mt-2">
            <Button type="submit" variant="brass" icon={Save} loading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <h3 className="font-display font-semibold text-ink-800 dark:text-ink-50 mb-4">Change Password</h3>
        <form onSubmit={handlePasswordSubmit}>
          <Field label="Current Password" required>
            <Input type="password" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
          </Field>
          <div className="grid sm:grid-cols-2 gap-x-4">
            <Field label="New Password" required>
              <Input type="password" minLength={6} value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} required />
            </Field>
            <Field label="Confirm New Password" required>
              <Input type="password" minLength={6} value={pwForm.confirmPassword} onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })} required />
            </Field>
          </div>
          <div className="flex justify-end mt-2">
            <Button type="submit" variant="outline" icon={KeyRound} loading={pwSaving}>
              Change Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
