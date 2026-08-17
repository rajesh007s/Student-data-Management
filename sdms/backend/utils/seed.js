// Seeds the database with realistic demo data.
// Run with: npm run seed  (from the backend/ directory, after setting MONGO_URI in .env)
require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

const connectDB = require('../config/db');
const User = require('../models/User');
const Department = require('../models/Department');
const Faculty = require('../models/Faculty');
const Course = require('../models/Course');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const Fee = require('../models/Fee');
const Notification = require('../models/Notification');
const Activity = require('../models/Activity');
const { calculateTotals } = require('./grading');

const DEPARTMENTS = [
  { name: 'Computer Science', code: 'CSE' },
  { name: 'Electronics & Communication', code: 'ECE' },
  { name: 'Mechanical Engineering', code: 'MECH' },
  { name: 'Civil Engineering', code: 'CIVIL' },
  { name: 'Business Administration', code: 'MBA' },
];

const DESIGNATIONS = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'];
const SUBJECTS_BY_DEPT = {
  CSE: ['Data Structures', 'Algorithms', 'Database Systems', 'Operating Systems', 'Computer Networks', 'Web Development'],
  ECE: ['Digital Electronics', 'Signal Processing', 'Communication Systems', 'Microprocessors'],
  MECH: ['Thermodynamics', 'Fluid Mechanics', 'Machine Design', 'Manufacturing Processes'],
  CIVIL: ['Structural Analysis', 'Surveying', 'Geotechnical Engineering', 'Concrete Technology'],
  MBA: ['Marketing Management', 'Financial Accounting', 'Organizational Behavior', 'Business Strategy'],
};

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function seed() {
  await connectDB();
  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany(),
    Department.deleteMany(),
    Faculty.deleteMany(),
    Course.deleteMany(),
    Student.deleteMany(),
    Attendance.deleteMany(),
    Mark.deleteMany(),
    Fee.deleteMany(),
    Notification.deleteMany(),
    Activity.deleteMany(),
  ]);

  // --- Departments ---
  console.log('Creating departments...');
  const departments = await Department.insertMany(
    DEPARTMENTS.map((d) => ({
      ...d,
      description: `Department of ${d.name}`,
      establishedYear: randomInt(1985, 2015),
    }))
  );

  // --- Admin user ---
  console.log('Creating admin user...');
  const admin = await User.create({
    name: 'System Administrator',
    email: 'admin@sdms.edu',
    password: 'Admin@123',
    role: 'admin',
    phone: faker.phone.number(),
  });

  // --- Faculty (10) ---
  console.log('Creating faculty...');
  const faculty = [];
  for (let i = 0; i < 10; i++) {
    const dept = randomFrom(departments);
    const name = faker.person.fullName();
    const f = await Faculty.create({
      facultyId: `FAC${String(1001 + i)}`,
      name,
      email: faker.internet.email({ firstName: name.split(' ')[0] }).toLowerCase(),
      phone: faker.phone.number(),
      department: dept._id,
      designation: randomFrom(DESIGNATIONS),
      joiningDate: faker.date.past({ years: 10 }),
      qualification: randomFrom(['Ph.D.', 'M.Tech', 'M.E.', 'MBA', 'M.Sc.']),
    });
    faculty.push(f);

    // Corresponding login user
    await User.create({
      name: f.name,
      email: f.email,
      password: 'Faculty@123',
      role: 'faculty',
      faculty: f._id,
      phone: f.phone,
    });
  }

  // --- Courses (8) ---
  console.log('Creating courses...');
  const courses = [];
  let courseCounter = 1;
  for (const dept of departments) {
    const subjectPool = SUBJECTS_BY_DEPT[dept.code] || ['General Studies'];
    const numCourses = dept.code === 'CSE' ? 2 : 1; // ensures we reach 8 total across 5 depts
    for (let i = 0; i < numCourses && courseCounter <= 8; i++) {
      const subject = subjectPool[i % subjectPool.length];
      const deptFaculty = faculty.filter((f) => String(f.department) === String(dept._id));
      const course = await Course.create({
        courseCode: `${dept.code}${100 + courseCounter}`,
        courseName: subject,
        department: dept._id,
        credits: randomInt(3, 5),
        semester: randomInt(1, 8),
        faculty: deptFaculty.length ? [randomFrom(deptFaculty)._id] : [],
        description: `Core course covering ${subject} fundamentals and applications.`,
      });
      courses.push(course);
      courseCounter++;
    }
  }
  // Assign courses back to faculty
  for (const course of courses) {
    for (const facId of course.faculty) {
      await Faculty.findByIdAndUpdate(facId, { $addToSet: { assignedCourses: course._id } });
    }
  }

  // --- Students (30) ---
  console.log('Creating students...');
  const students = [];
  for (let i = 0; i < 30; i++) {
    const dept = randomFrom(departments);
    const deptCourses = courses.filter((c) => String(c.department) === String(dept._id));
    const course = deptCourses.length ? randomFrom(deptCourses) : randomFrom(courses);
    const name = faker.person.fullName();
    const year = randomInt(1, 4);

    const student = await Student.create({
      studentId: `STU${String(2001 + i)}`,
      rollNumber: `${dept.code}${String(year)}${String(100 + i)}`,
      name,
      email: faker.internet.email({ firstName: name.split(' ')[0] }).toLowerCase(),
      phone: faker.phone.number(),
      dateOfBirth: faker.date.birthdate({ min: 18, max: 23, mode: 'age' }),
      gender: randomFrom(['Male', 'Female']),
      address: faker.location.streetAddress({ useFullAddress: true }),
      department: dept._id,
      course: course._id,
      year,
      semester: randomInt((year - 1) * 2 + 1, year * 2),
      section: randomFrom(['A', 'B', 'C']),
      admissionDate: faker.date.past({ years: year }),
      parentName: faker.person.fullName(),
      parentPhone: faker.phone.number(),
      status: 'active',
    });
    students.push(student);
    await Course.findByIdAndUpdate(course._id, { $addToSet: { students: student._id } });

    // Corresponding login user
    await User.create({
      name: student.name,
      email: student.email,
      password: 'Student@123',
      role: 'student',
      student: student._id,
      phone: student.phone,
    });
  }

  // --- Attendance (100+) ---
  console.log('Creating attendance records...');
  const attendanceStatuses = ['Present', 'Present', 'Present', 'Late', 'Absent']; // weighted toward present
  let attendanceCount = 0;
  for (const student of students) {
    const course = courses.find((c) => String(c._id) === String(student.course));
    if (!course) continue;
    const numDays = randomInt(4, 8);
    for (let d = 0; d < numDays; d++) {
      const date = new Date();
      date.setDate(date.getDate() - d * 3);
      try {
        await Attendance.create({
          student: student._id,
          course: course._id,
          department: student.department,
          semester: student.semester,
          date,
          status: randomFrom(attendanceStatuses),
          markedBy: course.faculty[0],
        });
        attendanceCount++;
      } catch (e) {
        // ignore duplicate key collisions on same day
      }
    }
  }
  console.log(`  -> ${attendanceCount} attendance records created`);

  // --- Marks (50+) ---
  console.log('Creating marks records...');
  let markCount = 0;
  for (const student of students) {
    const dept = departments.find((d) => String(d._id) === String(student.department));
    const subjectPool = SUBJECTS_BY_DEPT[dept.code] || ['General Studies'];
    const numSubjects = randomInt(2, 3);
    const course = courses.find((c) => String(c._id) === String(student.course));
    for (let s = 0; s < numSubjects; s++) {
      const internal = randomInt(10, 20);
      const assignment = randomInt(5, 10);
      const practical = randomInt(10, 20);
      const external = randomInt(20, 50);
      const { total, percentage, grade, gpa } = calculateTotals({ internal, assignment, practical, external, maxTotal: 100 });
      await Mark.create({
        student: student._id,
        course: course._id,
        subject: subjectPool[s % subjectPool.length],
        semester: student.semester,
        internalMarks: internal,
        assignmentMarks: assignment,
        practicalMarks: practical,
        externalMarks: external,
        totalMarks: total,
        percentage,
        grade,
        gpa,
        examType: 'Final',
        recordedBy: course.faculty[0],
      });
      markCount++;
    }
  }
  console.log(`  -> ${markCount} marks records created`);

  // --- Fees (30+) ---
  console.log('Creating fee records...');
  let feeCount = 0;
  for (const student of students) {
    const totalAmount = randomFrom([50000, 60000, 75000, 90000]);
    const isPaid = Math.random() > 0.4;
    const paidAmount = isPaid ? totalAmount : Math.round(totalAmount * (Math.random() * 0.6));
    await Fee.create({
      student: student._id,
      department: student.department,
      semester: student.semester,
      academicYear: '2025-2026',
      feeType: 'Tuition',
      totalAmount,
      paidAmount,
      dueDate: faker.date.soon({ days: 60 }),
      paymentDate: paidAmount > 0 ? faker.date.recent({ days: 45 }) : undefined,
      paymentMethod: paidAmount > 0 ? randomFrom(['Cash', 'Card', 'UPI', 'Bank Transfer']) : '',
      receiptNumber: paidAmount > 0 ? `RCPT-${randomInt(10000000, 99999999)}` : '',
      recordedBy: admin._id,
    });
    feeCount++;
  }
  console.log(`  -> ${feeCount} fee records created`);

  // --- Recompute cached student stats from the records just created ---
  console.log('Recomputing student stats...');
  const { recomputeStudentStats } = require('../services/studentStatsService');
  for (const student of students) {
    await recomputeStudentStats(student._id);
  }

  // --- Notifications (20) ---
  console.log('Creating notifications...');
  const notifTemplates = [
    { title: 'New Student Registration', type: 'registration', recipientRole: 'admin' },
    { title: 'Low Attendance Alert', type: 'attendance', recipientRole: 'admin' },
    { title: 'Pending Fee Reminder', type: 'fees', recipientRole: 'admin' },
    { title: 'Exam Results Published', type: 'exam', recipientRole: 'all' },
    { title: 'Campus Announcement', type: 'announcement', recipientRole: 'all' },
  ];
  for (let i = 0; i < 20; i++) {
    const t = randomFrom(notifTemplates);
    const student = randomFrom(students);
    await Notification.create({
      title: t.title,
      message: `${t.title} — ${student.name} (${student.studentId})`,
      type: t.type,
      priority: randomFrom(['low', 'medium', 'high']),
      recipientRole: t.recipientRole,
      relatedStudent: student._id,
      isRead: Math.random() > 0.6,
    });
  }

  // --- Activities ---
  console.log('Creating activity feed...');
  for (const student of students.slice(0, 15)) {
    await Activity.create({
      action: 'Student Added',
      description: `${student.name} was added to the system`,
      entityType: 'Student',
      entityId: student._id,
      performedBy: admin._id,
      icon: 'user-plus',
    });
  }

  console.log('\n✅ Seed complete!');
  console.log('----------------------------------------');
  console.log('Login credentials:');
  console.log('  Admin:   admin@sdms.edu / Admin@123');
  console.log(`  Faculty: ${faculty[0].email} / Faculty@123`);
  console.log(`  Student: ${students[0].email} / Student@123`);
  console.log('----------------------------------------');

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
