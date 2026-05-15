import "./styles";
import { mountAppRoot } from "./utils/mount-app-root";

function App() {
  return <div>app</div>;
}
mountAppRoot(() => <App />);
