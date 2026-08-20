import { Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />} >
        <Route path="/" element={<div>Home</div>} />
      </Route>
    </Routes>
  );
}

export default AppRouter;