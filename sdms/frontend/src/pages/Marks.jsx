import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, ClipboardList } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { markService, studentService, courseService } from '../services';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import { Field, Input, Select } from '../components/common/Field';
import { SkeletonTable } from '../components/common/LoadingSkeleton';
import { EmptyState, ErrorState } from '../components/common/EmptyState';

const EMPTY = {
  student: '', course: '', subject: '', semester: 1, internalMarks: 0, assignmentMarks: 0,
  practicalMarks: 0, externalMarks: 0, examType: 'Final',
};

export default function Marks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const canManage = user.role === 'admin' || user.role === 'faculty';

  const [marks, setMarks] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseFilter, setCourseFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    studentService.getAll({ limit: 100 }).then((res) => setStudents(res.data.data));
    courseService.getAll({ limit: 100 }).then((res) => setCourses(res.data.data));
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    markService
      .getAll({ course: courseFilter, limit: 100 })
      .then((res) => setMarks(res.data.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [courseFilter]);

  useEffect(load, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
  };

  const openEdit = (m) => {
    setEditing(m);
    setForm({ ...m, student: m.student?._id, course: m.course?._id });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await markService.update(editing._id, form);
        toast('Marks updated successfully.', 'success');
      } else {
        await markService.create(form);
        toast('Marks recorded successfully.', 'success');
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
      await markService.remove(deleteTarget._id);
      toast('Mark record deleted successfully.', 'success');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to delete.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Subject-wise average for chart
  const subjectAverages = Object.values(
    marks.reduce((acc, m) => {
      if (!acc[m.subject]) acc[m.subject] = { subject: m.subject, total: 0, count: 0 };
      acc[m.subject].total += m.percentage;
      acc[m.subject].count += 1;
      return acc;
    }, {})
  ).map((s) => ({ subject: s.subject, avg: Math.round((s.total / s.count) * 10) / 10 }));

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-800 dark:text-ink-50">Marks</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">Academic performance and grading</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="w-48">
            <option value="">All courses</option>
            {courses.map((c) => <option key={c._id} value={c._id}>{c.courseName}</option>)}
          </Select>
          {canManage && (
            <Button variant="brass" icon={Plus} onClick={openAdd}>
              Add Marks
            </Button>
          )}
        </div>
      </div>

      {subjectAverages.length > 0 && (
        <Card className="p-5">
          <h3 className="font-display font-semibold text-ink-800 dark:text-ink-50 mb-4">Subject Performance (Avg %)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={subjectAverages}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e9f2" vertical={false} />
              <XAxis dataKey="subject" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="avg" fill="#1B2A4A" radius={[4, 4, 0, 0]} barSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      <Card>
        {loading ? (
          <SkeletonTable rows={6} cols={7} />
        ) : error ? (
          <ErrorState onRetry={load} />
        ) : marks.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No marks recorded" action={canManage && <Button variant="brass" icon={Plus} onClick={openAdd}>Add Marks</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full ledger-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Subject</th>
                  <th>Total</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                  <th>GPA</th>
                  {canManage && <th className="text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {marks.map((m) => (
                  <tr key={m._id}>
                    <td className="font-medium">{m.student?.name}</td>
                    <td>{m.subject}</td>
                    <td className="font-mono">{m.totalMarks}/100</td>
                    <td className="font-mono">{m.percentage}%</td>
                    <td><Badge>{m.grade}</Badge></td>
                    <td className="font-mono">{m.gpa}</td>
                    {canManage && (
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg text-ink-400 hover:text-brass-600 hover:bg-ink-50 dark:hover:bg-ink-800">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => setDeleteTarget(m)} className="p-1.5 rounded-lg text-ink-400 hover:text-danger-500 hover:bg-danger-50">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Marks' : 'Add Marks'}>
        <form onSubmit={handleSubmit}>
          <div className="grid sm:grid-cols-2 gap-x-4">
            <Field label="Student" required>
              <Select value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })} required>
                <option value="">Select student</option>
                {students.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </Select>
            </Field>
            <Field label="Course" required>
              <Select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} required>
                <option value="">Select course</option>
                {courses.map((c) => <option key={c._id} value={c._id}>{c.courseName}</option>)}
              </Select>
            </Field>
            <Field label="Subject" required>
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
            </Field>
            <Field label="Exam Type">
              <Select value={form.examType} onChange={(e) => setForm({ ...form, examType: e.target.value })}>
                <option>Midterm</option>
                <option>Final</option>
                <option>Supplementary</option>
              </Select>
            </Field>
            <Field label="Internal (0-20)">
              <Input type="number" min={0} max={20} value={form.internalMarks} onChange={(e) => setForm({ ...form, internalMarks: Number(e.target.value) })} />
            </Field>
            <Field label="Assignment (0-10)">
              <Input type="number" min={0} max={10} value={form.assignmentMarks} onChange={(e) => setForm({ ...form, assignmentMarks: Number(e.target.value) })} />
            </Field>
            <Field label="Practical (0-20)">
              <Input type="number" min={0} max={20} value={form.practicalMarks} onChange={(e) => setForm({ ...form, practicalMarks: Number(e.target.value) })} />
            </Field>
            <Field label="External (0-50)">
              <Input type="number" min={0} max={50} value={form.externalMarks} onChange={(e) => setForm({ ...form, externalMarks: Number(e.target.value) })} />
            </Field>
          </div>
          <p className="text-xs text-ink-400 mb-4">Total, percentage, grade, and GPA are calculated automatically.</p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="brass" loading={saving}>{editing ? 'Save Changes' : 'Add Marks'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message="This mark record will be permanently removed."
      />
    </div>
  );
}
