import "./page.css";
import "beams/ax-ui/utility-classes.css";
//
import { mountAppRoot } from "beams/ax-react/mount-app-root";
import { UnitFrame } from "@/ui/unit-frame";

const App = () => {
  return (
    <div className="flex-vc gap-4">
      <UnitFrame unitId="osc1" unitClassKey="osc" destUnitId="$output" />
      <UnitFrame unitId="keyboard1" unitClassKey="keyboard" destUnitId="osc1" />
    </div>
  );
};

mountAppRoot(<App />);
