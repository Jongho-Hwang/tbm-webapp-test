import React, { useRef, useState } from "react";

export default function Recorder({ onChange }) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const initRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("이 브라우저는 SpeechRecognition을 지원하지 않습니다.");
      return null;
    }
    const recog = new SpeechRecognition();
    recog.lang = "ko-KR";
    recog.continuous = true;
    recog.interimResults = true;
    return recog;
  };

  const handleStart = () => {
    if (listening) return;
    if (!recognitionRef.current) {
      const recog = initRecognition();
      if (!recog) return;
      recognitionRef.current = recog;
      recog.onresult = (e) => {
        let finalTranscript = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) {
            finalTranscript += e.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          onChange((prev) => prev + finalTranscript);
        }
      };
      recog.onend = () => {
        if (listening) recognitionRef.current.start();
      };
    }
    recognitionRef.current.start();
    setListening(true);
  };

  const handleStop = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  return (
    <div className="space-x-2">
      <button
        onClick={handleStart}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        녹음 시작
      </button>
      <button
        onClick={handleStop}
        className="px-4 py-2 bg-gray-300 rounded"
      >
        녹음 종료
      </button>
    </div>
  );
}
