import { useState, useEffect } from 'react';
import { Mic, Loader2 } from 'lucide-react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { uploadAudio, parseCommand } from '../api/client';
import { useAppStore } from '../store/useAppStore';
import { motion } from 'framer-motion'

export default function MicButton() {
  const { isRecording, error: recError, startRecording, stopRecording } = useAudioRecorder();
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState(null);

  const setTranscript = useAppStore((s) => s.setTranscript);
  const loadList = useAppStore((s) => s.loadList);
  const userId = useAppStore((s) => s.user?.user_id);

  // Source of truth for the "listening"/"error" state is the hook's own
  // isRecording/error, not a value guessed right after an await (that was
  // reading a stale closure and is what caused the mic getting stuck).
  useEffect(() => {
    if (recError) {
      setErrorMsg(recError);
      setStatus('error');
      const t = setTimeout(() => setStatus('idle'), 2500);
      return () => clearTimeout(t);
    }
    if (isRecording) {
      setStatus('listening');
    }
  }, [isRecording, recError]);

  const handleClick = async () => {
    if (status === 'processing') return;

    if (!isRecording) {
      setErrorMsg(null);
      await startRecording();
      // status now updates via the effect above once the hook's real
      // isRecording/error state lands, instead of guessing here.
      return;
    }

    setStatus('processing');
    try {
      const blob = await stopRecording();
      if (!blob || blob.size === 0) throw new Error('No audio captured — please try again');

      const { transcript, language } = await uploadAudio(blob);
      setTranscript(transcript, language);

      const parsed = await parseCommand(transcript, userId);

      if (parsed.list_result) {
        await loadList();
      }

      setStatus('idle');
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2500);
    }
  };

  const label =
    status === 'listening' ? 'Listening… tap to stop'
    : status === 'processing' ? 'Processing…'
    : status === 'error' ? (errorMsg || recError || 'Error — try again')
    : 'Tap to speak';

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        type="button"
        onClick={handleClick}
        disabled={status === 'processing'}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        animate={isRecording ? { scale: [1, 1.1, 1] } : { scale: 1 }}
        transition={isRecording ? { duration: 1, repeat: Infinity, ease: 'easeInOut' } : {}}
        className={[
          'w-20 h-20 rounded-full flex items-center justify-center transition-colors shadow-sm',
          status === 'error' ? 'bg-red-600' : isRecording ? 'bg-red-500' : 'bg-accent',
          'disabled:opacity-60',
        ].join(' ')}
      >
        {status === 'processing' ? <Loader2 className="animate-spin text-white" size={28} /> : <Mic className="text-white" size={28} />}
      </motion.button>
      <p className="text-sm text-ink-soft">{label}</p>
    </div>
  );
}