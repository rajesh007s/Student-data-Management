import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Award,
  Wallet,
  AlertTriangle,
  UserPlus,
  ArrowUpRight,
  TrendingDown,
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { dashboardService, studentService } from '../services';
import StatCard from '../components/common/StatCard';
import Card from '../components/common/Card';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { SkeletonGrid, SkeletonCard } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/EmptyState';
import { formatCurrency, formatPercent, formatDate } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

const PIE_COLORS = ['#1B2A4A', '#C9A227', '#2F8F5B', '#E08E23', '#D64545'];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    Promise.all([
      dashboardService.get(),
      user?.role !== 'student' ? studentService.smartInsights() : Promise.resolve(null),
    ])
      .then(([dashRes, insightRes]) => {
        setData(dashRes.data.data);
        if (insightRes) setInsights(insightRes.data.data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, [user?.role]);

  if (error) return <ErrorState onRetry={load} />;

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <SkeletonGrid count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const { stats, charts, recentStudents, recentActivities } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brass-600">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="font-display text-2xl font-semibold text-ink-800 dark:text-ink-50 mt-1">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
        </div>
        {user?.role === 'admin' && (
          <Link to="/students/new">
            <Button variant="brass" icon={UserPlus}>
              Add Student
            </Button>
          </Link>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard index={0} label="Total Students" value={stats.totalStudents} icon={Users} tone="ink" />
        <StatCard index={1} label="Total Faculty" value={stats.totalFaculty} icon={GraduationCap} tone="brass" />
        <StatCard index={2} label="Total Courses" value={stats.totalCourses} icon={BookOpen} tone="ink" />
        <StatCard index={3} label="Avg Attendance" value={formatPercent(stats.avgAttendance)} icon={CalendarCheck} tone="success" />
        <StatCard index={4} label="Avg CGPA" value={stats.avgCgpa} icon={Award} tone="brass" />
        <StatCard index={5} label="Fees Collected" value={formatCurrency(stats.feesCollected)} icon={Wallet} tone="success" />
        <StatCard index={6} label="Pending Fees" value={formatCurrency(stats.pendingFees)} icon={Wallet} tone="warning" />
        <StatCard index={7} label="At-Risk Students" value={stats.atRiskCount} icon={AlertTriangle} tone="danger" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-display font-semibold text-ink-800 dark:text-ink-50 mb-4">Student Enrollment Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={charts.enrollmentTrend}>
              <defs>
                <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1B2A4A" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#1B2A4A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e9f2" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="students" stroke="#1B2A4A" fill="url(#enrollGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="font-display font-semibold text-ink-800 dark:text-ink-50 mb-4">Department Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={charts.deptDistribution} dataKey="students" nameKey="department" innerRadius={50} outerRadius={85} paddingAngle={2}>
                {charts.deptDistribution.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 justify-center">
            {charts.deptDistribution.map((d, i) => (
              <div key={d.department} className="flex items-center gap-1.5 text-xs text-ink-500">
                <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                {d.department}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5">
          <h3 className="font-display font-semibold text-ink-800 dark:text-ink-50 mb-4">Attendance Overview</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={charts.attendanceBuckets} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#2F8F5B" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="font-display font-semibold text-ink-800 dark:text-ink-50 mb-4">Academic Performance</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={charts.performanceBuckets} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#C9A227" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="font-display font-semibold text-ink-800 dark:text-ink-50 mb-4">Fee Collection (6 mo)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={charts.feeCollectionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e9f2" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Line type="monotone" dataKey="collected" stroke="#1B2A4A" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Bottom row: recent students, activity, at-risk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <div className="flex items-center justify-between px-5 pt-5">
            <h3 className="font-display font-semibold text-ink-800 dark:text-ink-50">Recent Students</h3>
            <Link to="/students" className="text-xs text-brass-600 font-medium flex items-center gap-0.5">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="p-3">
            {recentStudents.map((s) => (
              <Link
                key={s._id}
                to={`/students/${s._id}`}
                className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-ink-50 dark:hover:bg-ink-800"
              >
                <Avatar name={s.name} src={s.profilePhoto} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink-800 dark:text-ink-100 truncate">{s.name}</p>
                  <p className="text-xs text-ink-400 truncate">{s.department?.name}</p>
                </div>
                <span className="text-[11px] font-mono text-ink-400">{s.studentId}</span>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-1">
          <h3 className="font-display font-semibold text-ink-800 dark:text-ink-50 px-5 pt-5">Recent Activity</h3>
          <div className="p-3">
            {recentActivities.map((a) => (
              <div key={a._id} className="flex gap-3 px-2 py-2.5">
                <div className="h-7 w-7 rounded-full bg-ink-50 dark:bg-ink-800 flex items-center justify-center shrink-0 mt-0.5">
                  <UserPlus size={13} className="text-ink-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-ink-700 dark:text-ink-200">{a.description}</p>
                  <p className="text-[11px] text-ink-400 mt-0.5">{formatDate(a.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-1 border-danger-500/20">
          <div className="flex items-center gap-2 px-5 pt-5">
            <AlertTriangle size={16} className="text-danger-500" />
            <h3 className="font-display font-semibold text-ink-800 dark:text-ink-50">At-Risk Students</h3>
          </div>
          <div className="p-3">
            {insights?.atRiskStudents?.length ? (
              insights.atRiskStudents.slice(0, 5).map((s) => (
                <div key={s.studentId} className="px-2 py-2.5 border-b last:border-0 border-ink-50 dark:border-ink-800">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{s.name}</p>
                    <Badge tone="critical">{formatPercent(s.attendance)}</Badge>
                  </div>
                  <p className="text-xs text-ink-500 mt-1 flex items-center gap-1">
                    <TrendingDown size={11} /> {s.risk}
                  </p>
                  <p className="text-xs text-ink-400 mt-1 italic">{s.recommendation}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-ink-400 px-2 py-4">No at-risk students flagged right now.</p>
            )}
          </div>
        </Card>
      </div>

      {insights?.summary && (
        <Card className="p-5 bg-ink-800 border-none">
          <h3 className="font-display font-semibold text-white mb-3">Performance Insights</h3>
          <ul className="space-y-1.5">
            {insights.summary.map((line, i) => (
              <li key={i} className="text-sm text-ink-200 flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brass-500 mt-1.5 shrink-0" />
                {line}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
