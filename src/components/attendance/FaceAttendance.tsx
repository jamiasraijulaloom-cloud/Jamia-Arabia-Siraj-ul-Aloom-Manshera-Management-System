/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { collection, getDocs, addDoc, query, where, limit, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Student, Staff, Attendance } from '../../types';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Camera, Loader2, CheckCircle2, User, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights/';

export function FaceAttendance() {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isAttendanceRunning, setIsAttendanceRunning] = useState(false);
  const [labeledDescriptors, setLabeledDescriptors] = useState<faceapi.LabeledFaceDescriptors[]>([]);
  const [lastMarked, setLastMarked] = useState<{ name: string; time: string } | null>(null);
  const [loadingProgress, setLoadingProgress] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceMatcherRef = useRef<faceapi.FaceMatcher | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const processedTodayRef = useRef<Set<string>>(new Set());

  // Load models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoadingProgress('Loading face recognition models...');
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        setLoadingProgress('Models loaded successfully.');
      } catch (err) {
        console.error("Error loading models:", err);
        toast.error("Failed to load face recognition models.");
      }
    };
    loadModels();
  }, []);

  // Fetch reference data and generate descriptors
  const prepareReferenceData = useCallback(async () => {
    if (!modelsLoaded) return;
    
    setLoadingProgress('Fetching student and staff photos...');
    try {
      const studentsSnap = await getDocs(collection(db, 'students'));
      const staffSnap = await getDocs(collection(db, 'staff'));
      
      const allEntities = [
        ...studentsSnap.docs.map(doc => ({ id: doc.id, type: 'student', ...doc.data() } as any)),
        ...staffSnap.docs.map(doc => ({ id: doc.id, type: 'staff', ...doc.data() } as any))
      ].filter(e => e.photoURL && e.photoURL.startsWith('data:image'));

      if (allEntities.length === 0) {
        toast.warning("No reference photos found in database.");
        return;
      }

      setLoadingProgress(`Generating descriptors for ${allEntities.length} people...`);
      
      const descriptors: faceapi.LabeledFaceDescriptors[] = [];
      
      for (const entity of allEntities) {
        try {
          const img = await faceapi.fetchImage(entity.photoURL);
          const detection = await faceapi.detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();
          
          if (detection) {
            const label = `${entity.type}:${entity.id}:${entity.firstName} ${entity.lastName}`;
            descriptors.push(new faceapi.LabeledFaceDescriptors(label, [detection.descriptor]));
          }
        } catch (e) {
          console.warn(`Could not process photo for ${entity.firstName}`, e);
        }
      }

      setLabeledDescriptors(descriptors);
      faceMatcherRef.current = new faceapi.FaceMatcher(descriptors, 0.6);
      setLoadingProgress('System ready for attendance.');
      toast.success("Face recognition system ready!");
    } catch (err) {
      console.error("Error preparing reference data:", err);
      toast.error("Failed to prepare face recognition data.");
    }
  }, [modelsLoaded]);

  useEffect(() => {
    if (modelsLoaded) {
      prepareReferenceData();
    }
  }, [modelsLoaded, prepareReferenceData]);

  const markAttendance = async (label: string) => {
    const [type, id, name] = label.split(':');
    
    // Avoid double marking in the same session
    if (processedTodayRef.current.has(id)) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    try {
      // Check if already marked today in Firestore
      const q = query(
        collection(db, 'attendance'),
        where('entityId', '==', id),
        where('date', '==', today)
      );
      const existing = await getDocs(q);
      
      if (existing.empty) {
        const record: Omit<Attendance, 'id'> = {
          entityId: id,
          entityType: type as 'student' | 'staff',
          date: today,
          status: 'present',
          method: 'face',
          checkIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        await addDoc(collection(db, 'attendance'), record);
        processedTodayRef.current.add(id);
        setLastMarked({ name, time: new Date().toLocaleTimeString() });
        toast.success(`Attendance marked: ${name}`);
      } else {
        processedTodayRef.current.add(id);
      }
    } catch (err) {
      console.error("Error marking attendance:", err);
    }
  };

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsAttendanceRunning(true);
      }
    } catch (err) {
      console.error("Error starting video:", err);
      toast.error("Could not access camera.");
    }
  };

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsAttendanceRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    if (isAttendanceRunning && videoRef.current && canvasRef.current && faceMatcherRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      faceapi.matchDimensions(canvas, displaySize);

      intervalRef.current = setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video)
          .withFaceLandmarks()
          .withFaceDescriptors();
        
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        const context = canvas.getContext('2d');
        if (context) {
          context.clearRect(0, 0, canvas.width, canvas.height);
          
          resizedDetections.forEach(detection => {
            const result = faceMatcherRef.current!.findBestMatch(detection.descriptor);
            const box = detection.detection.box;
            const drawBox = new faceapi.draw.DrawBox(box, { 
              label: result.toString(),
              boxColor: result.label === 'unknown' ? 'red' : 'green' 
            });
            drawBox.draw(canvas);

            if (result.label !== 'unknown' && result.distance < 0.5) {
              markAttendance(result.label);
            }
          });
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAttendanceRunning]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 border-none shadow-md shadow-slate-200/60 overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="flex items-center gap-2">
            <Camera className="text-primary" size={20} />
            Live Face Recognition
          </CardTitle>
          <CardDescription>
            Position the student/staff in front of the camera for automatic attendance.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 relative aspect-video bg-slate-900 flex items-center justify-center">
          {!modelsLoaded || labeledDescriptors.length === 0 ? (
            <div className="text-center p-8 space-y-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
              <p className="text-slate-300 font-medium">{loadingProgress || 'Initializing system...'}</p>
            </div>
          ) : !isAttendanceRunning ? (
            <div className="text-center p-8 space-y-6">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <Camera className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Ready to Start</h3>
                <p className="text-slate-400 max-w-xs mx-auto">
                  The system has loaded {labeledDescriptors.length} face profiles.
                </p>
              </div>
              <Button onClick={startVideo} size="lg" className="px-8">
                Start Attendance Bot
              </Button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onPlay={() => setIsAttendanceRunning(true)}
                className="w-full h-full object-cover"
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
              />
              <div className="absolute bottom-4 right-4">
                <Button variant="destructive" onClick={stopVideo} size="sm">
                  Stop Bot
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border-none shadow-md shadow-slate-200/60">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {lastMarked ? (
              <div className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Marked Present</p>
                  <p className="font-bold text-slate-900">{lastMarked.name}</p>
                  <p className="text-xs text-slate-500">{lastMarked.time}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-xl">
                <User className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No faces detected yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-md shadow-slate-200/60 bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle size={20} className="text-amber-400" />
              Bot Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-300">
            <p>1. Ensure good lighting on the subject's face.</p>
            <p>2. Only one person should be in the frame at a time for best results.</p>
            <p>3. The system matches against photos taken during registration.</p>
            <p>4. Attendance is automatically saved to the database.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
