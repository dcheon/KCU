import { Outlet } from "react-router-dom";
import { useEffect, useRef } from "react";

function clamp01(n) {
  return Math.min(1, Math.max(0, n));
}

export default function MainLayout() {
  const audioRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const applySettings = () => {
      const enabled = localStorage.getItem("shapehunter-sound") !== "false";
      const vol = Number(localStorage.getItem("shapehunter-volume") ?? 50) / 100;
      audio.volume = clamp01(vol);
      audio.muted = !enabled;
    };

    const startMutedAutoplay = async () => {
      if (startedRef.current) return;

      audio.muted = true;
      const vol = Number(localStorage.getItem("shapehunter-volume") ?? 50) / 100;
      audio.volume = clamp01(vol);

      try {
        await audio.play();
        startedRef.current = true;
      } catch {
        //Autoplay Blocked
      }
    };

    const onFirstGesture = async () => {
      if (!startedRef.current) {
        try {
          await audio.play();
          startedRef.current = true;
        } catch {}
      }
      applySettings();
    };

    window.addEventListener("shapehunter-audio-settings", applySettings);
    window.addEventListener("pointerdown", onFirstGesture, { once: true });
    window.addEventListener("keydown", onFirstGesture, { once: true });

    startMutedAutoplay();

    return () => {
      window.removeEventListener("shapehunter-audio-settings", applySettings);
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
    };
  }, []);

  return (
    <>
      <audio
        ref={audioRef}
        src="/assets/audio/bg.mp3"
        loop
        preload="auto"
        playsInline
      />
      <Outlet />
    </>
  );
}
