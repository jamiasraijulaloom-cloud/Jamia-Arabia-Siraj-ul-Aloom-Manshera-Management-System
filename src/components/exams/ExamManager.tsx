/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, getDocs, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Exam, ExamResult, Student, Subject } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { 
  FileSpreadsheet, 
  Plus, 
  Printer, 
  Download, 
  Share2, 
  Trophy, 
  Award,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function ExamManager() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('10');
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubExams = onSnapshot(query(collection(db, 'exams'), orderBy('date', 'desc')), (snap) => {
      const examData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exam));
      setExams(examData);
      if (examData.length > 0) setSelectedExam(examData[0].id);
    });

    const unsubSubjects = onSnapshot(query(collection(db, 'subjects')), (snap) => {
      setSubjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject)));
    });

    return () => {
      unsubExams();
      unsubSubjects();
    };
  }, []);

  useEffect(() => {
    if (selectedExam && selectedClass) {
      const fetchResults = async () => {
        setLoading(true);
        // In a real app, we would query results for the selected exam and class
        // For this demo, we'll fetch all students in the class
        const q = query(collection(db, 'students'), where('classId', '==', selectedClass));
        const snap = await getDocs(q);
        setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student)));
        setLoading(false);
      };
      fetchResults();
    }
  }, [selectedExam, selectedClass]);

  const generateResultCard = (student: Student) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text('JAMIA ARABIA SIRAJ UL ALOOM', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text('MANSHERA, PAKISTAN', 105, 28, { align: 'center' });
    
    doc.setFontSize(18);
    doc.setTextColor(59, 130, 246);
    doc.text('EXAMINATION RESULT CARD', 105, 40, { align: 'center' });
    
    // Student Info
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 45, 190, 45);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Student Name:', 20, 55);
    doc.text('Roll Number:', 20, 62);
    doc.text('Class:', 20, 69);
    
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(`${student.firstName} ${student.lastName}`, 50, 55);
    doc.text(student.rollNumber, 50, 62);
    doc.text(`Class ${student.classId}-${student.sectionId}`, 50, 69);
    
    // Table
    const tableData = subjects.map(sub => [
      sub.name,
      '100',
      Math.floor(Math.random() * 40) + 60, // Mock marks
      'A'
    ]);
    
    (doc as any).autoTable({
      startY: 80,
      head: [['Subject', 'Total Marks', 'Obtained Marks', 'Grade']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
    });
    
    // Footer
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(12);
    doc.text('Position in Class: 1st', 20, finalY);
    doc.text('Percentage: 85%', 20, finalY + 8);
    doc.text('Remarks: Excellent Performance', 20, finalY + 16);
    
    doc.text('Principal Signature', 150, finalY + 30);
    doc.line(140, finalY + 25, 190, finalY + 25);
    
    doc.save(`${student.firstName}_Result.pdf`);
    toast.success('Result card generated successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Exam Management</h1>
          <p className="text-slate-500 text-sm">Manage exams, marks insertion, and result cards.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download size={18} />
            Export Results
          </Button>
          <Button className="gap-2">
            <Plus size={18} />
            Create Exam
          </Button>
        </div>
      </div>

      <Tabs defaultValue="results" className="space-y-6">
        <TabsList className="bg-white border border-slate-200">
          <TabsTrigger value="results" className="gap-2"><FileText size={16} /> Results</TabsTrigger>
          <TabsTrigger value="grading" className="gap-2"><Trophy size={16} /> Grading System</TabsTrigger>
          <TabsTrigger value="positions" className="gap-2"><Award size={16} /> Positions</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-6">
          <Card className="border-none shadow-md shadow-slate-200/60">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="space-y-1">
                  <CardTitle>Marks Insertion</CardTitle>
                  <CardDescription>Enter marks for the selected exam and class</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Select value={selectedExam} onValueChange={setSelectedExam}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select Exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map(exam => (
                      <SelectItem key={exam.id} value={exam.id}>{exam.name}</SelectItem>
                    ))}
                    <SelectItem value="final">Final Term 2026</SelectItem>
                    <SelectItem value="mid">Mid Term 2026</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(c => (
                      <SelectItem key={c} value={c}>Class {c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-slate-100 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Total Marks</TableHead>
                      <TableHead>Obtained</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8">Loading students...</TableCell></TableRow>
                    ) : students.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-500">No students found in this class.</TableCell></TableRow>
                    ) : (
                      students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.rollNumber}</TableCell>
                          <TableCell>{student.firstName} {student.lastName}</TableCell>
                          <TableCell>500</TableCell>
                          <TableCell>
                            <Input type="number" className="w-20 h-8" placeholder="0" />
                          </TableCell>
                          <TableCell>--</TableCell>
                          <TableCell>--</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-slate-400 hover:text-primary"
                                onClick={() => generateResultCard(student)}
                              >
                                <Printer size={16} />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-emerald-600">
                                <Share2 size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-6 flex justify-end">
                <Button className="gap-2">
                  <CheckCircle2 size={18} />
                  Save All Results
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grading">
          <Card className="border-none shadow-md shadow-slate-200/60">
            <CardHeader>
              <CardTitle>Grading Criteria</CardTitle>
              <CardDescription>Define how percentages are converted to grades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Percentage Range</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { range: '90% - 100%', grade: 'A+', remarks: 'Outstanding' },
                      { range: '80% - 89%', grade: 'A', remarks: 'Excellent' },
                      { range: '70% - 79%', grade: 'B', remarks: 'Very Good' },
                      { range: '60% - 69%', grade: 'C', remarks: 'Good' },
                      { range: '50% - 59%', grade: 'D', remarks: 'Satisfactory' },
                      { range: 'Below 50%', grade: 'F', remarks: 'Fail' },
                    ].map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{row.range}</TableCell>
                        <TableCell><Badge variant="outline" className="bg-blue-50 text-blue-700">{row.grade}</Badge></TableCell>
                        <TableCell className="text-slate-500 text-sm">{row.remarks}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900">Auto Remarks Settings</h4>
                  <p className="text-sm text-slate-500">The system will automatically generate remarks on result cards based on these criteria.</p>
                  <Button variant="outline" className="w-full">Edit Grading Criteria</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
