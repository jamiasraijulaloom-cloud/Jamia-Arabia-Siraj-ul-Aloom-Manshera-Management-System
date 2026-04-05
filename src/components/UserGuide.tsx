/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { 
  BookOpen, 
  UserPlus, 
  CalendarCheck, 
  FileSpreadsheet, 
  Wallet, 
  ShieldCheck,
  Smartphone,
  Printer,
  Search,
  Users
} from 'lucide-react';

export default function UserGuide() {
  const sections = [
    {
      title: 'Getting Started',
      icon: BookOpen,
      content: 'Welcome to the Jamia Arabia Management System. This software is designed to streamline school operations. Start by setting up your Classes, Sections, and Subjects in the Academic module.'
    },
    {
      title: 'Student Enrollment',
      icon: UserPlus,
      content: 'Navigate to the Students module to enroll new students. You can add detailed personal, family, and fee information. Use the "Import Excel" feature for bulk enrollment.'
    },
    {
      title: 'Attendance Tracking',
      icon: CalendarCheck,
      content: 'Attendance can be marked manually, via Barcode scanning, or using Biometric devices (ZKTeco). Parents are automatically notified via WhatsApp/SMS upon check-in and check-out.'
    },
    {
      title: 'Exam Management',
      icon: FileSpreadsheet,
      content: 'Create exams, link subjects to students, and insert marks. The system automatically calculates positions and grades. You can generate and print professional result cards as PDFs.'
    },
    {
      title: 'Finance & Accounts',
      icon: Wallet,
      content: 'Manage student fees and staff salaries. Track monthly income and expenses. The system handles bonuses, overtime, loans, and penalties accurately.'
    },
    {
      title: 'Staff & Roles',
      icon: Users,
      content: 'Create multiple roles (Principal, Teacher, Accountant, etc.) and assign specific permissions. Each user logs in with their own credentials and sees only authorized modules.'
    },
    {
      title: 'Security & Backup',
      icon: ShieldCheck,
      content: 'The system is highly secure with password protection. Daily auto-backups ensure your data is safe. Multi-user support allows multiple computers to connect to a single database.'
    },
    {
      title: 'ID Cards & Certificates',
      icon: Printer,
      content: 'Generate and print Student ID Cards with barcodes, Admission Forms, School Leaving Certificates, and Result Cards directly from the system.'
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl font-bold text-slate-900">User Guide & Documentation</h1>
        <p className="text-slate-500">
          Learn how to use the Jamia Arabia Siraj ul Aloom Manshera Management System effectively.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sections.map((section, index) => (
          <Card key={index} className="border-none shadow-md shadow-slate-200/60 hover:shadow-lg transition-all">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                <section.icon size={24} />
              </div>
              <CardTitle className="text-lg">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 leading-relaxed">
                {section.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-md shadow-slate-200/60 bg-slate-900 text-white">
        <CardHeader>
          <CardTitle className="text-white">Quick Tips for Administrators</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 text-amber-400 font-bold">1</div>
              <div>
                <h4 className="font-semibold">Search Everything</h4>
                <p className="text-sm text-slate-400">Use the global search bar at the top to quickly find students by name, roll number, or class.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 text-amber-400 font-bold">2</div>
              <div>
                <h4 className="font-semibold">Bulk Actions</h4>
                <p className="text-sm text-slate-400">Save time by using bulk student promotion and bulk marks insertion features.</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 text-amber-400 font-bold">3</div>
              <div>
                <h4 className="font-semibold">Real-time Notifications</h4>
                <p className="text-sm text-slate-400">Ensure your WhatsApp API is connected to send auto-alerts to parents for attendance and results.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 text-amber-400 font-bold">4</div>
              <div>
                <h4 className="font-semibold">Data Export</h4>
                <p className="text-sm text-slate-400">All tables can be exported to Excel or PDF for offline record keeping and printing.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center pt-8 border-t border-slate-200">
        <p className="text-slate-400 text-sm italic">
          Need more help? Contact Abdulrehman Habib for technical support and system customization.
        </p>
      </div>
    </div>
  );
}
