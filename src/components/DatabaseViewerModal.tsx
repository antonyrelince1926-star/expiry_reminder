import React, { useState, useEffect } from 'react';
import { X, Database, Table, RefreshCw, Server, HardDrive } from 'lucide-react';

interface DatabaseViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseViewerModal: React.FC<DatabaseViewerModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [activeTable, setActiveTable] = useState<'products' | 'notifications' | 'audit_logs' | 'users'>('products');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTableData = async (table: string) => {
    setLoading(true);
    try {
      if (table === 'products') {
        const res = await fetch('/api/products');
        const json = await res.json();
        setData(json.products || []);
      } else if (table === 'notifications') {
        const res = await fetch('/api/notifications');
        const json = await res.json();
        setData(json.notifications || []);
      } else if (table === 'audit_logs') {
        const res = await fetch('/api/audit-logs');
        const json = await res.json();
        setData(json.logs || []);
      } else if (table === 'users') {
        setData([
          {
            id: 'usr-1',
            name: 'Demo User',
            email: 'demo@expirybox.local',
            password_hash: '$2a$12$e80yqVwI3c3BfgL...',
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (e) {
      console.error(e);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTableData(activeTable);
  }, [activeTable]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/80">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-lg flex items-center space-x-2">
                <span>Relational Database Viewer</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  MySQL 8.0 / JDBC Schema
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Inspect live tables, foreign keys, unique reminder indexes, and audit logs.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Table Selector Tabs */}
        <div className="px-6 py-3 bg-zinc-100 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            {[
              { id: 'products', label: 'products (Table)' },
              { id: 'notifications', label: 'notifications (Table)' },
              { id: 'audit_logs', label: 'audit_logs (Table)' },
              { id: 'users', label: 'users (Table)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTable(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  activeTable === tab.id
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm'
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchTableData(activeTable)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Table</span>
          </button>
        </div>

        {/* Data Table View */}
        <div className="flex-1 overflow-auto p-6 bg-zinc-50/50 dark:bg-zinc-950">
          {loading ? (
            <div className="py-24 text-center space-y-2">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-zinc-500">Querying database table `{activeTable}`...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="py-24 text-center text-zinc-400 text-sm">
              No records found in table `{activeTable}`.
            </div>
          ) : (
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-700">
                    <tr>
                      {Object.keys(data[0]).map((col) => (
                        <th key={col} className="px-4 py-3 font-bold whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
                    {data.map((row, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                        {Object.values(row).map((val: any, vIdx) => (
                          <td key={vIdx} className="px-4 py-2.5 whitespace-nowrap max-w-xs truncate">
                            {val === null ? (
                              <span className="text-zinc-400 italic">NULL</span>
                            ) : typeof val === 'boolean' ? (
                              <span className={val ? 'text-emerald-500 font-bold' : 'text-zinc-400'}>
                                {val ? 'true' : 'false'}
                              </span>
                            ) : (
                              String(val)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/80 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center space-x-2">
            <Server className="w-4 h-4 text-emerald-500" />
            <span>Connection: HikariCP JDBC Pool → MySQL 8.0 Database (`expirybox`)</span>
          </div>
          <span>Total Records: {data.length}</span>
        </div>
      </div>
    </div>
  );
};
