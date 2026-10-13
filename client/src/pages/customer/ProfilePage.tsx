import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { User, Mail, Phone, Lock, Save, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const CustomerProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const payload: any = { name, phone };
      if (newPassword) {
        if (!currentPassword) {
          error('Please provide your current password to set a new password.');
          setIsUpdating(false);
          return;
        }
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await api.put('/auth/profile', payload);
      if (res.data.success && res.data.data) {
        updateUser(res.data.data);
        success('Profile updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err: any) {
      error(err.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-xl font-bold text-dark-primary">Account Profile</h2>
        <p className="text-xs text-dark-secondary mt-0.5">
          Update your personal details and change your account password.
        </p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-5">
        <Input
          label="Full Name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          leftIcon={<User className="w-4 h-4" />}
        />

        <Input
          label="Email Address"
          type="email"
          disabled
          value={user?.email || ''}
          helperText="Email address cannot be changed."
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <Input
          label="Phone Number"
          placeholder="+91 9876543210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          leftIcon={<Phone className="w-4 h-4" />}
        />

        <div className="pt-4 border-t border-gray-100 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-dark-muted">
            Change Password (Optional)
          </h3>

          <Input
            label="Current Password"
            type="password"
            placeholder="Enter existing password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
          />

          <Input
            label="New Password"
            type="password"
            placeholder="Minimum 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
          />
        </div>

        <div className="pt-2">
          <Button type="submit" size="md" isLoading={isUpdating} leftIcon={<Save className="w-4 h-4" />}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
