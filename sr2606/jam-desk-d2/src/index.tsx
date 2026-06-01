import "./page.css";
import "beams/ax-ui/utility-classes.css";
//
import { mountAppRoot } from "beams/ax-react/mount-app-root";
import { UnitFrame } from "@/ui/unit-frame";

const App = () => {
  return (
    <div>
      <UnitFrame unitId="osc1" unitClassKey="osc" destUnitId="$output" />
    </div>
  );
};

mountAppRoot(<App />);
