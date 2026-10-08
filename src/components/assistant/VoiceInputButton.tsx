import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '../../context/ToastContext.js';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  isProcessing?: boolean;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  isProcessing,
}) => {
  const { showToast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          onTranscript(text);
          showToast(`Voice captured: "${text}"`, 'info');
        }
        setIsListening(false);
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, [onTranscript, showToast]);

  const toggleListening = () => {
    if (!recognition) {
      showToast('Speech recognition not supported in this browser.', 'error');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
        showToast('Listening... Speak your payment command', 'info');
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={isProcessing}
      title={isListening ? 'Listening... click to stop' : 'Speak payment command'}
      className={`p-2.5 rounded-xl transition-all relative ${
        isListening
          ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
      }`}
    >
      {isListening ? (
        <span className="flex items-center gap-1">
          <Mic className="w-4 h-4 animate-bounce" />
        </span>
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </button>
  );
};
