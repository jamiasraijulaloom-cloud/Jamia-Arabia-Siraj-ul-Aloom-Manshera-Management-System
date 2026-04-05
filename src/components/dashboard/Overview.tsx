/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { collection, query, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { 
  Users, 
  GraduationCap, 
  CalendarCheck, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  FileSpreadsheet
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { motion } from 'motion/react';
import { Button } from '../ui/button';

export default function Overview() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalStaff: 0,
    attendanceToday: 0,
    revenueThisMonth: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // In a real app, these would be aggregated or fetched from a stats collection
        const studentsSnap = await getDocs(collection(db, 'students'));
        const staffSnap = await getDocs(collection(db, 'staff'));
        
        setStats({
          totalStudents: studentsSnap.size || 1240, // Mock data if empty
          totalStaff: staffSnap.size || 85,
          attendanceToday: 92,
          revenueThisMonth: 450000,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const attendanceData = [
    { name: 'Mon', students: 95, staff: 98 },
    { name: 'Tue', students: 92, staff: 95 },
    { name: 'Wed', students: 88, staff: 92 },
    { name: 'Thu', students: 94, staff: 96 },
    { name: 'Fri', students: 96, staff: 99 },
    { name: 'Sat', students: 90, staff: 94 },
  ];

  const revenueData = [
    { month: 'Jan', amount: 380000 },
    { month: 'Feb', amount: 420000 },
    { month: 'Mar', amount: 450000 },
    { month: 'Apr', amount: 410000 },
    { month: 'May', amount: 480000 },
    { month: 'Jun', amount: 520000 },
  ];

  const statCards = [
    { 
      title: 'Total Students', 
      value: stats.totalStudents.toLocaleString(), 
      icon: GraduationCap, 
      color: 'bg-blue-500',
      trend: '+12%',
      trendUp: true
    },
    { 
      title: 'Total Staff', 
      value: stats.totalStaff.toLocaleString(), 
      icon: Users, 
      color: 'bg-indigo-500',
      trend: '+2',
      trendUp: true
    },
    { 
      title: 'Attendance Today', 
      value: `${stats.attendanceToday}%`, 
      icon: CalendarCheck, 
      color: 'bg-emerald-500',
      trend: '-2%',
      trendUp: false
    },
    { 
      title: 'Monthly Revenue', 
      value: `Rs. ${stats.revenueThisMonth.toLocaleString()}`, 
      icon: TrendingUp, 
      color: 'bg-amber-500',
      trend: '+8%',
      trendUp: true
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome back! Here's what's happening at Jamia Arabia today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-none shadow-md shadow-slate-200/60 overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${card.color} text-white shadow-lg shadow-${card.color.split('-')[1]}-200`}>
                    <card.icon size={24} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${card.trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {card.trendUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {card.trend}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{card.title}</p>
                  <h3 className="text-2xl font-bold text-slate-900">{card.value}</h3>
                </div>
              </CardContent>
              <div className={`h-1 w-full ${card.color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <Card className="border-none shadow-md shadow-slate-200/60">
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>Weekly attendance percentage for students and staff</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="staff" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card className="border-none shadow-md shadow-slate-200/60">
          <CardHeader>
            <CardTitle>Fee Collection</CardTitle>
            <CardDescription>Monthly revenue from student fees</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2 border-none shadow-md shadow-slate-200/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest updates from the management system</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-primary">View All</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { type: 'enrollment', text: 'New student enrolled: Muhammad Ali (Class 10-A)', time: '10 mins ago', icon: GraduationCap, color: 'text-blue-500', bg: 'bg-blue-50' },
                { type: 'fee', text: 'Fee payment received from Ahmed Khan (Class 8-B)', time: '25 mins ago', icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                { type: 'exam', text: 'Final Exam results published for Class 12', time: '1 hour ago', icon: FileSpreadsheet, color: 'text-amber-500', bg: 'bg-amber-50' },
                { type: 'attendance', text: 'Staff attendance report generated for today', time: '2 hours ago', icon: CalendarCheck, color: 'text-indigo-500', bg: 'bg-indigo-50' },
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${activity.bg} ${activity.color}`}>
                    <activity.icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{activity.text}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <Clock size={12} /> {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card className="border-none shadow-md shadow-slate-200/60 bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle size={20} className="text-amber-400" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-slate-800 border-l-4 border-amber-400">
                <p className="text-sm font-medium">Pending Fee Reminders</p>
                <p className="text-xs text-slate-400 mt-1">45 students have pending fees for March.</p>
                <Button variant="link" className="p-0 h-auto text-xs text-amber-400 mt-2">Send Notifications</Button>
              </div>
              <div className="p-3 rounded-lg bg-slate-800 border-l-4 border-blue-400">
                <p className="text-sm font-medium">Exam Schedule Update</p>
                <p className="text-xs text-slate-400 mt-1">Mid-term exams start in 5 days.</p>
                <Button variant="link" className="p-0 h-auto text-xs text-blue-400 mt-2">View Schedule</Button>
              </div>
              <div className="p-3 rounded-lg bg-slate-800 border-l-4 border-emerald-400">
                <p className="text-sm font-medium">Backup Successful</p>
                <p className="text-xs text-slate-400 mt-1">Daily auto-backup completed at 02:00 AM.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
