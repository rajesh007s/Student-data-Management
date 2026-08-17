import { useEffect, useState } from 'react';
import { Save, CalendarCheck, Check, X, Clock } from 'lucide-react';
import { attendanceService, departmentService, courseService, studentService } from '../services';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import { Field, Select, Input } from '../components/common/Field';
import { EmptyState } from '../components/common/EmptyState';
import { formatPercent, attendanceTone } from '../utils/formatters';

const STATUS_OPTIONS = [
  { value: 'Present', icon: Check, color: 'success' },
  { value: 'Absent', icon: X, color: 'danger' },
  { value: 'Late', icon: Clock, color: 'warning' },
];

export default function Attendance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const canMark = user.role === 'admin' || user.role === 'faculty';

  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [department, setDepartment] = useState('');
  const [course, setCourse] = useState('');
  const [semester, setSemester] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const [students, setStudents] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    departmentService.getAll().then((res) => setDepartments(res.data.data));
    courseService.getAll({ limit: 100 }).then((res) => setCourses(res.data.data));
  }, []);

  const filteredCourses = department ? courses.filter((c) => c.department?._id === department) : courses;

  const loadRoster = async () => {
    if (!course) return;
    const res = await studentService.getAll({ course, limit: 100 });
    const roster = res.data.data;
    setStudents(roster);

    // Pre-fill with existing attendance for this date, if any
    const existingRes = await attendanceService.getAll({ course, date, limit: 100 });
    const existing = {};
    existingRes.data.data.forEach((r) => {
      existing[r.student._id || r.student] = r.status;
    });
    const initial = {};
    roster.forEach((s) => {
      initial[s._id] = existing[s._id] || 'Present';
    });
    setStatuses(initial);
    setLoaded(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = students.map((s) => ({ student: s._id, status: statuses[s._id] }));
      await attendanceService.mark({ course, department, semester: semester || students[0]?.semester, date, records });
      toast('Attendance saved successfully.', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to save attendance.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(statuses).filter((s) => s === 'Present').length;
  const absentCount = Object.values(statuses).filter((s) => s === 'Absent').length;
  const lateCount = Object.values(statuses).filter((s) => s === 'Late').length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-800 dark:text-ink-50">Attendance</h1>
        <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">Mark and review daily class attendance</p>
      </div>

      <Card className="p-5">
        <div className="grid sm:grid-cols-4 gap-4">
          <Field label="Department">
            <Select value={department} onChange={(e) => { setDepartment(e.target.value); setCourse(''); }}>
              <option value="">All departments</option>
              {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </Select>
          </Field>
          <Field label="Course" required>
            <Select value={course} onChange={(e) => setCourse(e.target.value)}>
              <option value="">Select course</option>
              {filteredCourses.map((c) => <option key={c._id} value={c._id}>{c.courseName}</option>)}
            </Select>
          </Field>
          <Field label="Date">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <div className="flex items-end">
            <Button variant="brass" className="w-full" onClick={loadRoster} disabled={!course}>
              Load Class
            </Button>
          </div>
        </div>
      </Card>

      {!loaded ? (
        <Card>
          <EmptyState icon={CalendarCheck} title="Select a class to begin" message="Choose a course and date above, then load the class roster to mark attendance." />
        </Card>
      ) : students.length === 0 ? (
        <Card>
          <EmptyState title="No students enrolled" message="This course has no enrolled students yet." />
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            <Badge tone="excellent">{presentCount} Present</Badge>
            <Badge tone="critical">{absentCount} Absent</Badge>
            <Badge tone="warning">{lateCount} Late</Badge>
          </div>

          <Card>
            <div className="divide-y divide-ink-50 dark:divide-ink-800">
              {students.map((s) => (
                <div key={s._id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar name={s.name} src={s.profilePhoto} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink-800 dark:text-ink-100 truncate">{s.name}</p>
                    <p className="text-xs font-mono text-ink-400">{s.rollNumber}</p>
                  </div>
                  <Badge tone={attendanceTone(s.attendancePercentage)}>{formatPercent(s.attendancePercentage)}</Badge>
                  {canMark && (
                    <div className="flex gap-1 ml-2">
                      {STATUS_OPTIONS.map(({ value, icon: Icon, color }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setStatuses((st) => ({ ...st, [s._id]: value }))}
                          className={`h-8 w-8 rounded-lg flex items-center justify-center border transition-colors ${
                            statuses[s._id] === value
                              ? `bg-${color}-500 text-white border-${color}-500`
                              : 'border-ink-200 dark:border-ink-700 text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-800'
                          }`}
                          style={
                            statuses[s._id] === value
                              ? { backgroundColor: color === 'success' ? '#2F8F5B' : color === 'danger' ? '#D64545' : '#E08E23', borderColor: 'transparent', color: '#fff' }
                              : {}
                          }
                          title={value}
                        >
                          <Icon size={14} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {canMark && (
            <div className="flex justify-end">
              <Button variant="brass" icon={Save} loading={saving} onClick={handleSave}>
                Save Attendance
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
