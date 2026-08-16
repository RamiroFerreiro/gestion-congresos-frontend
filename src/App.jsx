import { Routes, Route } from "react-router-dom";
import UserSelector from "./components/UserSelector";
import PaperComponent from "./components/PaperComponent";
import CongressComponent from "./components/CongressComponent";


function App() {
  return (
    <Routes>
      <Route path="/" element={<UserSelector />} />
      <Route path="/crear-paper" element={<PaperComponent />} />
      <Route path="/crear-congreso" element={<CongressComponent />} /> 
    </Routes>
  );
}

export default App;