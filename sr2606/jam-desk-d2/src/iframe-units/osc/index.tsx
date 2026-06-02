import "../../page.css";
import "beams/ax-ui/utility-classes.css";
import { mountAppRoot } from "beams/ax-react/mount-app-root";
import { UnitInterface } from "@/contract/unit-interfaces";
import { createOscillatorUnitCore } from "@/host-app/react-units/oscillator-unit-core";

const unitInterface = (window as any).unitInterface as
  | UnitInterface
  | undefined;
const audioContext = unitInterface?.audioContext ?? new AudioContext();
const destNode =
  unitInterface?.primaryOutputPort.audioOutput.node ?? audioContext.destination;

const oscillatorCore = createOscillatorUnitCore(audioContext, destNode);

unitInterface?.primaryInputPort.setHandlers({
  noteInput: {
    noteOn: oscillatorCore.noteOn,
    noteOff: oscillatorCore.noteOff,
  },
});
unitInterface?.completeSetup();

const App = () => {
  return (
    <div className="flex-vc gap-4">
      <div className="bg-violet-100 w-[200px] h-[100px] flex-c">iframe osc</div>
    </div>
  );
};

mountAppRoot(<App />);
