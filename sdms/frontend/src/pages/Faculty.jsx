import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, GraduationCap, Mail, Phone } from 'lucide-react';
import { facultyService, departmentService } from '../services';
import { useToast } from '../context/ToastContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import Pagination from '../components/common/Pagination';
import { Field, Input, Select } from '../components/common/Field';
import { SkeletonTable } from '../components/common/LoadingSkeleton';
import { EmptyState, ErrorState } from '../components/common/EmptyState';
import { formatDate } from '../utils/formatters';

const EMPTY = {
  facultyId: '', name: '', email: '', phone: '', department: '', designation: 'Assistant Professor',
  joiningDate: '', qualification: '',
};

export default function Faculty() {
  const { toast } = useToast();
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    departmentService.getAll().then((res) => setDepartments(res.data.data));
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    facultyService
      .getAll({ search, page, limit: 10 })
      .then((res) => {
        setFaculty(res.data.data);
        setMeta(res.data.meta);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
  };

  const openEdit = (f) => {
    setEditing(f);
    setForm({ ...f, department: f.department?._id, joiningDate: f.joiningDate?.slice(0, 10) });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await facultyService.update(editing._id, form);
        toast('Faculty updated successfully.', 'success');
      } else {
        await facultyService.create(form);
        toast('Faculty added successfully.', 'success');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast(err.response?.data?.message || 'Something went wrong.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await facultyService.remove(deleteTarget._id);
      toast('Faculty deleted successfully.', 'success');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to delete.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-800 dark:text-ink-50">Faculty</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">{meta.total} faculty members</p>
        </div>
        <Button variant="brass" icon={Plus} onClick={openAdd}>
          Add Faculty
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search faculty by name..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-800 focus:bg-white dark:focus:bg-ink-900 focus:border-brass-500 text-ink-800 dark:text-ink-100"
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <SkeletonTable rows={6} cols={5} />
        ) : error ? (
          <ErrorState onRetry={load} />
        ) : faculty.length === 0 ? (
          <EmptyState icon={GraduationCap} title="No faculty found" message="Add the first faculty member to get started." action={<Button variant="brass" icon={Plus} onClick={openAdd}>Add Faculty</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full ledger-table">
              <thead>
                <tr>
                  <th>Faculty</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Contact</th>
                  <th>Courses</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {faculty.map((f) => (
                  <tr key={f._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={f.name} size="sm" />
                        <div>
                          <p className="font-medium text-ink-800 dark:text-ink-100">{f.name}</p>
                          <p className="text-xs font-mono text-ink-400">{f.facultyId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-ink-600 dark:text-ink-300">{f.department?.name}</td>
                    <td>
                      <Badge tone="good">{f.designation}</Badge>
                    </td>
                    <td className="text-xs text-ink-500">
                      <div className="flex items-center gap-1"><Mail size={11} /> {f.email}</div>
                      <div className="flex items-center gap-1 mt-0.5"><Phone size={11} /> {f.phone}</div>
                    </td>
                    <td className="text-ink-600 dark:text-ink-300">{f.assignedCourses?.length || 0}</td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(f)} className="p-1.5 rounded-lg text-ink-400 hover:text-brass-600 hover:bg-ink-50 dark:hover:bg-ink-800">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setDeleteTarget(f)} className="p-1.5 rounded-lg text-ink-400 hover:text-danger-500 hover:bg-danger-50">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={meta.page} totalPages={meta.totalPages} total={meta.total} limit={meta.limit} onPageChange={setPage} />
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Faculty' : 'Add Faculty'}>
        <form onSubmit={handleSubmit}>
          <div className="grid sm:grid-cols-2 gap-x-4">
            <Field label="Faculty ID" required>
              <Input value={form.facultyId} onChange={(e) => setForm({ ...form, facultyId: e.target.value })} required />
            </Field>
            <Field label="Full Name" required>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </Field>
            <Field label="Email" required>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </Field>
            <Field label="Phone" required>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </Field>
            <Field label="Department" required>
              <Select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required>
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Designation">
              <Select value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })}>
                <option>Professor</option>
                <option>Associate Professor</option>
                <option>Assistant Professor</option>
                <option>Lecturer</option>
                <option>Head of Department</option>
              </Select>
            </Field>
            <Field label="Joining Date" required>
              <Input type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} required />
            </Field>
            <Field label="Qualification">
              <Input value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="brass" loading={saving}>{editing ? 'Save Changes' : 'Add Faculty'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message={`This will remove ${deleteTarget?.name} from the faculty roster.`}
      />
    </div>
  );
}
