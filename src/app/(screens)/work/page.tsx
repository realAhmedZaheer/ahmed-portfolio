import type { Metadata } from "next";
import { ComboCounter } from "@/components/fx/ComboCounter";
import { WorkPillar } from "@/components/work/WorkPillar";
import { AdvanceButton } from "@/components/screens/AdvanceButton";
import { AgentToolCallDemo } from "@/components/work/demos/AgentToolCallDemo";
import { ScoringPipelineDemo } from "@/components/work/demos/ScoringPipelineDemo";
import { pillars } from "@/content/projects";
import { agentScenarios, scoringStages, scoringSamples } from "@/content/demos";

export const metadata: Metadata = {
  title: "LEVEL SELECT - WORK",
  description:
    "Ahmed Zaheer's work: agentic LLM systems (Gemini function-calling command center, 30+ tools) and generative-ML infrastructure (multi-model dataset quality analyzer, GPU worker orchestration).",
};

export default function WorkScreen() {
  return (
    <>
      <WorkPillar
        pillar={pillars[0]}
        num="01"
        demo={<AgentToolCallDemo scenarios={agentScenarios} />}
      />
      <ComboCounter hits={21} />
      <WorkPillar
        pillar={pillars[1]}
        num="02"
        demo={<ScoringPipelineDemo stages={scoringStages} samples={scoringSamples} />}
      />
      <AdvanceButton href="/campaign" label="CONTINUE" next="CAMPAIGN LOG" />
    </>
  );
}
