import "../page.css";
import "beams/ax-ui/utility-classes.css";
//
import { mountAppRoot } from "beams/ax-react/mount-app-root";
import { ReactUnitFrame } from "@/host-app/unit-frame/react-unit-frame";
import { UnitFrame } from "@/host-app/unit-frame/unit-frame";
import { reactUnitFactories } from "@/units/react";

const App = () => {
  const uf = reactUnitFactories;
  return (
    <div className="flex-vc gap-4">
      <ReactUnitFrame
        unitId="mixer1"
        unitTemplateFn={uf.mixer}
        destSpec="$output"
      />
      <div className="flex-h gap-4">
        <UnitFrame
          unitId="osc1"
          pageUrl="/units/osc/index.html"
          destSpec="mixer1.port0"
        />
        <ReactUnitFrame
          unitId="osc2"
          unitTemplateFn={uf.osc}
          destSpec="mixer1.port1"
        />
        <ReactUnitFrame
          unitId="cvGateOsc1"
          unitTemplateFn={uf.cvGateOsc}
          destSpec="mixer1.port2"
        />
      </div>
      <div className="flex-h gap-4">
        <ReactUnitFrame
          unitId="keyboard1"
          unitTemplateFn={uf.keyboard}
          destSpec="osc1"
        />
        <ReactUnitFrame
          unitId="keyboard2"
          unitTemplateFn={uf.keyboard}
          destSpec="osc2"
        />
        <ReactUnitFrame
          unitId="keyboard3"
          unitTemplateFn={uf.keyboard}
          destSpec="cvGateOsc1"
        />
        <ReactUnitFrame
          unitId="stateSwitcher1"
          unitTemplateFn={uf.stateSwitcher}
          destSpec="osc2"
        />
      </div>

      <div className="flex-ha gap-4">
        <ReactUnitFrame
          unitId="twoPortsKeyboard1"
          unitTemplateFn={uf.twoPortsKeyboard}
          destSpec={["osc1", "osc2"]}
        />
        <ReactUnitFrame
          unitId="paramController1"
          unitTemplateFn={uf.parametersController}
          destSpec="osc2"
        />
        <ReactUnitFrame
          unitId="cvGateStepSequencer1"
          unitTemplateFn={uf.cvGateStepSequencer}
          destSpec="cvGateOsc1"
        />
      </div>
    </div>
  );
};

mountAppRoot(<App />);
