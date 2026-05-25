"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/context/AuthContext";

export default function VideoCallPage() {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const { userProfile } = useAuth();
  const callId = searchParams.get("callId");
  const calleeId = searchParams.get("calleeId");
  const isInitiator = searchParams.get("initiator") === "true";

  const configuration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      {
        urls: process.env.NEXT_PUBLIC_TURN_SERVER || "",
        username: process.env.NEXT_PUBLIC_TURN_USERNAME || "",
        credential: process.env.NEXT_PUBLIC_TURN_PASSWORD || "",
      },
    ],
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const initCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing media devices:", err);
      }
    };
    initCall();
  }, []);

  useEffect(() => {
    if (!localStream || !userProfile) return;

    const pc = new RTCPeerConnection(configuration);
    setPeerConnection(pc);

    localStream.getTracks().forEach(track => {
      pc.addTrack(track, localStream);
    });

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      setRemoteStream(stream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    };

    const socket = getSocket();
    if (socket) {
      socket.on("offer", async (data: any) => {
        if (pc.signalingState !== "stable") return;
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { callId, answer });
      });

      socket.on("answer", async (data: any) => {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      });

      socket.on("ice-candidate", async (data: any) => {
        if (data.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("ice-candidate", { callId, candidate: event.candidate });
      }
    };

    return () => {
      pc.close();
      if (socket) {
        socket.off("offer");
        socket.off("answer");
        socket.off("ice-candidate");
      }
    };
  }, [localStream, userProfile, callId]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    if (peerConnection) {
      peerConnection.close();
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    router.push("/calls");
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
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
          onClick={toggleMute}
          className={`p-4 rounded-full ${isMuted ? 'bg-red-500' : 'bg-white/20'} text-white`}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleVideo}
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