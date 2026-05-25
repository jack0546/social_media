"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Settings } from "lucide-react";
import { motion } from "framer-motion";

export default function VideoCallPage() {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const router = useRouter();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callDuration >= 0) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch(err => console.error("Error accessing media devices:", err));
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    router.push("/calls");
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex-1 relative">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        <div className="absolute bottom-4 right-4 w-48 h-36 rounded-lg overflow-hidden shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>

        <div className="absolute top-4 left-4 glass-dark px-3 py-1 rounded-full">
          <span className="text-white text-sm">{formatDuration(callDuration)}</span>
        </div>
      </div>

      <div className="p-6 flex justify-center items-center gap-4 glass-dark">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsMuted(!isMuted)}
          className={`p-4 rounded-full ${isMuted ? 'bg-red-500' : 'bg-white/20'} text-white`}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsVideoOff(!isVideoOff)}
          className={`p-4 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-white/20'} text-white`}
        >
          {isVideoOff ? <VideoOff className="w-6 h-6" /> : <VideoIcon className="w-6 h-6" />}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          className="p-4 rounded-full bg-red-500 text-white"
          onClick={handleEndCall}
        >
          <PhoneOff className="w-6 h-6" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          className="p-4 rounded-full bg-white/20 text-white"
        >
          <Settings className="w-6 h-6" />
        </motion.button>
      </div>
    </div>
  );
}