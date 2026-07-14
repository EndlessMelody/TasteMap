import { Suspense } from "react";
import TourBuilderClient from "./TourBuilderClient";

export default function TourBuilderPage() {
  return (
    <Suspense fallback={null}>
      <TourBuilderClient />
    </Suspense>
  );
}
