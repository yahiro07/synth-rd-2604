import "../../page.css";
import "beams/ax-ui/utility-classes.css";
//
import { mountAppRoot } from "beams/ax-react/mount-app-root";

const App = () => {
  return (
    <div className="flex-vc gap-4">
      <div className="bg-violet-100 w-[200px] h-[100px] flex-c">iframe osc</div>
    </div>
  );
};

mountAppRoot(<App />);
