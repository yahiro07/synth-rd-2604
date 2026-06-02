import { SubPortType, UnitOutputPort } from "@/contract/unit-interfaces";
import { HsUnitInputPort, HsUnitOutputPort } from "@/host-app/host/host-types";

function getConnectedSubPortTypes(
  port: HsUnitInputPort,
  hasAudioOutput: boolean,
): SubPortType[] {
  if (port.getSubPortTypes) {
    return port.getSubPortTypes(hasAudioOutput);
  }
  return [
    hasAudioOutput && port.audioInput ? "audio" : undefined,
    port.noteInput ? "note" : undefined,
    port.cvGateInput ? "cvGate" : undefined,
    port.clockInput ? "clock" : undefined,
    port.stateInput ? "state" : undefined,
    port.parametersInput ? "parameters" : undefined,
    port.samplerPadInput ? "samplerPad" : undefined,
  ].filter((type): type is SubPortType => !!type);
}

export function createHsUnitOutputPortImpl(
  fnCreateGainNode: () => GainNode,
): HsUnitOutputPort {
  let connectedInputPort: HsUnitInputPort | null;
  let audioRelayNode: AudioNode | null;
  let callbacks: Parameters<UnitOutputPort["setCallbacks"]>[0] | undefined;
  let unsubscribeSubPortTypes: (() => void) | undefined;

  const core = {
    connectTo(port: HsUnitInputPort) {
      if (connectedInputPort) {
        core.disconnectFrom(connectedInputPort);
      }
      if (audioRelayNode && port.audioInput) {
        audioRelayNode.connect(port.audioInput?.node);
      }
      connectedInputPort = port;
      const subPortTypes = getConnectedSubPortTypes(port, !!audioRelayNode);
      callbacks?.onConnectedTo?.(subPortTypes);
      port.callbacks?.onConnectedFrom?.(subPortTypes);
      unsubscribeSubPortTypes = port.subscribeSubPortTypes?.(
        (nextSubPortTypes) => {
          if (connectedInputPort === port) {
            callbacks?.onConnectedTo?.(nextSubPortTypes);
          }
        },
      );
    },
    disconnectFrom(port: HsUnitInputPort) {
      const wasConnected = connectedInputPort === port;
      if (audioRelayNode && port.audioInput) {
        audioRelayNode.disconnect(port.audioInput?.node);
      }
      if (wasConnected) {
        unsubscribeSubPortTypes?.();
        unsubscribeSubPortTypes = undefined;
        connectedInputPort = null;
        callbacks?.onDisconnectTo?.();
        port.callbacks?.onDisconnectFrom?.();
      }
    },
  };
  return {
    connectTo: core.connectTo,
    disconnectFrom: core.disconnectFrom,
    setCallbacks(_callbacks) {
      callbacks = _callbacks;
    },
    audioOutput: {
      get node() {
        audioRelayNode ??= fnCreateGainNode();
        return audioRelayNode;
      },
    },
    noteOutput: {
      noteOn(note: number) {
        connectedInputPort?.noteInput?.noteOn(note);
      },
      noteOff(note: number) {
        connectedInputPort?.noteInput?.noteOff(note);
      },
    },
    cvGateOutput: {
      setCv(cv: number) {
        connectedInputPort?.cvGateInput?.setCv(cv);
      },
      setGate(gate: boolean) {
        connectedInputPort?.cvGateInput?.setGate(gate);
      },
    },
    clockOutput: {
      start() {
        connectedInputPort?.clockInput?.start?.();
      },
      step(stepIndex: number) {
        connectedInputPort?.clockInput?.step?.(stepIndex);
      },
      stop() {
        connectedInputPort?.clockInput?.stop?.();
      },
    },
    stateOutput: {
      emitState() {
        return connectedInputPort?.stateInput?.emitState?.();
      },
      applyState(state: Record<string, any>) {
        connectedInputPort?.stateInput?.applyState?.(state);
      },
      emitStateBytes() {
        return connectedInputPort?.stateInput?.emitStateBytes?.();
      },
      applyStateBytes(bytes: Uint8Array) {
        connectedInputPort?.stateInput?.applyStateBytes?.(bytes);
      },
    },
    parametersOutput: {
      getParameterSpecs() {
        return connectedInputPort?.parametersInput?.getParameterSpecs?.() ?? [];
      },
      getParameter(id: string) {
        return connectedInputPort?.parametersInput?.getParameter?.(id) ?? 0;
      },
      setParameter(id: string, value: number) {
        connectedInputPort?.parametersInput?.setParameter?.(id, value);
      },
    },
    samplerPadOutput: {
      getToneIds() {
        return connectedInputPort?.samplerPadInput?.getToneIds?.() ?? [];
      },
      playTone(toneId: string) {
        connectedInputPort?.samplerPadInput?.playTone?.(toneId);
      },
    },
  };
}
