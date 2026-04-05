/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from './types';
import { Toaster } from './components/ui/sonner';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Overview';
import Students from './components/students/StudentManager';
import Staff from './components/staff/StaffManager';
import Attendance from './components/attendance/AttendanceManager';
import Academic from './components/academic/AcademicManager';
import Exams from './components/exams/ExamManager';
import Finance from './components/finance/FinanceManager';
import UserGuide from './components/UserGuide';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch or create profile
        const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (profileDoc.exists()) {
          setProfile(profileDoc.data() as UserProfile);
        } else {
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'User',
            role: 'admin', // Default first user as admin for simplicity in this demo
            createdAt: Date.now(),
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
          setProfile(newProfile);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Loading Jamia Management System...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        
        <Route element={user ? <DashboardLayout profile={profile} /> : <Navigate to="/login" />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students/*" element={<Students />} />
          <Route path="/staff/*" element={<Staff />} />
          <Route path="/attendance/*" element={<Attendance />} />
          <Route path="/academic/*" element={<Academic />} />
          <Route path="/exams/*" element={<Exams />} />
          <Route path="/finance/*" element={<Finance />} />
          <Route path="/guide" element={<UserGuide />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
