import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { studentService, departmentService, courseService } from '../services';
import { useToast } from '../context/ToastContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Field, Input, Select } from '../components/common/Field';
import { SkeletonCard } from '../components/common/LoadingSkeleton';

const EMPTY = {
  studentId: '', rollNumber: '', name: '', email: '', phone: '', dateOfBirth: '', gender: 'Male',
  address: '', department: '', course: '', year: 1, semester: 1, section: 'A', admissionDate: '',
  parentName: '', parentPhone: '', status: 'active',
};

export default function StudentForm({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState(EMPTY);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    departmentService.getAll().then((res) => setDepartments(res.data.data));
    courseService.getAll({ limit: 100 }).then((res) => setCourses(res.data.data));

    if (mode === 'edit') {
      studentService.getOne(id).then((res) => {
        const s = res.data.data;
        setForm({
          ...EMPTY,
          ...s,
          department: s.department?._id,
          course: s.course?._id,
          dateOfBirth: s.dateOfBirth?.slice(0, 10),
          admissionDate: s.admissionDate?.slice(0, 10),
        });
        setLoading(false);
      });
    }
  }, [id, mode]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const errs = {};
    ['studentId', 'rollNumber', 'name', 'email', 'phone', 'dateOfBirth', 'department', 'course', 'admissionDate', 'parentName', 'parentPhone'].forEach(
      (k) => {
        if (!form[k]) errs[k] = 'Required';
      }
    );
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (mode === 'create') {
        await studentService.create(form);
        toast('Student added successfully.', 'success');
      } else {
        await studentService.update(id, form);
        toast('Student updated successfully.', 'success');
      }
      navigate('/students');
    } catch (err) {
      toast(err.response?.data?.message || 'Something went wrong. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <SkeletonCard />;

  const filteredCourses = form.department ? courses.filter((c) => c.department?._id === form.department || c.department === form.department) : courses;

  return (
    <div className="space-y-5 max-w-4xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-800">
        <ArrowLeft size={15} /> Back
      </button>

      <h1 className="font-display text-2xl font-semibold text-ink-800 dark:text-ink-50">
        {mode === 'create' ? 'Add Student' : 'Edit Student'}
      </h1>

      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          <h3 className="font-display font-semibold text-ink-800 dark:text-ink-50 mb-4">Identification</h3>
          <div className="grid sm:grid-cols-3 gap-x-4">
            <Field label="Student ID" required error={errors.studentId}>
              <Input value={form.studentId} onChange={(e) => update('studentId', e.target.value)} />
            </Field>
            <Field label="Roll Number" required error={errors.rollNumber}>
              <Input value={form.rollNumber} onChange={(e) => update('rollNumber', e.target.value)} />
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={(e) => update('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
                <option value="suspended">Suspended</option>
              </Select>
            </Field>
          </div>

          <h3 className="font-display font-semibold text-ink-800 dark:text-ink-50 mb-4 mt-2">Personal Information</h3>
          <div className="grid sm:grid-cols-3 gap-x-4">
            <Field label="Full Name" required error={errors.name}>
              <Input value={form.name} onChange={(e) => update('name', e.target.value)} />
            </Field>
            <Field label="Email" required error={errors.email}>
              <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
            </Field>
            <Field label="Phone" required error={errors.phone}>
              <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} />
            </Field>
            <Field label="Date of Birth" required error={errors.dateOfBirth}>
              <Input type="date" value={form.dateOfBirth} onChange={(e) => update('dateOfBirth', e.target.value)} />
            </Field>
            <Field label="Gender">
              <Select value={form.gender} onChange={(e) => update('gender', e.target.value)}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </Select>
            </Field>
            <Field label="Address">
              <Input value={form.address} onChange={(e) => update('address', e.target.value)} />
            </Field>
          </div>

          <h3 className="font-display font-semibold text-ink-800 dark:text-ink-50 mb-4 mt-2">Academic Information</h3>
          <div className="grid sm:grid-cols-3 gap-x-4">
            <Field label="Department" required error={errors.department}>
              <Select value={form.department} onChange={(e) => update('department', e.target.value)}>
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Course" required error={errors.course}>
              <Select value={form.course} onChange={(e) => update('course', e.target.value)}>
                <option value="">Select course</option>
                {filteredCourses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.courseName}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Section">
              <Input value={form.section} onChange={(e) => update('section', e.target.value)} />
            </Field>
            <Field label="Year">
              <Select value={form.year} onChange={(e) => update('year', Number(e.target.value))}>
                {[1, 2, 3, 4].map((y) => (
                  <option key={y} value={y}>
                    Year {y}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Semester">
              <Select value={form.semester} onChange={(e) => update('semester', Number(e.target.value))}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Admission Date" required error={errors.admissionDate}>
              <Input type="date" value={form.admissionDate} onChange={(e) => update('admissionDate', e.target.value)} />
            </Field>
          </div>

          <h3 className="font-display font-semibold text-ink-800 dark:text-ink-50 mb-4 mt-2">Guardian Information</h3>
          <div className="grid sm:grid-cols-2 gap-x-4">
            <Field label="Parent/Guardian Name" required error={errors.parentName}>
              <Input value={form.parentName} onChange={(e) => update('parentName', e.target.value)} />
            </Field>
            <Field label="Parent Phone" required error={errors.parentPhone}>
              <Input value={form.parentPhone} onChange={(e) => update('parentPhone', e.target.value)} />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-4 mt-2 border-t border-ink-100 dark:border-ink-800">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" variant="brass" icon={Save} loading={saving}>
              {mode === 'create' ? 'Add Student' : 'Save Changes'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
