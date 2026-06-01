import { seqNumbers } from "beams/ax/array-utils";
import {
  HostInterfaceForIframe,
  HostInterfaceRaw,
} from "@/contract/unit-interfaces";

function _expectedUseCase_defineUnitInApp() {
  let hostInterface!: HostInterfaceRaw;
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
  let hostInterface!: HostInterfaceRaw;
  hostInterface.defineUnitClass((ac, createOutputPort) => {
    const gains = seqNumbers(4).map(() => ac.createGain());
    const outputPorts = gains.map((gain, i) => {
      const outputPort = createOutputPort();
      gain.connect(outputPort.audioOutput.node);
      return outputPort;
    });
    return {
      outputPort: outputPorts[0],
      outputPorts,
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

function _expectedUseCase_renderUnitInIframe() {
  let hostInterface: HostInterfaceForIframe | undefined;
  const ac = hostInterface?.audioContext ?? new AudioContext();
  const destNode = hostInterface?.audioDestinationNode ?? ac.destination;
  const myGain = ac.createGain();
  myGain.gain.value = 0.5;
  myGain.connect(destNode);

  hostInterface?.defineUnit({
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
  });
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
