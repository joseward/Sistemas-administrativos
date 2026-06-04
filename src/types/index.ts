// Tipos globales para la aplicación

export interface ISchool {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITeacher {
  id: string;
  schoolId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  cedula?: string;
  specialization?: string;
  contractStatus: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubject {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  description?: string;
  credits?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGroup {
  id: string;
  schoolId: string;
  name: string;
  grade: number;
  section?: string;
  totalStudents?: number;
  academicYear: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudent {
  id: string;
  schoolId: string;
  groupId: string;
  firstName: string;
  lastName: string;
  registrationNumber: string;
  dateOfBirth?: Date;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITeacherSubjectGroup {
  id: string;
  teacherId: string;
  subjectId: string;
  groupId: string;
  scheduleDay?: number;
  startTime?: Date;
  endTime?: Date;
  classroom?: string;
  academicYear: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAttendance {
  id: string;
  teacherSubjectGroupId: string;
  studentId: string;
  sessionDate: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IContract {
  id: string;
  schoolId: string;
  teacherId: string;
  academicYear: string;
  contractType: 'full-time' | 'part-time' | 'hourly';
  startDate: Date;
  endDate: Date;
  salary: number;
  signedDate?: Date;
  isSigned: boolean;
  signaturePath?: string;
  createdAt: Date;
  updatedAt: Date;
}
