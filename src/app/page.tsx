import { Suspense, type JSX } from "react";
import { HomeClient } from "@/components/home/HomeClient";

/** Home / onboarding / start / join flow. Client work lives in HomeClient. */
export default function Home(): JSX.Element {
  return (
    <Suspense fallback={null}>
      <HomeClient />
    </Suspense>
  );
}
