import { CrtScene } from "@/components/3d/CrtScene";
import { MobileApp } from "@/components/mobile/MobileApp";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const isMobile = useIsMobile();

  return (
    <>
      <title>Israel Zeferino – Software Engineer | Portfolio</title>
      <meta name="description" content="Portfólio interativo de Israel Zeferino – Software Engineer Fullstack com experiência em React, Node.js, NestJS e Web3. Campeão ETHSamba 2024 e HackaNation 2025." />
      {isMobile ? <MobileApp /> : <CrtScene />}
    </>
  );
};

export default Index;
