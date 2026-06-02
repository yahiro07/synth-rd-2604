import { useEffect, useMemo, useRef, useState } from "react";
import { hostSystem } from "@/host-app/host/host-system";
import { createUnitInterfaceForIframe } from "@/host-app/host/iframe-unit-interface-impl";
import { createUnitAdapter } from "@/host-app/ui/unit-adapter";
import { connectUnitToDestination } from "@/host-app/ui/unit-connecter";
import { UnitInstanceInHostSide } from "@/shared/contract/unit-interfaces";

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
  const unitAdapter = useMemo(() => createUnitAdapter(unitId), [unitId]);
  const [unitInstance, setUnitInstance] =
    useState<UnitInstanceInHostSide | null>(null);

  useEffect(() => {
    return hostSystem.registerUnitInstance(unitAdapter);
  }, [unitAdapter]);

  useEffect(() => {
    if (unitInstance) {
      console.log("created unit instance in iframe", unitInstance);
      return unitAdapter.mountUnitInstance(unitInstance);
    }
  }, [unitAdapter, unitInstance]);

  useEffect(() => {
    if (destSpec) {
      return connectUnitToDestination(unitAdapter, destSpec);
    }
  }, [destSpec, unitAdapter]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const win = iframe.contentWindow;
    (win as any).unitInterface = createUnitInterfaceForIframe(
      unitId,
      setUnitInstance,
    );
  }, [unitId]);
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
