// app/risk/page.tsx
import DSO3Predictor from "../components/RiskPredictor";
import PathologistLayout from '../layouts/PathologistLayout';

export default function RiskPage() {
  return (
    <PathologistLayout>
      <DSO3Predictor />
    </PathologistLayout>
  );
}