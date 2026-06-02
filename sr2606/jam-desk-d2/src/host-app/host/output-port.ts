import {
  UnitInputPort,
  UnitOutputPortInHostSide,
} from "@/shared/contract/unit-interfaces";

export function createOutputPortImpl(
  fnCreateGainNode: () => GainNode,
): UnitOutputPortInHostSide {
  let connectedInputPort: UnitInputPort | null;
  let audioRelayNode: AudioNode | null;

  const core = {
    connectTo(port: UnitInputPort) {
      if (connectedInputPort) {
        core.disconnectFrom(connectedInputPort);
      }
      if (audioRelayNode && port.audioInput) {
        audioRelayNode.connect(port.audioInput?.node);
      }
      connectedInputPort = port;
    },
    disconnectFrom(port: UnitInputPort) {
      if (audioRelayNode && port.audioInput) {
        audioRelayNode.disconnect(port.audioInput?.node);
      }
      if (connectedInputPort === port) {
        connectedInputPort = null;
      }
    },
  };
  return {
    connectTo: core.connectTo,
    disconnectFrom: core.disconnectFrom,
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
      getParameterValue(id: string) {
        return (
          connectedInputPort?.parametersInput?.getParameterValue?.(id) ?? 0
        );
      },
      setParameterValue(id: string, value: number) {
        connectedInputPort?.parametersInput?.setParameterValue?.(id, value);
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
