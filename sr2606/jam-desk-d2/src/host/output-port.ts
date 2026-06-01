import { UnitInputPort, UnitOutputPort } from "@/contract/unit-interfaces";

export function createOutputPortImpl(
  fnCreateGainNode: () => GainNode,
): UnitOutputPort {
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
    proxies: {
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
        reset() {
          connectedInputPort?.clockInput?.reset();
        },
        onStep(fn: () => void) {
          connectedInputPort?.clockInput?.onStep(fn);
        },
      },
      switcherOutput: {
        emitState() {
          return connectedInputPort?.switcherInput?.emitState() || {};
        },
        applyState(state: Record<string, any>) {
          connectedInputPort?.switcherInput?.applyState(state);
        },
      },
      audioOutput: {
        get node() {
          audioRelayNode ??= fnCreateGainNode();
          return audioRelayNode;
        },
      },
    },
  };
}
