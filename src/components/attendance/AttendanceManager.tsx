/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { Student, Staff, Attendance } from '../../types';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { 
  CalendarCheck, 
  ScanBarcode, 
  Fingerprint, 
  UserCheck, 
  Clock, 
  Search, 
  Save,
  MessageSquare,
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';

export default function AttendanceManager() {
  const [students, setStudents] = useState<Student[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedClass, setSelectedClass] = useState('1');
  const [selectedSection, setSelectedSection] = useState('A');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, 'present' | 'absent' | 'late'>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      const q = query(
        collection(db, 'students'), 
        where('classId', '==', selectedClass),
        where('sectionId', '==', selectedSection)
      );
      const snap = await getDocs(q);
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student)));
    };

    const fetchStaff = async () => {
      const snap = await getDocs(collection(db, 'staff'));
      setStaff(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Staff)));
    };

    fetchStudents();
    fetchStaff();
  }, [selectedClass, selectedSection]);

  const handleAttendanceChange = (id: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceRecords(prev => ({ ...prev, [id]: status }));
  };

  const saveAttendance = async (type: 'student' | 'staff') => {
    setLoading(true);
    try {
      const entities = type === 'student' ? students : staff;
      const promises = entities.map(async (entity) => {
        const status = attendanceRecords[entity.id] || 'absent';
        const record: Omit<Attendance, 'id'> = {
          entityId: entity.id,
          entityType: type,
          date: attendanceDate,
          status,
          method: 'manual',
        };
        return addDoc(collection(db, 'attendance'), record);
      });

      await Promise.all(promises);
      toast.success(`${type === 'student' ? 'Student' : 'Staff'} attendance saved!`);
      
      // Simulate WhatsApp notification
      toast.info('Notifications sent to parents via WhatsApp');
    } catch (error) {
      toast.error('Failed to save attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 text-center md:text-left">Attendance Management</h1>
          <p className="text-slate-500 text-sm text-center md:text-left">Track daily attendance for students and staff.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border border-slate-100">
          <Clock size={18} className="text-slate-400" />
          <Input 
            type="date" 
            className="border-none focus-visible:ring-0 w-40" 
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="manual" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto md:mx-0">
          <TabsTrigger value="manual" className="gap-2">
            <UserCheck size={16} />
            Manual
          </TabsTrigger>
          <TabsTrigger value="barcode" className="gap-2">
            <ScanBarcode size={16} />
            Barcode
          </TabsTrigger>
          <TabsTrigger value="biometric" className="gap-2">
            <Fingerprint size={16} />
            Biometric
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Student Attendance */}
            <Card className="lg:col-span-2 border-none shadow-md shadow-slate-200/60">
              <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Student Attendance</CardTitle>
                  <CardDescription>Mark attendance for Class {selectedClass}-{selectedSection}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(c => (
                        <SelectItem key={c} value={c}>Class {c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedSection} onValueChange={setSelectedSection}>
                    <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Sec A</SelectItem>
                      <SelectItem value="B">Sec B</SelectItem>
                      <SelectItem value="C">Sec C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead className="text-center">Present</TableHead>
                      <TableHead className="text-center">Late</TableHead>
                      <TableHead className="text-center">Absent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.rollNumber}</TableCell>
                        <TableCell>{student.firstName} {student.lastName}</TableCell>
                        <TableCell className="text-center">
                          <Checkbox 
                            checked={attendanceRecords[student.id] === 'present'} 
                            onCheckedChange={() => handleAttendanceChange(student.id, 'present')}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox 
                            checked={attendanceRecords[student.id] === 'late'} 
                            onCheckedChange={() => handleAttendanceChange(student.id, 'late')}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox 
                            checked={attendanceRecords[student.id] === 'absent'} 
                            onCheckedChange={() => handleAttendanceChange(student.id, 'absent')}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="outline" className="gap-2">
                    <MessageSquare size={16} />
                    Notify Absent
                  </Button>
                  <Button onClick={() => saveAttendance('student')} disabled={loading} className="gap-2">
                    <Save size={16} />
                    {loading ? 'Saving...' : 'Save Attendance'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Staff Attendance */}
            <Card className="border-none shadow-md shadow-slate-200/60">
              <CardHeader>
                <CardTitle>Staff Attendance</CardTitle>
                <CardDescription>Daily check-in for all staff</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
                  {staff.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900">{member.firstName} {member.lastName}</span>
                        <span className="text-[10px] text-slate-500 uppercase">{member.role}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant={attendanceRecords[member.id] === 'present' ? 'default' : 'outline'}
                          className="h-8 w-8 p-0"
                          onClick={() => handleAttendanceChange(member.id, 'present')}
                        >P</Button>
                        <Button 
                          size="sm" 
                          variant={attendanceRecords[member.id] === 'absent' ? 'destructive' : 'outline'}
                          className="h-8 w-8 p-0"
                          onClick={() => handleAttendanceChange(member.id, 'absent')}
                        >A</Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button onClick={() => saveAttendance('staff')} disabled={loading} className="w-full mt-4">
                  Save Staff Attendance
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="barcode">
          <Card className="border-none shadow-md shadow-slate-200/60">
            <CardContent className="flex flex-col items-center justify-center py-20 space-y-6">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse">
                <ScanBarcode size={48} />
              </div>
              <div className="text-center space-y-2 max-w-md">
                <h3 className="text-xl font-bold">Scan ID Card Barcode</h3>
                <p className="text-slate-500">
                  Connect a barcode scanner to your computer. When a student or staff member scans their ID card, the system will automatically mark their attendance and notify parents.
                </p>
              </div>
              <div className="w-full max-w-sm">
                <Input placeholder="Scan barcode here..." className="text-center text-lg h-12" autoFocus />
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-1"><Smartphone size={14} /> Auto App Notification</div>
                <div className="flex items-center gap-1"><MessageSquare size={14} /> WhatsApp Alert</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="biometric">
          <Card className="border-none shadow-md shadow-slate-200/60">
            <CardContent className="flex flex-col items-center justify-center py-20 space-y-6">
              <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Fingerprint size={48} />
              </div>
              <div className="text-center space-y-2 max-w-md">
                <h3 className="text-xl font-bold">Biometric Verification (ZKTeco)</h3>
                <p className="text-slate-500">
                  The system is ready to receive data from connected ZKTeco biometric devices. Supports Thumb impression, Face Recognition, and RFID cards.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col items-center gap-2">
                  <Fingerprint size={24} className="text-slate-400" />
                  <span className="text-sm font-medium">Fingerprint</span>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col items-center gap-2">
                  <UserCheck size={24} className="text-slate-400" />
                  <span className="text-sm font-medium">Face Recognition</span>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col items-center gap-2">
                  <ScanBarcode size={24} className="text-slate-400" />
                  <span className="text-sm font-medium">RFID Card</span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
                <CheckCircle2 size={16} />
                Device Connected: ZKTeco iClock 880
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
