/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'admin' | 'principal' | 'teacher' | 'accountant' | 'receptionist' | 'security' | 'driver';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  photoURL?: string;
  createdAt: number;
}

export interface Student {
  id: string;
  rollNumber: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  admissionDate: string;
  classId: string;
  sectionId: string;
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  address: string;
  feeDetail: {
    monthlyFee: number;
    discount: number;
  };
  photoURL?: string;
  fingerprintId?: string;
  barcode?: string;
  status: 'active' | 'inactive' | 'graduated' | 'left';
  createdAt: number;
}

export interface Staff {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  role: Role;
  phone: string;
  email: string;
  address: string;
  salaryDetail: {
    basicSalary: number;
    allowances: number;
  };
  photoURL?: string;
  fingerprintId?: string;
  status: 'active' | 'inactive';
  createdAt: number;
}

export interface Attendance {
  id: string;
  entityId: string; // studentId or staffId
  entityType: 'student' | 'staff';
  date: string; // YYYY-MM-DD
  checkIn?: string; // HH:mm
  checkOut?: string; // HH:mm
  status: 'present' | 'absent' | 'late' | 'half-day';
  method: 'manual' | 'barcode' | 'biometric' | 'face';
}

export interface Class {
  id: string;
  name: string;
  level: string;
}

export interface Section {
  id: string;
  classId: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface Exam {
  id: string;
  name: string;
  academicYear: string;
  date: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  subjectId: string;
  marksObtained: number;
  totalMarks: number;
  grade: string;
  remarks: string;
}

export interface FeePayment {
  id: string;
  studentId: string;
  month: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending';
}

export interface SalaryPayment {
  id: string;
  staffId: string;
  month: string;
  amount: number;
  bonus: number;
  overtime: number;
  deductions: number;
  date: string;
}
