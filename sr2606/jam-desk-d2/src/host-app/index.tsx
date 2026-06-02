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
        <div className="flex-vc gap-2">
          {/* <ReactUnitFrame
            unitId="osc1"
            unitClassKey="osc"
            destSpec="mixer1.port0"
          /> */}
          <UnitFrame
            unitId="osc1"
            pageUrl="/units/osc/index.html"
            destSpec="mixer1.port0"
          />
          <ReactUnitFrame
            unitId="keyboard1"
            unitTemplateFn={uf.keyboard}
            destSpec="osc1"
          />
        </div>
        <div className="flex-v gap-2">
          <ReactUnitFrame
            unitId="osc2"
            unitTemplateFn={uf.osc}
            destSpec="mixer1.port1"
          />
          <ReactUnitFrame
            unitId="keyboard2"
            unitTemplateFn={uf.keyboard}
            destSpec="osc2"
          />
        </div>
      </div>
      <ReactUnitFrame
        unitId="twoPortsKeyboard1"
        unitTemplateFn={uf.twoPortsKeyboard}
        destSpec={["osc1", "osc2"]}
      />
    </div>
  );
};

mountAppRoot(<App />);
