import { seqNumbers } from "beams/ax/array-utils";
import {
  HostInterfaceForReact,
  UnitInterfaceForIframe,
} from "./unit-interfaces";

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
      RenderUi() {
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
      RenderUi() {
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
  const unitInterface = (window as any).unitInterface as
    | UnitInterfaceForIframe
    | undefined;
  const ac = unitInterface?.audioContext ?? new AudioContext();
  const destNode =
    unitInterface?.primaryOutputPort.audioOutput.node ?? ac.destination;
  const myGain = ac.createGain();
  myGain.gain.value = 0.5;
  myGain.connect(destNode);

  unitInterface?.primaryInputPort.setHandlers({
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
  unitInterface?.completeSetup();
  //render apps in iframe DOM
}

function _expectedUseCase_defineUnitInIframe_Effect() {
  const unitInterface = (window as any).unitInterface as
    | UnitInterfaceForIframe
    | undefined;
  const ac = unitInterface?.audioContext ?? new AudioContext();
  const inputNode = unitInterface?.primaryInputPort.audioInput?.node;
  const destNode =
    unitInterface?.primaryOutputPort.audioOutput.node ?? ac.destination;
  const myGain = ac.createGain();
  myGain.gain.value = 0.5;
  inputNode?.connect(myGain); //disconnected by host on unloading page
  myGain.connect(destNode);

  unitInterface?.completeSetup();
  //render apps in iframe DOM
}

function _expectedUseCase_defineUnitInIframe_Sequencer() {
  const unitInterface = (window as any).unitInterface as
    | UnitInterfaceForIframe
    | undefined;
  const noteOutputPort = unitInterface?.primaryOutputPort.noteOutput;
  unitInterface?.primaryInputPort.setHandlers({
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
  unitInterface?.completeSetup();
  //render apps in iframe DOM
}

function _expectedUseCase_defineUnitInIframe_Mixer() {
  const unitInterface = (window as any).unitInterface as
    | UnitInterfaceForIframe
    | undefined;
  if (!unitInterface) {
    return;
  }
  const ac = unitInterface.audioContext ?? new AudioContext();
  const destNode =
    unitInterface.primaryOutputPort.audioOutput.node ?? ac.destination;
  const inputPorts = unitInterface.createMultiChannelInputPorts(4);
  const mixerGainNodes = seqNumbers(4).map((i) => {
    const inputNode = inputPorts[i].audioInput.node;
    const gainNode = ac.createGain();
    gainNode.gain.value = 0.5;
    inputNode.connect(gainNode); //disconnected by host on unloading page
    gainNode.connect(destNode);
    return gainNode;
  });
  unitInterface?.completeSetup();
  //render apps in iframe DOM, control gains of each channel
}

function _expectedUseCase_defineUnitInIframe_MultiOutputSequencer() {
  const unitInterface = (window as any).unitInterface as
    | UnitInterfaceForIframe
    | undefined;
  const outputPorts = unitInterface?.createMultiChannelOutputPorts(4);
  const core = {
    step(stepIndex: number) {
      const ch = stepIndex % 4;
      outputPorts?.[ch]?.noteOutput.noteOn(60);
      setTimeout(() => {
        outputPorts?.[ch]?.noteOutput.noteOff(60);
      }, 100);
    },
    stop() {
      outputPorts?.forEach((port) => {
        port.noteOutput.noteOff(60);
      });
    },
  };
  unitInterface?.primaryInputPort.setHandlers({
    clockInput: { step: core.step, stop: core.stop },
  });
  unitInterface?.completeSetup();
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
