/**
 * VoiceNoteRecorder Component
 * Uses Web MediaRecorder API to record voice notes for consultations
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Mic, Square, Play, Trash2, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface VoiceNoteRecorderProps {
  onSave: (audioBlob: Blob, duration: number) => void;
  maxDuration?: number; // in seconds
}

export default function VoiceNoteRecorder({
  onSave,
  maxDuration = 300,
}: VoiceNoteRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [isRecording, audioUrl]);

  const startRecording = useCallback(async () => {
    setError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setIsRecording(false);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      
      // Start timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError("মাইক্রোফোন অ্যাক্সেস প্রত্যাখ্যাত করা হয়েছে। দয়া করে অনুমতি দিন।");
      console.error("Error accessing microphone:", errorMessage);
    }
  }, [maxDuration]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [isRecording]);

  const playRecording = useCallback(() => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  }, [audioUrl, isPlaying]);

  const deleteRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    audioChunksRef.current = [];
    setRecordingTime(0);
    setIsPlaying(false);
  }, [audioUrl]);

  const saveRecording = useCallback(() => {
    if (audioChunksRef.current.length > 0) {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      onSave(audioBlob, recordingTime);
      deleteRecording();
    }
  }, [onSave, recordingTime, deleteRecording]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Mic className="w-5 h-5 text-[var(--primary)]" />
        <h3 className="text-lg font-bold text-[var(--text)] font-hind">
          ভয়েস নোট রেকর্ডার
        </h3>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg mb-4">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-sm text-red-700 font-hind">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Recording Controls */}
        <div className="flex items-center justify-center gap-4">
          {!isRecording && !audioUrl && (
            <Button
              onClick={startRecording}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-hind font-bold flex items-center gap-2"
            >
              <Mic className="w-5 h-5" />
              রেকর্ড শুরু করুন
            </Button>
          )}
          
          {isRecording && (
            <Button
              onClick={stopRecording}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-hind font-bold flex items-center gap-2"
            >
              <Square className="w-5 h-5" />
              বন্ধ করুন
            </Button>
          )}
        </div>

        {/* Recording Timer */}
        {isRecording && (
          <div className="text-center">
            <div className="text-3xl font-mono font-bold text-[var(--text)]">
              {formatTime(recordingTime)}
            </div>
            <div className="text-sm text-[var(--text)]/60 font-hind mt-1">
              / {formatTime(maxDuration)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all"
                style={{ width: `${(recordingTime / maxDuration) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Audio Player */}
        {audioUrl && (
          <div className="space-y-3">
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="w-full"
            />
            
            <div className="flex items-center justify-center gap-2">
              <Button
                onClick={playRecording}
                variant="outline"
                className="px-4 py-2 rounded-lg font-hind font-bold flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                {isPlaying ? "বিরতি" : "বাজান"}
              </Button>
              
              <Button
                onClick={saveRecording}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-hind font-bold"
              >
                সংরক্ষণ করুন
              </Button>
              
              <Button
                onClick={deleteRecording}
                variant="outline"
                className="px-4 py-2 rounded-lg font-hind font-bold flex items-center gap-2 text-red-500 border-red-500 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                মুছুন
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
