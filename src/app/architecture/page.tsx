import type { Metadata } from "next";
import { ArchitectureObservatory } from "@/components/architecture-observatory";
import {
  architectureObservatoryEvents,
  architectureObservatoryGeneratedAt
} from "@/generated/architecture-observatory-data";

export const metadata: Metadata = {
  title: "Architecture Observatory - Project 99",
  description: "Internal Project99 architecture history and building visualization."
};

export default function ArchitecturePage() {
  return (
    <ArchitectureObservatory
      events={architectureObservatoryEvents}
      generatedAt={architectureObservatoryGeneratedAt}
    />
  );
}
