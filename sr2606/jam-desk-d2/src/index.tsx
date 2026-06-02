import "./page.css";
import "beams/ax-ui/utility-classes.css";
//
import { mountAppRoot } from "beams/ax-react/mount-app-root";
import { UnitFrame } from "@/ui/unit-frame";

const App = () => {
  return (
    <div className="flex-vc gap-4">
      <UnitFrame unitId="mixer1" unitClassKey="mixer" destSpec="$output" />
      <div className="flex-h gap-4">
        <div className="flex-v gap-2">
          <UnitFrame unitId="osc1" unitClassKey="osc" destSpec="mixer1.port0" />
          <UnitFrame
            unitId="keyboard1"
            unitClassKey="keyboard"
            destSpec="osc1"
          />
        </div>
        <div className="flex-v gap-2">
          <UnitFrame unitId="osc2" unitClassKey="osc" destSpec="mixer1.port1" />
          <UnitFrame
            unitId="keyboard2"
            unitClassKey="keyboard"
            destSpec="osc2"
          />
        </div>
      </div>
      <UnitFrame
        unitId="twoPortsKeyboard1"
        unitClassKey="twoPortsKeyboard"
        destSpec={["osc1", "osc2"]}
      />
    </div>
  );
};

mountAppRoot(<App />);
