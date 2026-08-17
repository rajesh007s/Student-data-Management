import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, BookOpen, Users } from 'lucide-react';
import { courseService, departmentService } from '../services';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import Pagination from '../components/common/Pagination';
import { Field, Input, Select } from '../components/common/Field';
import { SkeletonTable } from '../components/common/LoadingSkeleton';
import { EmptyState, ErrorState } from '../components/common/EmptyState';

const EMPTY = { courseCode: '', courseName: '', department: '', credits: 4, semester: 1, description: '' };

export default function Courses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const canManage = user.role === 'admin';

  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
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
    courseService
      .getAll({ search, department: deptFilter, page, limit: 10 })
      .then((res) => {
        setCourses(res.data.data);
        setMeta(res.data.meta);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [search, deptFilter, page]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({ ...c, department: c.department?._id });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await courseService.update(editing._id, form);
        toast('Course updated successfully.', 'success');
      } else {
        await courseService.create(form);
        toast('Course created successfully.', 'success');
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
      await courseService.remove(deleteTarget._id);
      toast('Course deleted successfully.', 'success');
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
          <h1 className="font-display text-2xl font-semibold text-ink-800 dark:text-ink-50">Courses</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">{meta.total} courses offered</p>
        </div>
        {canManage && (
          <Button variant="brass" icon={Plus} onClick={openAdd}>
            Add Course
          </Button>
        )}
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search courses..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-800 focus:bg-white dark:focus:bg-ink-900 focus:border-brass-500 text-ink-800 dark:text-ink-100"
            />
          </div>
          <Select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }} className="sm:w-56">
            <option value="">All departments</option>
            {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
          </Select>
        </div>
      </Card>

      {loading ? (
        <Card><SkeletonTable rows={6} cols={4} /></Card>
      ) : error ? (
        <Card><ErrorState onRetry={load} /></Card>
      ) : courses.length === 0 ? (
        <Card><EmptyState icon={BookOpen} title="No courses found" action={canManage && <Button variant="brass" icon={Plus} onClick={openAdd}>Add Course</Button>} /></Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((c) => (
              <Card key={c._id} hover className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-mono text-brass-600 font-semibold">{c.courseCode}</p>
                    <h3 className="font-display font-semibold text-ink-800 dark:text-ink-50 mt-1">{c.courseName}</h3>
                  </div>
                  {canManage && (
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-ink-400 hover:text-brass-600 hover:bg-ink-50 dark:hover:bg-ink-800">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteTarget(c)} className="p-1.5 rounded-lg text-ink-400 hover:text-danger-500 hover:bg-danger-50">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-ink-500 dark:text-ink-400 mt-2 line-clamp-2">{c.description}</p>
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-ink-50 dark:border-ink-800">
                  <Badge tone="good">{c.department?.name}</Badge>
                  <span className="text-xs text-ink-400">Sem {c.semester}</span>
                  <span className="text-xs text-ink-400">{c.credits} credits</span>
                  <span className="ml-auto flex items-center gap-1 text-xs text-ink-500 font-mono">
                    <Users size={12} /> {c.studentCount ?? c.students?.length ?? 0}
                  </span>
                </div>
              </Card>
            ))}
          </div>
          <Card>
            <Pagination page={meta.page} totalPages={meta.totalPages} total={meta.total} limit={meta.limit} onPageChange={setPage} />
          </Card>
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Course' : 'Add Course'}>
        <form onSubmit={handleSubmit}>
          <div className="grid sm:grid-cols-2 gap-x-4">
            <Field label="Course Code" required>
              <Input value={form.courseCode} onChange={(e) => setForm({ ...form, courseCode: e.target.value })} required />
            </Field>
            <Field label="Course Name" required>
              <Input value={form.courseName} onChange={(e) => setForm({ ...form, courseName: e.target.value })} required />
            </Field>
            <Field label="Department" required>
              <Select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required>
                <option value="">Select department</option>
                {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </Select>
            </Field>
            <Field label="Semester">
              <Select value={form.semester} onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}>
                {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={s}>Semester {s}</option>)}
              </Select>
            </Field>
            <Field label="Credits">
              <Input type="number" min={1} max={10} value={form.credits} onChange={(e) => setForm({ ...form, credits: Number(e.target.value) })} />
            </Field>
          </div>
          <Field label="Description">
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="brass" loading={saving}>{editing ? 'Save Changes' : 'Add Course'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message={`This will remove ${deleteTarget?.courseName} and unassign it from all students.`}
      />
    </div>
  );
}
