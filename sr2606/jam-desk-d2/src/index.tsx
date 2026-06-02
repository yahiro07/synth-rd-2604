import "./page.css";
import "beams/ax-ui/utility-classes.css";
//
import { mountAppRoot } from "beams/ax-react/mount-app-root";
import { UnitFrame } from "@/ui/unit-frame";

const App = () => {
  return (
    <div className="flex-vc gap-4">
      <UnitFrame unitId="mixer1" unitClassKey="mixer" destSpec="$output" />
      <UnitFrame unitId="osc1" unitClassKey="osc" destSpec="mixer1.port0" />
      <UnitFrame unitId="keyboard1" unitClassKey="keyboard" destSpec="osc1" />
    </div>
  );
};

mountAppRoot(<App />);
