// app/stage/page.tsx
import TumorStagePredictor from '../components/TumorStagePredictor';
import OncologistLayout from '../layouts/OncologistLayout';

export default function StagePage() {
  return (
    <OncologistLayout>
      <TumorStagePredictor />
    </OncologistLayout>
  );
}