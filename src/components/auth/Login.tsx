/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth } from '../../firebase';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          toast.success('Successfully logged in!');
        }
      } catch (error: any) {
        console.error('Redirect result error:', error);
        if (error.code !== 'auth/popup-closed-by-user') {
          toast.error('Login failed. Please try again.');
        }
      }
    };
    checkRedirectResult();
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success('Successfully logged in!');
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/popup-blocked') {
        try {
          // Fallback to redirect if popup is blocked
          await signInWithRedirect(auth, provider);
        } catch (redirectError) {
          console.error('Redirect login error:', redirectError);
          toast.error('Login popup was blocked. Please allow popups or try opening the app in a new tab.');
        }
      } else if (error.code !== 'auth/popup-closed-by-user') {
        toast.error('Failed to login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary text-white mb-4 shadow-lg shadow-primary/20">
            <GraduationCap size={40} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Jamia Arabia</h1>
          <p className="text-slate-500 font-medium">Siraj ul Aloom Manshera</p>
        </div>

        <Card className="border-none shadow-xl shadow-slate-200/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Management System</CardTitle>
            <CardDescription className="text-center">
              Secure login for authorized staff and administrators
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button 
              variant="outline" 
              className="w-full h-12 text-base font-medium flex items-center justify-center gap-3 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                  />
                </svg>
              )}
              Sign in with Google
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400">Authorized Access Only</span>
              </div>
            </div>
            <p className="text-xs text-center text-slate-400">
              By logging in, you agree to the terms of use and privacy policy of Jamia Arabia Siraj ul Aloom.
            </p>
          </CardFooter>
        </Card>

        <div className="text-center text-slate-400 text-sm">
          <p>Developed by Abdulrehman Habib</p>
          <p>© 2026 Copyright by Abdulrehman Habib</p>
        </div>
      </div>
    </div>
  );
}
