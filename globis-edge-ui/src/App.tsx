import { SessionProvider, useSession } from "./store/SessionContext";
import { MainLayout_Enhanced as MainLayout } from "./components/Layout/MainLayout_Enhanced";
import { Screen1_NewIntake } from "./components/Screens/Screen1_NewIntake_Enhanced";
import { Screen2_Ingest } from "./components/Screens/Screen2_Ingest";
import { Screen3_Synthesise_with_Override as Screen3_Synthesise } from "./components/Screens/Screen3_Synthesise_with_Override";
import { Screen4_FastpathExplainer as Screen4_Explainer } from "./components/Screens/Screen4_FastpathExplainer";
import { Screen5_DignityLoop } from "./components/Screens/Screen5_DignityLoop";
import { Screen6_Commit } from "./components/Screens/Screen6_Commit";
import "./styles/globals.css";

function AppContent() {
  const { state } = useSession();

  const renderScreen = () => {
    switch (state.current_screen) {
      case 1:
        return <Screen1_NewIntake />;
      case 2:
        return <Screen2_Ingest />;
      case 3:
        return <Screen3_Synthesise />;
      case 4:
        return <Screen4_Explainer />;
      case 5:
        return <Screen5_DignityLoop />;
      case 6:
        return <Screen6_Commit />;
      default:
        return <Screen1_NewIntake />;
    }
  };

  return <MainLayout>{renderScreen()}</MainLayout>;
}

function App() {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
}

export default App;
