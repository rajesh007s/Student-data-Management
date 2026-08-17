import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Wallet, Printer, Search } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { feeService, studentService, departmentService } from '../services';
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
import { formatCurrency, formatDate } from '../utils/formatters';

const EMPTY = {
  student: '', department: '', semester: 1, academicYear: '2025-2026', feeType: 'Tuition',
  totalAmount: 50000, paidAmount: 0, dueDate: '', paymentMethod: '', paymentDate: '',
};

export default function Fees() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user.role === 'admin';

  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    studentService.getAll({ limit: 100 }).then((res) => setStudents(res.data.data));
    departmentService.getAll().then((res) => setDepartments(res.data.data));
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    const params = { page, limit: 10, status };
    if (!isAdmin) params.student = user.student;
    feeService
      .getAll(params)
      .then((res) => {
        setFees(res.data.data);
        setMeta(res.data.meta);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [status, page, isAdmin, user.student]);

  useEffect(load, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
  };

  const openEdit = (f) => {
    setEditing(f);
    setForm({
      ...f,
      student: f.student?._id,
      department: f.department?._id,
      dueDate: f.dueDate?.slice(0, 10),
      paymentDate: f.paymentDate?.slice(0, 10) || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await feeService.update(editing._id, form);
        toast('Payment updated successfully.', 'success');
      } else {
        await feeService.create({ ...form, paymentDate: form.paidAmount > 0 ? new Date().toISOString() : undefined });
        toast('Payment recorded successfully.', 'success');
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
      await feeService.remove(deleteTarget._id);
      toast('Fee record deleted successfully.', 'success');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to delete.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const viewReceipt = async (id) => {
    const res = await feeService.receipt(id);
    setReceipt(res.data.data);
  };

  const totalCollected = fees.reduce((s, f) => s + f.paidAmount, 0);
  const totalPending = fees.reduce((s, f) => s + f.pendingAmount, 0);
  const pieData = [
    { name: 'Paid', value: totalCollected },
    { name: 'Pending', value: totalPending },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-800 dark:text-ink-50">Fees</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">Fee collection and payment history</p>
        </div>
        {isAdmin && (
          <Button variant="brass" icon={Plus} onClick={openAdd}>
            Record Payment
          </Button>
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Total Collected</p>
          <p className="font-mono text-2xl font-semibold text-success-600 mt-1.5">{formatCurrency(totalCollected)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Total Pending</p>
          <p className="font-mono text-2xl font-semibold text-warning-600 mt-1.5">{formatCurrency(totalPending)}</p>
        </Card>
        <Card className="p-5">
          <ResponsiveContainer width="100%" height={80}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={20} outerRadius={35}>
                <Cell fill="#2F8F5B" />
                <Cell fill="#E08E23" />
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-4">
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-48">
          <option value="">All statuses</option>
          <option value="Paid">Paid</option>
          <option value="Partial">Partial</option>
          <option value="Pending">Pending</option>
          <option value="Overdue">Overdue</option>
        </Select>
      </Card>

      <Card>
        {loading ? (
          <SkeletonTable rows={6} cols={6} />
        ) : error ? (
          <ErrorState onRetry={load} />
        ) : fees.length === 0 ? (
          <EmptyState icon={Wallet} title="No fee records found" action={isAdmin && <Button variant="brass" icon={Plus} onClick={openAdd}>Record Payment</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full ledger-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Type</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Pending</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((f) => (
                  <tr key={f._id}>
                    <td className="font-medium">{f.student?.name}</td>
                    <td>{f.feeType}</td>
                    <td className="font-mono">{formatCurrency(f.totalAmount)}</td>
                    <td className="font-mono">{formatCurrency(f.paidAmount)}</td>
                    <td className="font-mono">{formatCurrency(f.pendingAmount)}</td>
                    <td>{formatDate(f.dueDate)}</td>
                    <td><Badge tone={f.status.toLowerCase()}>{f.status}</Badge></td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => viewReceipt(f._id)} className="p-1.5 rounded-lg text-ink-400 hover:text-ink-700 hover:bg-ink-50 dark:hover:bg-ink-800">
                          <Printer size={15} />
                        </button>
                        {isAdmin && (
                          <>
                            <button onClick={() => openEdit(f)} className="p-1.5 rounded-lg text-ink-400 hover:text-brass-600 hover:bg-ink-50 dark:hover:bg-ink-800">
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => setDeleteTarget(f)} className="p-1.5 rounded-lg text-ink-400 hover:text-danger-500 hover:bg-danger-50">
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Payment' : 'Record Payment'}>
        <form onSubmit={handleSubmit}>
          <div className="grid sm:grid-cols-2 gap-x-4">
            <Field label="Student" required>
              <Select value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })} required>
                <option value="">Select student</option>
                {students.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </Select>
            </Field>
            <Field label="Department" required>
              <Select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required>
                <option value="">Select department</option>
                {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </Select>
            </Field>
            <Field label="Fee Type">
              <Select value={form.feeType} onChange={(e) => setForm({ ...form, feeType: e.target.value })}>
                <option>Tuition</option><option>Hostel</option><option>Library</option><option>Lab</option><option>Exam</option><option>Transport</option><option>Other</option>
              </Select>
            </Field>
            <Field label="Academic Year">
              <Input value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} />
            </Field>
            <Field label="Total Amount" required>
              <Input type="number" min={0} value={form.totalAmount} onChange={(e) => setForm({ ...form, totalAmount: Number(e.target.value) })} required />
            </Field>
            <Field label="Paid Amount">
              <Input type="number" min={0} value={form.paidAmount} onChange={(e) => setForm({ ...form, paidAmount: Number(e.target.value) })} />
            </Field>
            <Field label="Due Date" required>
              <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
            </Field>
            <Field label="Payment Method">
              <Select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
                <option value="">—</option>
                <option>Cash</option><option>Card</option><option>UPI</option><option>Bank Transfer</option><option>Cheque</option>
              </Select>
            </Field>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="brass" loading={saving}>{editing ? 'Save Changes' : 'Record Payment'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!receipt} onClose={() => setReceipt(null)} title="Payment Receipt" size="sm">
        {receipt && (
          <div className="font-mono text-sm space-y-2">
            <div className="text-center pb-3 border-b border-dashed border-ink-200 dark:border-ink-700 mb-3">
              <p className="font-display text-base font-semibold text-ink-800 dark:text-ink-50">Meridian College</p>
              <p className="text-xs text-ink-400">{receipt.receiptNumber}</p>
            </div>
            <Row label="Student" value={receipt.studentName} />
            <Row label="Student ID" value={receipt.studentId} />
            <Row label="Department" value={receipt.department} />
            <Row label="Fee Type" value={receipt.feeType} />
            <Row label="Total" value={formatCurrency(receipt.totalAmount)} />
            <Row label="Paid" value={formatCurrency(receipt.paidAmount)} />
            <Row label="Pending" value={formatCurrency(receipt.pendingAmount)} />
            <Row label="Status" value={receipt.status} />
            <Button variant="outline" className="w-full mt-4" icon={Printer} onClick={() => window.print()}>
              Print
            </Button>
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message="This fee record will be permanently removed."
      />
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink-400">{label}</span>
      <span className="text-ink-800 dark:text-ink-100">{value}</span>
    </div>
  );
}
