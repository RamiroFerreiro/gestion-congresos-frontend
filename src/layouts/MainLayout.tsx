import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <div>
      <header>
        <h1>Gestión de Congresos</h1>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;