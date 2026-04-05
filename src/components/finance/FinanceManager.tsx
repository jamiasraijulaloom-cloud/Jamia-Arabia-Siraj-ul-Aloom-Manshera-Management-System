/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, getDocs, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Student, Staff, FeePayment, SalaryPayment } from '../../types';
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
  Wallet, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard,
  History,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function FinanceManager() {
  const [students, setStudents] = useState<Student[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [feePayments, setFeePayments] = useState<FeePayment[]>([]);
  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));

  useEffect(() => {
    const unsubStudents = onSnapshot(query(collection(db, 'students')), (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student)));
    });
    const unsubStaff = onSnapshot(query(collection(db, 'staff')), (snap) => {
      setStaff(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Staff)));
    });
    const unsubFees = onSnapshot(query(collection(db, 'feePayments'), orderBy('date', 'desc')), (snap) => {
      setFeePayments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeePayment)));
    });
    const unsubSalaries = onSnapshot(query(collection(db, 'salaryPayments'), orderBy('date', 'desc')), (snap) => {
      setSalaryPayments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SalaryPayment)));
      setLoading(false);
    });

    return () => {
      unsubStudents();
      unsubStaff();
      unsubFees();
      unsubSalaries();
    };
  }, []);

  const collectFee = async (student: Student, amount: number) => {
    try {
      await addDoc(collection(db, 'feePayments'), {
        studentId: student.id,
        month: selectedMonth,
        amount,
        date: new Date().toISOString().split('T')[0],
        status: 'paid',
      });
      toast.success(`Fee collected for ${student.firstName}`);
    } catch (error) {
      toast.error('Failed to collect fee');
    }
  };

  const paySalary = async (member: Staff) => {
    try {
      await addDoc(collection(db, 'salaryPayments'), {
        staffId: member.id,
        month: selectedMonth,
        amount: member.salaryDetail.basicSalary + member.salaryDetail.allowances,
        bonus: 0,
        overtime: 0,
        deductions: 0,
        date: new Date().toISOString().split('T')[0],
      });
      toast.success(`Salary paid to ${member.firstName}`);
    } catch (error) {
      toast.error('Failed to pay salary');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Finance Management</h1>
          <p className="text-slate-500 text-sm">Manage student fees, staff salaries, and expenses.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2"><Download size={18} /> Reports</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-md shadow-slate-200/60 bg-emerald-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-white/20"><TrendingUp size={24} /></div>
              <Badge variant="outline" className="text-white border-white/30 bg-white/10">This Month</Badge>
            </div>
            <p className="text-sm opacity-80 uppercase tracking-wider font-medium">Total Income</p>
            <h3 className="text-3xl font-bold mt-1">Rs. 450,000</h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md shadow-slate-200/60 bg-rose-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-white/20"><TrendingDown size={24} /></div>
              <Badge variant="outline" className="text-white border-white/30 bg-white/10">This Month</Badge>
            </div>
            <p className="text-sm opacity-80 uppercase tracking-wider font-medium">Total Expenses</p>
            <h3 className="text-3xl font-bold mt-1">Rs. 280,000</h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md shadow-slate-200/60 bg-indigo-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-white/20"><Wallet size={24} /></div>
              <Badge variant="outline" className="text-white border-white/30 bg-white/10">Net Profit</Badge>
            </div>
            <p className="text-sm opacity-80 uppercase tracking-wider font-medium">Net Balance</p>
            <h3 className="text-3xl font-bold mt-1">Rs. 170,000</h3>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="fees" className="space-y-6">
        <TabsList className="bg-white border border-slate-200">
          <TabsTrigger value="fees" className="gap-2"><DollarSign size={16} /> Student Fees</TabsTrigger>
          <TabsTrigger value="salaries" className="gap-2"><CreditCard size={16} /> Staff Salaries</TabsTrigger>
          <TabsTrigger value="history" className="gap-2"><History size={16} /> Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="fees" className="space-y-6">
          <Card className="border-none shadow-md shadow-slate-200/60">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Fee Collection</CardTitle>
                <CardDescription>Manage student fee payments for {selectedMonth}</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <Input placeholder="Search student..." className="pl-9 h-9" />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Monthly Fee</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Payable</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => {
                    const isPaid = feePayments.some(p => p.studentId === student.id && p.month === selectedMonth);
                    const payable = student.feeDetail.monthlyFee - student.feeDetail.discount;
                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.firstName} {student.lastName}</TableCell>
                        <TableCell>Class {student.classId}-{student.sectionId}</TableCell>
                        <TableCell>Rs. {student.feeDetail.monthlyFee}</TableCell>
                        <TableCell>Rs. {student.feeDetail.discount}</TableCell>
                        <TableCell className="font-bold">Rs. {payable}</TableCell>
                        <TableCell>
                          <Badge className={isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                            {isPaid ? 'Paid' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            variant={isPaid ? 'ghost' : 'default'}
                            disabled={isPaid}
                            onClick={() => collectFee(student, payable)}
                          >
                            {isPaid ? <CheckCircle2 size={18} className="text-emerald-500" /> : 'Collect Fee'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salaries" className="space-y-6">
          <Card className="border-none shadow-md shadow-slate-200/60">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Staff Salaries</CardTitle>
                <CardDescription>Manage employee salary payments for {selectedMonth}</CardDescription>
              </div>
              <Button className="gap-2"><Plus size={16} /> Pay All Staff</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Total Payable</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((member) => {
                    const isPaid = salaryPayments.some(p => p.staffId === member.id && p.month === selectedMonth);
                    const total = member.salaryDetail.basicSalary + member.salaryDetail.allowances;
                    return (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.firstName} {member.lastName}</TableCell>
                        <TableCell className="capitalize">{member.role}</TableCell>
                        <TableCell>Rs. {member.salaryDetail.basicSalary}</TableCell>
                        <TableCell>Rs. {member.salaryDetail.allowances}</TableCell>
                        <TableCell className="font-bold">Rs. {total}</TableCell>
                        <TableCell>
                          <Badge className={isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                            {isPaid ? 'Paid' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            variant={isPaid ? 'ghost' : 'default'}
                            disabled={isPaid}
                            onClick={() => paySalary(member)}
                          >
                            {isPaid ? <CheckCircle2 size={18} className="text-emerald-500" /> : 'Pay Salary'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="border-none shadow-md shadow-slate-200/60">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Recent financial transactions and records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 text-amber-800 border border-amber-100">
                  <AlertCircle size={18} />
                  <p className="text-sm font-medium">Daily auto-backup of financial records is enabled.</p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feePayments.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="text-xs text-slate-500 font-mono">{p.date}</TableCell>
                        <TableCell><Badge variant="outline" className="bg-emerald-50 text-emerald-700">Income</Badge></TableCell>
                        <TableCell>Fee Collection - {p.month}</TableCell>
                        <TableCell className="font-bold text-emerald-600">+ Rs. {p.amount}</TableCell>
                        <TableCell className="text-xs text-slate-500 uppercase">Cash</TableCell>
                      </TableRow>
                    ))}
                    {salaryPayments.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="text-xs text-slate-500 font-mono">{p.date}</TableCell>
                        <TableCell><Badge variant="outline" className="bg-rose-50 text-rose-700">Expense</Badge></TableCell>
                        <TableCell>Staff Salary - {p.month}</TableCell>
                        <TableCell className="font-bold text-rose-600">- Rs. {p.amount}</TableCell>
                        <TableCell className="text-xs text-slate-500 uppercase">Bank Transfer</TableCell>
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
