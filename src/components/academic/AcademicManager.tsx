/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Class, Section, Subject } from '../../types';
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
import { toast } from 'sonner';
import { 
  BookOpen, 
  Layers, 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  BookMarked, 
  Grid3X3,
  Edit
} from 'lucide-react';

export default function AcademicManager() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubClasses = onSnapshot(query(collection(db, 'classes')), (snap) => {
      setClasses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Class)));
    });
    const unsubSections = onSnapshot(query(collection(db, 'sections')), (snap) => {
      setSections(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Section)));
    });
    const unsubSubjects = onSnapshot(query(collection(db, 'subjects')), (snap) => {
      setSubjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject)));
      setLoading(false);
    });

    return () => {
      unsubClasses();
      unsubSections();
      unsubSubjects();
    };
  }, []);

  const addClass = async (name: string, level: string) => {
    try {
      await addDoc(collection(db, 'classes'), { name, level });
      toast.success('Class added successfully');
    } catch (error) {
      toast.error('Failed to add class');
    }
  };

  const addSubject = async (name: string, code: string) => {
    try {
      await addDoc(collection(db, 'subjects'), { name, code });
      toast.success('Subject added successfully');
    } catch (error) {
      toast.error('Failed to add subject');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Academic Management</h1>
          <p className="text-slate-500 text-sm">Manage classes, subjects, and timetables.</p>
        </div>
      </div>

      <Tabs defaultValue="classes" className="space-y-6">
        <TabsList className="bg-white border border-slate-200">
          <TabsTrigger value="classes" className="gap-2"><Layers size={16} /> Classes & Sections</TabsTrigger>
          <TabsTrigger value="subjects" className="gap-2"><BookMarked size={16} /> Subjects</TabsTrigger>
          <TabsTrigger value="timetable" className="gap-2"><Clock size={16} /> Timetable</TabsTrigger>
        </TabsList>

        <TabsContent value="classes" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-none shadow-md shadow-slate-200/60">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Classes List</CardTitle>
                  <CardDescription>Manage all classes and their levels</CardDescription>
                </div>
                <AddClassDialog onAdd={addClass} />
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class Name</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Sections</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classes.map((cls) => (
                      <TableRow key={cls.id}>
                        <TableCell className="font-semibold">{cls.name}</TableCell>
                        <TableCell>{cls.level}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {sections.filter(s => s.classId === cls.id).map(s => (
                              <span key={s.id} className="px-2 py-0.5 bg-slate-100 rounded text-xs font-medium">{s.name}</span>
                            ))}
                            <Button variant="ghost" size="icon" className="h-5 w-5 text-primary"><Plus size={12} /></Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-rose-600"><Trash2 size={16} /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md shadow-slate-200/60">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-blue-500 text-white"><Layers size={20} /></div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium uppercase tracking-wider">Total Classes</p>
                    <p className="text-2xl font-bold text-blue-900">{classes.length}</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-indigo-500 text-white"><Grid3X3 size={20} /></div>
                  <div>
                    <p className="text-sm text-indigo-600 font-medium uppercase tracking-wider">Total Sections</p>
                    <p className="text-2xl font-bold text-indigo-900">{sections.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-6">
          <Card className="border-none shadow-md shadow-slate-200/60">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Subjects Management</CardTitle>
                <CardDescription>Add and manage subjects for all classes</CardDescription>
              </div>
              <AddSubjectDialog onAdd={addSubject} />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map((subject) => (
                  <div key={subject.id} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary"><BookOpen size={20} /></div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600"><Edit size={16} /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600"><Trash2 size={16} /></Button>
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-900">{subject.name}</h3>
                    <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">{subject.code}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timetable">
          <Card className="border-none shadow-md shadow-slate-200/60">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Class Timetable</CardTitle>
                <CardDescription>Weekly schedule for Class 10-A</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select defaultValue="10">
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">Class 10</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="gap-2"><Plus size={16} /> Add Period</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="w-32">Time</TableHead>
                      <TableHead>Monday</TableHead>
                      <TableHead>Tuesday</TableHead>
                      <TableHead>Wednesday</TableHead>
                      <TableHead>Thursday</TableHead>
                      <TableHead>Friday</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { time: '08:00 - 08:45', mon: 'Mathematics', tue: 'English', wed: 'Physics', thu: 'Chemistry', fri: 'Biology' },
                      { time: '08:45 - 09:30', mon: 'Islamic Studies', tue: 'Urdu', wed: 'Computer Science', thu: 'Mathematics', fri: 'English' },
                      { time: '09:30 - 10:15', mon: 'Physics', tue: 'Chemistry', wed: 'Biology', thu: 'Islamic Studies', fri: 'Urdu' },
                      { time: '10:15 - 10:45', mon: 'BREAK', tue: 'BREAK', wed: 'BREAK', thu: 'BREAK', fri: 'BREAK' },
                      { time: '10:45 - 11:30', mon: 'Computer Science', tue: 'Mathematics', wed: 'English', thu: 'Physics', fri: 'Chemistry' },
                    ].map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium text-slate-500 text-xs">{row.time}</TableCell>
                        <TableCell className={row.mon === 'BREAK' ? 'bg-slate-50 font-bold text-slate-400 text-center' : 'font-medium'}>{row.mon}</TableCell>
                        <TableCell className={row.tue === 'BREAK' ? 'bg-slate-50 font-bold text-slate-400 text-center' : 'font-medium'}>{row.tue}</TableCell>
                        <TableCell className={row.wed === 'BREAK' ? 'bg-slate-50 font-bold text-slate-400 text-center' : 'font-medium'}>{row.wed}</TableCell>
                        <TableCell className={row.thu === 'BREAK' ? 'bg-slate-50 font-bold text-slate-400 text-center' : 'font-medium'}>{row.thu}</TableCell>
                        <TableCell className={row.fri === 'BREAK' ? 'bg-slate-50 font-bold text-slate-400 text-center' : 'font-medium'}>{row.fri}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AddClassDialog({ onAdd }: { onAdd: (name: string, level: string) => void }) {
  const [name, setName] = useState('');
  const [level, setLevel] = useState('Primary');

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2"><Plus size={16} /> Add Class</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Class</DialogTitle>
          <DialogDescription>Create a new class and assign its level.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Class Name</label>
            <Input placeholder="e.g. Class 10" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Level</label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Primary">Primary</SelectItem>
                <SelectItem value="Middle">Middle</SelectItem>
                <SelectItem value="Secondary">Secondary</SelectItem>
                <SelectItem value="Higher Secondary">Higher Secondary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onAdd(name, level)}>Save Class</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddSubjectDialog({ onAdd }: { onAdd: (name: string, code: string) => void }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2"><Plus size={16} /> Add Subject</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Subject</DialogTitle>
          <DialogDescription>Create a new subject for the curriculum.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject Name</label>
            <Input placeholder="e.g. Mathematics" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject Code</label>
            <Input placeholder="e.g. MATH-101" value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onAdd(name, code)}>Save Subject</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
