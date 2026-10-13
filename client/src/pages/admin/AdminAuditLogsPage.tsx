import React, { useState, useEffect } from 'react';
import { adminService } from '../../services';
import { FileText, ShieldCheck } from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await adminService.getAuditLogs();
        if (res.success && res.data) {
          setLogs(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-dark-primary tracking-tight">
          System Audit Logs
        </h1>
        <p className="text-xs text-dark-secondary mt-1">
          Immutable audit record of administrative actions, catalog modifications, and order status transitions.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-dark-secondary font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Admin User</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity Type</th>
                <th className="py-3 px-4">Entity ID</th>
                <th className="py-3 px-4">Audit Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-dark-muted">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-dark-muted">
                    No audit records recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4 text-dark-muted whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-dark-primary">
                      {log.user?.name || 'System / Automated'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold bg-gray-100 text-dark-primary px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-dark-secondary">{log.entityType}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-dark-muted max-w-[120px] truncate">
                      {log.entityId || '—'}
                    </td>
                    <td className="py-3 px-4 max-w-[280px]">
                      <pre className="text-[10px] text-dark-secondary bg-gray-50 p-1 rounded font-mono truncate">
                        {log.detailsJson || '—'}
                      </pre>
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
