import "../page.css";
import "beams/ax-ui/utility-classes.css";
//
import { mountAppRoot } from "beams/ax-react/mount-app-root";
import { ReactUnitFrame } from "@/host-app/ui/react-unit-frame";

const App = () => {
  return (
    <div className="flex-vc gap-4">
      <ReactUnitFrame unitId="mixer1" unitClassKey="mixer" destSpec="$output" />
      <div className="flex-h gap-4">
        <div className="flex-v gap-2">
          <ReactUnitFrame
            unitId="osc1"
            unitClassKey="osc"
            destSpec="mixer1.port0"
          />
          <ReactUnitFrame
            unitId="keyboard1"
            unitClassKey="keyboard"
            destSpec="osc1"
          />
        </div>
        <div className="flex-v gap-2">
          <ReactUnitFrame
            unitId="osc2"
            unitClassKey="osc"
            destSpec="mixer1.port1"
          />
          <ReactUnitFrame
            unitId="keyboard2"
            unitClassKey="keyboard"
            destSpec="osc2"
          />
        </div>
      </div>
      <ReactUnitFrame
        unitId="twoPortsKeyboard1"
        unitClassKey="twoPortsKeyboard"
        destSpec={["osc1", "osc2"]}
      />
    </div>
  );
};

mountAppRoot(<App />);
