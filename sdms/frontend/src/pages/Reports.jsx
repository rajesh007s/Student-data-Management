import { useState } from 'react';
import { FileText, Download, Printer, Users, CalendarCheck, ClipboardList, Wallet, GraduationCap, Building2 } from 'lucide-react';
import { reportService, departmentService } from '../services';
import { useEffect } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Field, Select } from '../components/common/Field';
import { EmptyState } from '../components/common/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';

const REPORT_TYPES = [
  { key: 'students', label: 'Student Report', icon: Users, fn: 'students' },
  { key: 'attendance', label: 'Attendance Report', icon: CalendarCheck, fn: 'attendance' },
  { key: 'marks', label: 'Marks Report', icon: ClipboardList, fn: 'marks' },
  { key: 'fees', label: 'Fee Report', icon: Wallet, fn: 'fees' },
  { key: 'faculty', label: 'Faculty Report', icon: GraduationCap, fn: 'faculty' },
  { key: 'departments', label: 'Department Report', icon: Building2, fn: 'departments' },
];

export default function Reports() {
  const [active, setActive] = useState('students');
  const [department, setDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    departmentService.getAll().then((res) => setDepartments(res.data.data));
  }, []);

  const generate = () => {
    setLoading(true);
    const config = REPORT_TYPES.find((r) => r.key === active);
    const params = active === 'departments' ? undefined : { department: department || undefined };
    reportService[config.fn](params)
      .then((res) => setResult(res.data.data))
      .finally(() => setLoading(false));
  };

  const exportCsv = () => {
    if (!result) return;
    const rows = Array.isArray(result) ? result : result.records || result.students || result.faculty || [];
    if (!rows.length) return;
    const flat = rows.map((r) => JSON.stringify(r));
    const csv = flat.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${active}-report.csv`;
    link.click();
  };

  const rows = result ? (Array.isArray(result) ? result : result.records || result.students || result.faculty || []) : [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-800 dark:text-ink-50">Reports</h1>
        <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">Generate and export institutional reports</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {REPORT_TYPES.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setActive(key); setResult(null); }}
            className={`p-4 rounded-xl2 border text-left transition-colors ${
              active === key
                ? 'bg-ink-800 border-ink-800 text-white'
                : 'bg-white dark:bg-ink-900 border-ink-100 dark:border-ink-800 text-ink-600 dark:text-ink-300 hover:border-brass-500'
            }`}
          >
            <Icon size={18} className={active === key ? 'text-brass-400' : 'text-ink-400'} />
            <p className="text-xs font-medium mt-2">{label}</p>
          </button>
        ))}
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          {active !== 'departments' && (
            <Field label="Department" hint={undefined}>
              <Select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-52">
                <option value="">All departments</option>
                {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </Select>
            </Field>
          )}
          <Button variant="brass" icon={FileText} onClick={generate} loading={loading}>
            Generate Report
          </Button>
          {result && (
            <>
              <Button variant="outline" icon={Download} onClick={exportCsv}>
                Export CSV
              </Button>
              <Button variant="outline" icon={Printer} onClick={() => window.print()}>
                Print
              </Button>
            </>
          )}
        </div>
      </Card>

      {result && (
        <Card>
          {rows.length === 0 && !Array.isArray(result) ? (
            <div className="p-6 grid sm:grid-cols-3 gap-4">
              {Object.entries(result)
                .filter(([k]) => k !== 'records')
                .map(([k, v]) => (
                  <div key={k}>
                    <p className="text-xs uppercase text-ink-400">{k}</p>
                    <p className="font-mono text-lg font-semibold text-ink-800 dark:text-ink-50">
                      {typeof v === 'number' && k.toLowerCase().includes('amount') ? formatCurrency(v) : String(v)}
                    </p>
                  </div>
                ))}
            </div>
          ) : rows.length === 0 ? (
            <EmptyState title="No data for this report" message="Try a different filter." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full ledger-table">
                <thead>
                  <tr>
                    {Object.keys(rows[0])
                      .filter((k) => !['_id', '__v', 'createdAt', 'updatedAt'].includes(k))
                      .slice(0, 7)
                      .map((k) => (
                        <th key={k}>{k}</th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 50).map((r, i) => (
                    <tr key={i}>
                      {Object.entries(r)
                        .filter(([k]) => !['_id', '__v', 'createdAt', 'updatedAt'].includes(k))
                        .slice(0, 7)
                        .map(([k, v]) => (
                          <td key={k}>
                            {typeof v === 'object' && v !== null ? v.name || v.courseName || '—' : String(v ?? '—')}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
