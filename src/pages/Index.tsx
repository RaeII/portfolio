import { useState, useEffect, useCallback } from "react";
import { CrtScene } from "@/components/3d/CrtScene";
import { MobileApp } from "@/components/mobile/MobileApp";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [introStart, setIntroStart] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleReady = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleFadeStart = useCallback(() => {
    setIntroStart(true);
  }, []);

  return (
    <>
      <LoadingScreen isReady={isLoaded} onFadeStart={handleFadeStart} />
      {mounted && (
        isMobile
          ? <MobileApp onReady={handleReady} />
          : <CrtScene onReady={handleReady} introStart={introStart} />
      )}
    </>
  );
};

export default Index;
