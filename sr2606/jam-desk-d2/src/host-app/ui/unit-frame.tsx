import { useEffect, useRef } from "react";
import { createUnitInterfaceForIframe } from "@/host-app/host/iframe-unit-interface-impl";

export const UnitFrame = ({
  unitId,
  pageUrl,
  destSpec,
}: {
  unitId: string;
  pageUrl: string;
  destSpec?: string | string[];
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const win = iframe.contentWindow;
    (win as any).unitInterface = createUnitInterfaceForIframe(
      unitId,
      (unitInstance) => {
        console.log("created unit instance in iframe", unitInstance);
      },
    );
  }, []);
  return (
    <iframe
      ref={iframeRef}
      src={pageUrl}
      width="200"
      height="100"
      title={unitId}
    />
  );
};
