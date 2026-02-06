import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import AchievementsPage from "./pages/AchievementsPage";
import CareersPage from "./pages/CareersPage";
import HomePage from "./pages/HomePage";
import RunPage from "./pages/RunPage";
import SummaryPage from "./pages/SummaryPage";
import TrajectoryPage from "./pages/TrajectoryPage";

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/run" element={<RunPage />} />
          <Route path="/run/trajectory" element={<TrajectoryPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/summary" element={<SummaryPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
