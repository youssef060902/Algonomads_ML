// app/predict/page.tsx
import BreastCancerPredictor from '../components/BreastCancerPredictor';
import OncologistLayout from '../layouts/OncologistLayout';

export default function PredictPage() {
  return (
    <OncologistLayout>
      <BreastCancerPredictor />
    </OncologistLayout>
  );
}