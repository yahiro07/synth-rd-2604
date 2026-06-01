import { seqNumbers } from "beams/ax/array-utils";
import {
  HostInterfaceForIframe,
  HostInterfaceForReact,
} from "@/contract/unit-interfaces";

function _expectedUseCase_defineUnitInApp() {
  let hostInterface!: HostInterfaceForReact;
  hostInterface.defineUnitClass((ac, createOutputPort) => {
    const outputPort = createOutputPort();
    const myGain = ac.createGain();
    myGain.gain.value = 0.5;
    myGain.connect(outputPort.audioOutput.node);
    return {
      outputPort,
      inputPort: {
        noteInput: {
          noteOn(note) {
            console.log("note on", note);
          },
          noteOff(note) {
            console.log("note off", note);
          },
        },
      },
      render() {
        return <div>My Unit</div>;
      },
    };
  });
}

function _expectedUseCase_defineUnitInApp_MultiPortSupport() {
  let hostInterface!: HostInterfaceForReact;
  hostInterface.defineUnitClass((ac, createOutputPort) => {
    const gains = seqNumbers(4).map(() => ac.createGain());
    const outputPorts = gains.map((gain) => {
      const outputPort = createOutputPort();
      gain.connect(outputPort.audioOutput.node);
      return outputPort;
    });
    return {
      outputPort: outputPorts[0],
      multiChannelOutputs: outputPorts,
      inputPort: {},
      render() {
        return (
          <div>
            My Unit
            {/* control gains here */}
          </div>
        );
      },
    };
  });
}

function _expectedUseCase_defineUnitInIframe_Synthesizer() {
  let hostInterface: HostInterfaceForIframe | undefined;
  const ac = hostInterface?.audioContext ?? new AudioContext();
  const destNode =
    hostInterface?.primaryOutputPort.audioOutput.node ?? ac.destination;
  const myGain = ac.createGain();
  myGain.gain.value = 0.5;
  myGain.connect(destNode);

  hostInterface?.primaryInputPort.setHandlers({
    noteInput: {
      noteOn(note) {
        console.log("note on", note);
        //play oscillatorNode here
      },
      noteOff(note) {
        console.log("note off", note);
        //stop oscillatorNode here
      },
    },
  });
  hostInterface?.registerUnit({});
  //render apps in iframe DOM
}

function _expectedUseCase_defineUnitInIframe_Effect() {
  let hostInterface: HostInterfaceForIframe | undefined;
  const ac = hostInterface?.audioContext ?? new AudioContext();
  const inputNode = hostInterface?.primaryInputPort.audioInput?.node;
  const destNode =
    hostInterface?.primaryOutputPort.audioOutput.node ?? ac.destination;
  const myGain = ac.createGain();
  myGain.gain.value = 0.5;
  inputNode?.connect(myGain); //disconnected by host on unloading page
  myGain.connect(destNode);

  hostInterface?.registerUnit({});
  //render apps in iframe DOM
}

function _expectedUseCase_defineUnitInIframe_Sequencer() {
  let hostInterface: HostInterfaceForIframe | undefined;
  const noteOutputPort = hostInterface?.primaryOutputPort.noteOutput;
  hostInterface?.primaryInputPort.setHandlers({
    clockInput: {
      start() {},
      step(_stepIndex: number) {
        noteOutputPort?.noteOn(60);
        setTimeout(() => {
          noteOutputPort?.noteOff(60);
        }, 100);
      },
      stop() {
        noteOutputPort?.noteOff(60);
      },
    },
  });
  hostInterface?.registerUnit({});
  //render apps in iframe DOM
}

function _expectedUseCase_defineUnitInIframe_Mixer() {
  let hostInterface: HostInterfaceForIframe | undefined;
  if (!hostInterface) {
    return;
  }
  const ac = hostInterface.audioContext ?? new AudioContext();
  const destNode =
    hostInterface.primaryOutputPort.audioOutput.node ?? ac.destination;
  const inputPorts = seqNumbers(4).map(() =>
    hostInterface.addMultiChannelInputPort(),
  );
  const mixerGainNodes = seqNumbers(4).map((i) => {
    const inputNode = inputPorts[i].audioInput.node;
    const gainNode = ac.createGain();
    gainNode.gain.value = 0.5;
    inputNode.connect(gainNode); //disconnected by host on unloading page
    gainNode.connect(destNode);
    return gainNode;
  });
  hostInterface?.registerUnit({});
  //render apps in iframe DOM, control gains of each channel
}

function _expectedUseCase_defineUnitInIframe_MultiOutputSequencer() {
  let hostInterface: HostInterfaceForIframe | undefined;
  const outputPorts = hostInterface
    ? seqNumbers(4).map(() => hostInterface.addMultiChannelOutputPort())
    : undefined;
  const core = {
    onStep(stepIndex: number) {
      const ch = stepIndex % 4;
      outputPorts?.[ch]?.noteOutput.noteOn(60);
      setTimeout(() => {
        outputPorts?.[ch]?.noteOutput.noteOff(60);
      }, 100);
    },
  };
  hostInterface?.primaryInputPort.setHandlers({
    clockInput: {
      step: core.onStep,
    },
  });
  hostInterface?.registerUnit({});
  //render apps in iframe DOM
}

/*
expected react wrapper usage
<UnitFrame id="mixer1" unitClassKey="mixer" destUnitId="$output">
<UnitFrame id="osc1" unitClassKey="osc" destUnitId="mixer1.ch0" />  //connect to multi input
<UnitFrame id="seq1" unitClassKey="seq" destUnitId="osc1" />
<UnitFrame id="osc2" unitClassKey="osc" destUnitId="mixer1.ch1" />  //connect to multi input
<UnitFrame id="seq2" unitClassKey="seq" destUnitId="osc1" />
<UnitFrame id="clocker1" unitClassKey="clocker" destUnitId={{ ch0: "seq1", ch1: "seq2" }} />  //connect from multi output
*/
