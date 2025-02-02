import Home from "./Home";
import { useAuth } from "./hooks/useAuth";
import { Rqx } from "./RQ";
import Signin from "./Signin";

function App() {
  const auth = useAuth();

  return (
    <>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>

      <Signin />
      <Home />

      <Rqx />
    </>
  );
}

export default App;
