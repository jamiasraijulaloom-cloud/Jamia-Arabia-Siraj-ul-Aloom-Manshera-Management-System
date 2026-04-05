/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  CalendarCheck, 
  GraduationCap, 
  FileSpreadsheet, 
  Wallet, 
  BookOpen, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  HelpCircle
} from 'lucide-react';
import { auth } from '../../firebase';
import { UserProfile } from '../../types';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';

interface DashboardLayoutProps {
  profile: UserProfile | null;
}

export default function DashboardLayout({ profile }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Students', icon: GraduationCap, path: '/students' },
    { name: 'Staff', icon: UserSquare2, path: '/staff' },
    { name: 'Attendance', icon: CalendarCheck, path: '/attendance' },
    { name: 'Academic', icon: BookOpen, path: '/academic' },
    { name: 'Exams', icon: FileSpreadsheet, path: '/exams' },
    { name: 'Finance', icon: Wallet, path: '/finance' },
    { name: 'User Guide', icon: HelpCircle, path: '/guide' },
  ];

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-slate-900 text-white transition-all duration-300 flex flex-col",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-800">
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-tight text-primary">JAMIA ARABIA</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest">Siraj ul Aloom</span>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground font-medium" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <item.icon size={20} />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-slate-700">
              <AvatarImage src={profile?.photoURL} />
              <AvatarFallback className="bg-slate-800 text-slate-300">
                {profile?.displayName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">{profile?.displayName}</span>
                <span className="text-[10px] text-slate-500 uppercase">{profile?.role}</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search students, staff, records..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-slate-500 relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </Button>
            
            <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="flex items-center gap-2 px-2" />}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.photoURL} />
                <AvatarFallback>{profile?.displayName?.charAt(0)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/guide')}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>User Guide</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
          
          <footer className="mt-12 py-6 border-t border-slate-200 text-center text-slate-400 text-sm">
            <p>Jamia Arabia Siraj ul Aloom Manshera Management System</p>
            <p>Developed by Abdulrehman Habib • Copyright © 2026</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
