"use client";

import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { classNames } from "@/lib/utils";

interface VideoConsultationProps {
  /** Name of the other participant */
  participantName: string;
  /** Avatar URL of the other participant */
  participantAvatar?: string | null;
  /** Label for the other party (e.g. "Dr. Smith" or "Patient") */
  participantRole: "doctor" | "patient";
  /** Optional appointment details */
  appointmentDetails?: {
    date?: string;
    time?: string;
    department?: string;
    reason?: string;
  };
}

export default function VideoConsultation({
  participantName,
  participantAvatar,
  participantRole,
  appointmentDetails,
}: VideoConsultationProps) {
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [screenShare, setScreenShare] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [notes, setNotes] = useState("");

  function handleSendChat(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [...prev, { sender: "You", text: chatInput.trim() }]);
    setChatInput("");
  }

  if (callEnded) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="rounded-full bg-red-100 p-6 dark:bg-red-900/20">
          <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 3.75L18 6m0 0l2.25 2.25M18 6l2.25-2.25M18 6l-2.25 2.25m1.5 13.5a11.952 11.952 0 01-5.693-1.448A11.95 11.95 0 016.75 15.75m0 0l-2.25 2.25M6.75 15.75L4.5 13.5M6.75 15.75l2.25 2.25" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Call Ended</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          The consultation has ended. You can close this page.
        </p>
        <Button onClick={() => setCallEnded(false)} variant="outline">
          Rejoin Call
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Demo Banner */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
        <span className="mr-2 font-semibold">Demo Mode:</span>
        This is a mock video consultation UI. Camera and audio are not active. In a production version, this would use WebRTC for real-time communication.
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main Video Area */}
        <div className="lg:col-span-2">
          {/* Remote Video (participant) */}
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-gray-900">
            <div className="flex h-full flex-col items-center justify-center gap-3">
              <Avatar src={participantAvatar} name={participantName} size="lg" />
              <p className="text-lg font-medium text-white">{participantName}</p>
              <p className="text-sm text-gray-400">
                Waiting for {participantRole === "doctor" ? "doctor" : "patient"} to connect...
              </p>
              {/* Simulated connection dots */}
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-pulse rounded-full bg-brand-400" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 animate-pulse rounded-full bg-brand-400" style={{ animationDelay: "200ms" }} />
                <span className="h-2 w-2 animate-pulse rounded-full bg-brand-400" style={{ animationDelay: "400ms" }} />
              </div>
            </div>

            {/* Self-view (picture-in-picture) */}
            <div className="absolute bottom-4 right-4 h-32 w-44 overflow-hidden rounded-xl border-2 border-white/20 bg-gray-800">
              <div className="flex h-full flex-col items-center justify-center gap-1">
                {cameraOn ? (
                  <>
                    <div className="h-10 w-10 rounded-full bg-brand-500/30" />
                    <p className="text-xs text-gray-400">You</p>
                  </>
                ) : (
                  <>
                    <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 01-2.25-2.25V7.5A2.25 2.25 0 014.5 5.25h7.5" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                    </svg>
                    <p className="text-xs text-gray-500">Camera off</p>
                  </>
                )}
              </div>
            </div>

            {/* Duration indicator */}
            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-sm text-white">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              00:00
            </div>
          </div>

          {/* Controls Bar */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => setMicOn(!micOn)}
              className={classNames(
                "rounded-full p-3 transition",
                micOn
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  : "bg-red-500 text-white hover:bg-red-600"
              )}
              title={micOn ? "Mute" : "Unmute"}
            >
              {micOn ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                </svg>
              )}
            </button>

            <button
              onClick={() => setCameraOn(!cameraOn)}
              className={classNames(
                "rounded-full p-3 transition",
                cameraOn
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  : "bg-red-500 text-white hover:bg-red-600"
              )}
              title={cameraOn ? "Turn off camera" : "Turn on camera"}
            >
              {cameraOn ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25V7.5a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 01-2.25-2.25V7.5A2.25 2.25 0 014.5 5.25h7.5" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                </svg>
              )}
            </button>

            <button
              onClick={() => setScreenShare(!screenShare)}
              className={classNames(
                "rounded-full p-3 transition",
                screenShare
                  ? "bg-brand-500 text-white hover:bg-brand-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              )}
              title={screenShare ? "Stop sharing" : "Share screen"}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
              </svg>
            </button>

            <button
              onClick={() => setShowChat(!showChat)}
              className={classNames(
                "rounded-full p-3 transition lg:hidden",
                showChat
                  ? "bg-brand-500 text-white hover:bg-brand-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              )}
              title="Toggle chat"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </button>

            <button
              onClick={() => setCallEnded(true)}
              className="rounded-full bg-red-500 p-3 text-white transition hover:bg-red-600"
              title="End call"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 3.75L18 6m0 0l2.25 2.25M18 6l2.25-2.25M18 6l-2.25 2.25m1.5 13.5a11.952 11.952 0 01-5.693-1.448A11.95 11.95 0 016.75 15.75" />
              </svg>
            </button>
          </div>
        </div>

        {/* Side Panel */}
        <div className={classNames(
          "space-y-4",
          showChat ? "block" : "hidden lg:block"
        )}>
          {/* Appointment Details */}
          {appointmentDetails && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Appointment Details</h3>
              <div className="space-y-2 text-sm">
                {appointmentDetails.date && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Date</span>
                    <span className="text-gray-900 dark:text-white">{appointmentDetails.date}</span>
                  </div>
                )}
                {appointmentDetails.time && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Time</span>
                    <span className="text-gray-900 dark:text-white">{appointmentDetails.time}</span>
                  </div>
                )}
                {appointmentDetails.department && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Department</span>
                    <span className="text-gray-900 dark:text-white">{appointmentDetails.department}</span>
                  </div>
                )}
                {appointmentDetails.reason && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Reason</span>
                    <p className="mt-1 text-gray-900 dark:text-white">{appointmentDetails.reason}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chat */}
          <div className="flex h-80 flex-col rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 p-3 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Chat</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {chatMessages.length === 0 ? (
                <p className="text-center text-xs text-gray-400 dark:text-gray-500">No messages yet</p>
              ) : (
                chatMessages.map((msg, i) => (
                  <div key={i} className={classNames(
                    "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                    msg.sender === "You"
                      ? "ml-auto bg-brand-500 text-white"
                      : "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                  )}>
                    <p>{msg.text}</p>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleSendChat} className="border-t border-gray-200 p-2 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-brand-500 px-3 py-1.5 text-sm text-white hover:bg-brand-600"
                >
                  Send
                </button>
              </div>
            </form>
          </div>

          {/* Notes (doctor only) */}
          {participantRole === "patient" && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Consultation Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Take notes during the consultation..."
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
