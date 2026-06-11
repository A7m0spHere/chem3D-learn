import { useState } from "react";
import { AppHeader } from "@/components/common/AppHeader";
import { HomePage } from "@/pages/HomePage";
import { LearningPage } from "@/pages/LearningPage";
import { mockMolecules } from "@/data/mockMolecules";

type Page = "home" | "learning";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [selectedMoleculeId, setSelectedMoleculeId] = useState(mockMolecules[0].id);

  const handleStartLearning = (moleculeId?: string) => {
    if (moleculeId) {
      setSelectedMoleculeId(moleculeId);
    }
    setCurrentPage("learning");
  };

  return (
    <>
      <AppHeader currentPage={currentPage} onNavigate={setCurrentPage} />
      {currentPage === "home" ? (
        <HomePage onStartLearning={handleStartLearning} />
      ) : (
        <LearningPage selectedMoleculeId={selectedMoleculeId} onSelectMolecule={setSelectedMoleculeId} />
      )}
    </>
  );
}
