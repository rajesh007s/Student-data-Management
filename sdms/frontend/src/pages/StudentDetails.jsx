import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Mail, Phone, MapPin, Calendar, Users as UsersIcon } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { studentService, attendanceService, markService, feeService } from '../services';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import { SkeletonCard } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/EmptyState';
import { formatDate, formatCurrency, formatPercent, performanceTone, attendanceTone } from '../utils/formatters';

const TABS = ['Overview', 'Academic', 'Attendance', 'Marks', 'Fees', 'Activity'];

export default function StudentDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [marks, setMarks] = useState(null);
  const [fees, setFees] = useState([]);
  const [tab, setTab] = useState('Overview');
  const [error, setError] = useState(false);

  const load = () => {
    setError(false);
    Promise.all([
      studentService.getOne(id),
      attendanceService.history(id),
      markService.studentSummary(id),
      feeService.getAll({ student: id }),
    ])
      .then(([sRes, aRes, mRes, fRes]) => {
        setStudent(sRes.data.data);
        setAttendance(aRes.data.data);
        setMarks(mRes.data.data);
        setFees(fRes.data.data);
      })
      .catch(() => setError(true));
  };

  useEffect(load, [id]);

  if (error) return <ErrorState onRetry={load} />;
  if (!student) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const canEdit = user.role === 'admin' || user.role === 'faculty';

  return (
    <div className="space-y-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-800">
        <ArrowLeft size={15} /> Back
      </button>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <Avatar name={student.name} src={student.profilePhoto} size="xl" />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-2xl font-semibold text-ink-800 dark:text-ink-50">{student.name}</h1>
              <Badge>{student.status}</Badge>
              <Badge tone={performanceTone(student.performanceLabel)}>{student.performanceLabel}</Badge>
            </div>
            <p className="text-sm font-mono text-ink-400 mt-1">
              {student.studentId} · Roll {student.rollNumber}
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-sm text-ink-500 dark:text-ink-400">
              <span className="flex items-center gap-1.5">
                <Mail size={13} /> {student.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone size={13} /> {student.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <UsersIcon size={13} /> {student.department?.name} · {student.course?.courseName}
              </span>
            </div>
          </div>
          {canEdit && (
            <Button variant="outline" icon={Pencil} onClick={() => navigate(`/students/${id}/edit`)}>
              Edit
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-ink-100 dark:border-ink-800">
          <Stat label="Attendance" value={formatPercent(student.attendancePercentage)} />
          <Stat label="CGPA" value={student.cgpa?.toFixed(2)} />
          <Stat label="Semester" value={`Sem ${student.semester}`} />
          <Stat label="Pending Fees" value={formatCurrency(student.pendingFees)} />
        </div>
      </Card>

      <div className="flex gap-1 overflow-x-auto border-b border-ink-100 dark:border-ink-800">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === t
                ? 'border-brass-500 text-ink-800 dark:text-ink-50'
                : 'border-transparent text-ink-400 hover:text-ink-600'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <Card className="p-6 grid sm:grid-cols-2 gap-6">
          <div>
            <h3 className="font-display font-semibold text-ink-800 dark:text-ink-50 mb-3">Personal Details</h3>
            <DetailRow label="Date of Birth" value={formatDate(student.dateOfBirth)} icon={Calendar} />
            <DetailRow label="Gender" value={student.gender} />
            <DetailRow label="Address" value={student.address} icon={MapPin} />
            <DetailRow label="Admission Date" value={formatDate(student.admissionDate)} />
          </div>
          <div>
            <h3 className="font-display font-semibold text-ink-800 dark:text-ink-50 mb-3">Guardian Details</h3>
            <DetailRow label="Parent/Guardian" value={student.parentName} />
            <DetailRow label="Parent Phone" value={student.parentPhone} icon={Phone} />
            <DetailRow label="Section" value={student.section} />
            <DetailRow label="Year" value={`Year ${student.year}`} />
          </div>
        </Card>
      )}

      {tab === 'Academic' && (
        <Card className="p-6">
          <h3 className="font-display font-semibold text-ink-800 dark:text-ink-50 mb-4">Subject Performance</h3>
          {marks?.records?.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={marks.records.map((m) => ({ subject: m.subject, percentage: m.percentage }))}>
                <PolarGrid stroke="#e5e9f2" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar dataKey="percentage" stroke="#1B2A4A" fill="#C9A227" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-ink-400">No marks recorded yet.</p>
          )}
        </Card>
      )}

      {tab === 'Attendance' && (
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Badge tone={attendanceTone(attendance?.summary?.percentage || 0)}>
              {formatPercent(attendance?.summary?.percentage)}
            </Badge>
            <p className="text-sm text-ink-500">
              {attendance?.summary?.present} present · {attendance?.summary?.absent} absent · {attendance?.summary?.late} late
            </p>
          </div>
          <table className="w-full ledger-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Course</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance?.records?.slice(0, 15).map((r) => (
                <tr key={r._id}>
                  <td>{formatDate(r.date)}</td>
                  <td>{r.course?.courseName}</td>
                  <td>
                    <Badge tone={r.status.toLowerCase()}>{r.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'Marks' && (
        <Card className="p-6 overflow-x-auto">
          <table className="w-full ledger-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Internal</th>
                <th>Assignment</th>
                <th>Practical</th>
                <th>External</th>
                <th>Total</th>
                <th>Grade</th>
                <th>GPA</th>
              </tr>
            </thead>
            <tbody>
              {marks?.records?.map((m) => (
                <tr key={m._id}>
                  <td className="font-medium">{m.subject}</td>
                  <td className="font-mono">{m.internalMarks}</td>
                  <td className="font-mono">{m.assignmentMarks}</td>
                  <td className="font-mono">{m.practicalMarks}</td>
                  <td className="font-mono">{m.externalMarks}</td>
                  <td className="font-mono font-semibold">{m.totalMarks}</td>
                  <td>
                    <Badge>{m.grade}</Badge>
                  </td>
                  <td className="font-mono">{m.gpa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'Fees' && (
        <Card className="p-6 overflow-x-auto">
          <table className="w-full ledger-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Pending</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((f) => (
                <tr key={f._id}>
                  <td>{f.feeType}</td>
                  <td className="font-mono">{formatCurrency(f.totalAmount)}</td>
                  <td className="font-mono">{formatCurrency(f.paidAmount)}</td>
                  <td className="font-mono">{formatCurrency(f.pendingAmount)}</td>
                  <td>{formatDate(f.dueDate)}</td>
                  <td>
                    <Badge tone={f.status.toLowerCase()}>{f.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'Activity' && (
        <Card className="p-6">
          <p className="text-sm text-ink-400">Activity history for this student will appear here as records are updated.</p>
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</p>
      <p className="font-mono text-xl font-semibold text-ink-800 dark:text-ink-50 mt-1">{value}</p>
    </div>
  );
}

function DetailRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-ink-50 dark:border-ink-800 last:border-0">
      <span className="text-xs text-ink-400 flex items-center gap-1.5">
        {Icon && <Icon size={12} />} {label}
      </span>
      <span className="text-sm text-ink-700 dark:text-ink-200 text-right">{value || '—'}</span>
    </div>
  );
}
