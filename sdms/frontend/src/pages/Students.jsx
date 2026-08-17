import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Download, Filter, Eye, Pencil, Trash2, Users } from 'lucide-react';
import { studentService, departmentService } from '../services';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import Pagination from '../components/common/Pagination';
import ConfirmModal from '../components/common/ConfirmModal';
import { Select } from '../components/common/Field';
import { SkeletonTable } from '../components/common/LoadingSkeleton';
import { EmptyState, ErrorState } from '../components/common/EmptyState';
import { formatPercent } from '../utils/formatters';

export default function Students() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [filters, setFilters] = useState({ search: '', department: '', status: '', sort: '-createdAt', page: 1 });

  useEffect(() => {
    departmentService.getAll().then((res) => setDepartments(res.data.data));
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    studentService
      .getAll({ ...filters, limit: 10 })
      .then((res) => {
        setStudents(res.data.data);
        setMeta(res.data.meta);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  const updateFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value, page: 1 }));

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await studentService.remove(deleteTarget._id);
      toast('Student deleted successfully.', 'success');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to delete student.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async () => {
    const res = await studentService.exportCsv();
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'students.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast('Student list exported.', 'success');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-800 dark:text-ink-50">Students</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">
            {meta.total} students enrolled across {departments.length} departments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" icon={Download} onClick={handleExport}>
            Export
          </Button>
          {user.role === 'admin' && (
            <Button variant="brass" icon={Plus} onClick={() => navigate('/students/new')}>
              Add Student
            </Button>
          )}
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Search by name, ID, roll number, email..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-800 focus:bg-white dark:focus:bg-ink-900 focus:border-brass-500 text-ink-800 dark:text-ink-100"
            />
          </div>
          <Select value={filters.department} onChange={(e) => updateFilter('department', e.target.value)} className="md:w-52">
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </Select>
          <Select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)} className="md:w-40">
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="graduated">Graduated</option>
            <option value="suspended">Suspended</option>
          </Select>
          <Select value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)} className="md:w-44">
            <option value="-createdAt">Newest first</option>
            <option value="name">Name (A–Z)</option>
            <option value="-cgpa">CGPA (high–low)</option>
            <option value="attendancePercentage">Attendance (low–high)</option>
          </Select>
        </div>
      </Card>

      <Card>
        {loading ? (
          <SkeletonTable rows={8} cols={7} />
        ) : error ? (
          <ErrorState onRetry={load} />
        ) : students.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No students found"
            message="Try adjusting your filters, or add the first student to this registrar."
            action={
              user.role === 'admin' && (
                <Button variant="brass" icon={Plus} onClick={() => navigate('/students/new')}>
                  Add Student
                </Button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full ledger-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Department</th>
                  <th>Course</th>
                  <th>Attendance</th>
                  <th>CGPA</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <Link to={`/students/${s._id}`} className="flex items-center gap-3">
                        <Avatar name={s.name} src={s.profilePhoto} size="sm" />
                        <div>
                          <p className="font-medium text-ink-800 dark:text-ink-100">{s.name}</p>
                          <p className="text-xs font-mono text-ink-400">{s.studentId}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="text-ink-600 dark:text-ink-300">{s.department?.name}</td>
                    <td className="text-ink-600 dark:text-ink-300">{s.course?.courseName}</td>
                    <td className="font-mono">{formatPercent(s.attendancePercentage)}</td>
                    <td className="font-mono">{s.cgpa?.toFixed(2)}</td>
                    <td>
                      <Badge>{s.status}</Badge>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/students/${s._id}`)}
                          className="p-1.5 rounded-lg text-ink-400 hover:text-ink-700 hover:bg-ink-50 dark:hover:bg-ink-800"
                        >
                          <Eye size={15} />
                        </button>
                        {(user.role === 'admin' || user.role === 'faculty') && (
                          <button
                            onClick={() => navigate(`/students/${s._id}/edit`)}
                            className="p-1.5 rounded-lg text-ink-400 hover:text-brass-600 hover:bg-ink-50 dark:hover:bg-ink-800"
                          >
                            <Pencil size={15} />
                          </button>
                        )}
                        {user.role === 'admin' && (
                          <button
                            onClick={() => setDeleteTarget(s)}
                            className="p-1.5 rounded-lg text-ink-400 hover:text-danger-500 hover:bg-danger-50"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              page={meta.page}
              totalPages={meta.totalPages}
              total={meta.total}
              limit={meta.limit}
              onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
            />
          </div>
        )}
      </Card>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message={`This will permanently remove ${deleteTarget?.name} and their academic records. This cannot be undone.`}
      />
    </div>
  );
}
