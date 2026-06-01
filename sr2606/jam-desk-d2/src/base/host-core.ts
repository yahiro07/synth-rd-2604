import { UnitInputPort, UnitOutputPort } from "@/base/unit-interfaces";

function createUnitOutputPort(
  ac: AudioContext,
  withAudio: boolean,
): UnitOutputPort {
  let connectedInputPort: UnitInputPort | null;
  const audioRelayNode = withAudio ? ac.createGain() : null;

  const core = {
    connectTo(port: UnitInputPort) {
      if (connectedInputPort) {
        core.disconnectFrom(connectedInputPort);
      }
      if (audioRelayNode) {
        port.handlers.audioInput?.connectAudioFrom(audioRelayNode);
      }
      connectedInputPort = port;
    },
    disconnectFrom(port: UnitInputPort) {
      if (audioRelayNode) {
        port.handlers.audioInput?.disconnectAudioFrom(audioRelayNode);
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
          connectedInputPort?.handlers.noteInput?.noteOn(note);
        },
        noteOff(note: number) {
          connectedInputPort?.handlers.noteInput?.noteOff(note);
        },
      },
      cvGateOutput: {
        setCv(cv: number) {
          connectedInputPort?.handlers.cvGateInput?.setCv(cv);
        },
        setGate(gate: boolean) {
          connectedInputPort?.handlers.cvGateInput?.setGate(gate);
        },
      },
      clockOutput: {
        reset() {
          connectedInputPort?.handlers.clockInput?.reset();
        },
        onStep(fn: () => void) {
          connectedInputPort?.handlers.clockInput?.onStep(fn);
        },
      },
      switcherOutput: {
        emitState() {
          return connectedInputPort?.handlers.switcherInput?.emitState() || {};
        },
        applyState(state: Record<string, any>) {
          connectedInputPort?.handlers.switcherInput?.applyState(state);
        },
      },
      audioOutput: {
        connectAudioFrom(node: AudioNode) {
          if (audioRelayNode) {
            node.connect(audioRelayNode);
          }
        },
        disconnectAudioFrom(node: AudioNode) {
          if (audioRelayNode) {
            node.disconnect(audioRelayNode);
          }
        },
      },
    },
  };
}
