import { useEffect, useMemo, useRef } from "react";
import { hostSystem } from "@/host-app/host/host-system";
import { createUnitInterfaceForIframe } from "@/host-app/host/iframe-unit-interface-impl";
import { createUnitAdapter } from "@/host-app/ui/unit-adapter";
import { connectUnitToDestination } from "@/host-app/ui/unit-connecter";
import { UnitIdsBox } from "@/host-app/ui/unit-ids-box";

function createUnitFrameModel(unitId: string) {
  const unitAdapter = createUnitAdapter(unitId);

  return {
    onIframeMounted(iframe: HTMLIFrameElement) {
      const unregisterUnitAdapter =
        hostSystem.registerUnitInstance(unitAdapter);
      let unmountUnit: (() => void) | null = null;

      const win = iframe.contentWindow;
      (win as any).unitInterface = createUnitInterfaceForIframe(
        unitId,
        (unitInstance) => {
          unmountUnit = unitAdapter.mountUnitInstance(unitInstance);
        },
      );
      return () => {
        unregisterUnitAdapter();
        unmountUnit?.();
      };
    },
    setDestSpec(destSpec?: string | string[]) {
      if (destSpec) {
        return connectUnitToDestination(unitAdapter, destSpec);
      }
    },
    dispose() {},
  };
}

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
  const model = useMemo(() => createUnitFrameModel(unitId), [unitId]);
  useEffect(() => {
    return model.setDestSpec(destSpec);
  }, [destSpec, model]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: add pageUrl to deps
  useEffect(() => {
    return model.onIframeMounted(iframeRef.current!);
  }, [model, pageUrl]);
  return (
    <UnitIdsBox unitId={unitId} destSpec={destSpec}>
      <iframe
        ref={iframeRef}
        src={pageUrl}
        width="200"
        height="100"
        title={unitId}
      />
    </UnitIdsBox>
  );
};
