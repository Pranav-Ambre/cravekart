import React, { useState, useEffect } from 'react';
import { adminService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { Users, Power, ShieldCheck } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { success, error } = useToast();

  const loadUsers = async () => {
    try {
      const res = await adminService.getUsers();
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleUser = async (u: any) => {
    try {
      const res = await adminService.toggleUserStatus(u.id, !u.isActive);
      if (res.success) {
        success(`User account status updated`);
        loadUsers();
      }
    } catch (err: any) {
      error(err.message || 'Failed to update user');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-dark-primary tracking-tight">
          Customer Management
        </h1>
        <p className="text-xs text-dark-secondary mt-1">
          View registered customer accounts, roles, total orders placed, and manage account statuses.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-dark-secondary font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Orders Placed</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-dark-muted">
                    Loading users...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-dark-primary">{u.name}</td>
                    <td className="py-3 px-4 text-dark-secondary">{u.email}</td>
                    <td className="py-3 px-4">{u.phone || '—'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-gray-100 text-dark-secondary'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold">{u._count?.orders || 0}</td>
                    <td className="py-3 px-4 text-dark-muted">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          u.isActive ? 'bg-green-50 text-success' : 'bg-red-50 text-danger'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleUser(u)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            u.isActive
                              ? 'text-danger hover:bg-red-50'
                              : 'text-success hover:bg-green-50'
                          }`}
                          title={u.isActive ? 'Suspend User' : 'Activate User'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
