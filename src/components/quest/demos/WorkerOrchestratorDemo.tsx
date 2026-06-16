"use client";
import { useEffect, useState } from "react";
import { playSound } from "@/lib/sfx";
import { cn } from "@/lib/cn";

interface Job {
  name: string;
  retries: number;
}
interface Worker {
  id: number;
  status: "idle" | "busy" | "dead";
  job?: Job;
  progress: number;
  respawnIn: number;
}
interface Sim {
  workers: Worker[];
  queue: Job[];
  done: number;
  seq: number;
}

const INITIAL: Sim = {
  workers: [0, 1, 2].map((id) => ({ id, status: "idle", progress: 0, respawnIn: 0 })),
  queue: [
    { name: "train-lora-001", retries: 0 },
    { name: "embed-corpus-002", retries: 0 },
    { name: "finetune-vit-003", retries: 0 },
  ],
  done: 0,
  seq: 4,
};

/**
 * GPU worker orchestration demo: jobs flow from the queue to workers; kill a
 * worker and watch its job re-queue with exponential backoff while the pool
 * self-heals. A toy with the same shape as the production system.
 */
export function WorkerOrchestratorDemo() {
  const [sim, setSim] = useState<Sim>(INITIAL);

  // the scheduler tick
  useEffect(() => {
    const iv = setInterval(() => {
      setSim((prev) => {
        const queue = [...prev.queue];
        let done = prev.done;
        const workers = prev.workers.map((w) => {
          // dead workers count down to respawn
          if (w.status === "dead") {
            const respawnIn = w.respawnIn - 1;
            return respawnIn <= 0
              ? { ...w, status: "idle" as const, respawnIn: 0 }
              : { ...w, respawnIn };
          }
          // busy workers make progress
          if (w.status === "busy" && w.job) {
            const progress = w.progress + 9 + ((w.id * 7 + prev.seq) % 8);
            if (progress >= 100) {
              done++;
              return { ...w, status: "idle" as const, job: undefined, progress: 0 };
            }
            return { ...w, progress };
          }
          // idle workers pull from the queue
          if (w.status === "idle" && queue.length > 0) {
            const job = queue.shift()!;
            return { ...w, status: "busy" as const, job, progress: 0 };
          }
          return w;
        });
        return { ...prev, workers, queue, done };
      });
    }, 480);
    return () => clearInterval(iv);
  }, []);

  const addJob = () => {
    playSound("confirm");
    setSim((prev) => ({
      ...prev,
      seq: prev.seq + 1,
      queue: [...prev.queue, { name: `train-lora-${String(prev.seq).padStart(3, "0")}`, retries: 0 }],
    }));
  };

  const killWorker = () => {
    setSim((prev) => {
      const target =
        prev.workers.find((w) => w.status === "busy") ??
        prev.workers.find((w) => w.status === "idle");
      if (!target) return prev;
      playSound("cut");
      const queue = [...prev.queue];
      if (target.job) {
        // the orphaned job goes back to the front with backoff
        queue.unshift({ ...target.job, retries: target.job.retries + 1 });
      }
      return {
        ...prev,
        queue,
        workers: prev.workers.map((w) =>
          w.id === target.id
            ? { ...w, status: "dead", job: undefined, progress: 0, respawnIn: 7 }
            : w,
        ),
      };
    });
  };

  return (
    <div className="pixel-corners border-2 border-pink/30 bg-[#10060e]/85 p-4 sm:p-5">
      <div className="font-pixel mb-4 flex flex-wrap items-center justify-between gap-2 text-[9px]">
        <span className="text-pink">
          ▶ GPU ORCHESTRATOR<span className="ml-2 text-dim">- try to break it</span>
        </span>
        <span className="flex gap-2">
          <button
            type="button"
            onClick={addJob}
            className="gx border border-cyan/50 px-2 py-1 text-[8px] text-cyan hover:bg-cyan hover:text-bg"
          >
            + ADD JOB
          </button>
          <button
            type="button"
            onClick={killWorker}
            className="gx border border-pink/60 px-2 py-1 text-[8px] text-pink hover:bg-pink hover:text-bg"
          >
            ☠ KILL WORKER
          </button>
        </span>
      </div>

      {/* workers */}
      <div className="grid gap-3 sm:grid-cols-3">
        {sim.workers.map((w) => (
          <div
            key={w.id}
            className={cn(
              "border-2 p-3",
              w.status === "dead"
                ? "border-pink/60 bg-pink/5"
                : w.status === "busy"
                  ? "border-cyan/50 bg-cyan/5"
                  : "border-purple/40 bg-black/30",
            )}
          >
            <div className="font-pixel flex items-center justify-between text-[8px]">
              <span className="text-white">GPU-{w.id}</span>
              <span
                className={cn(
                  w.status === "dead" ? "text-pink" : w.status === "busy" ? "text-cyan" : "text-dim",
                )}
              >
                {w.status === "dead" ? `DEAD · ${w.respawnIn}` : w.status.toUpperCase()}
              </span>
            </div>
            <div className="font-term mt-2 h-6 truncate text-base text-[#c8bff0]">
              {w.status === "busy" && w.job ? w.job.name : w.status === "dead" ? "respawning…" : "-"}
            </div>
            <div className="mt-1 h-2.5 border border-purple/40 bg-black/40 p-[2px]">
              <span
                className={cn(
                  "block h-full transition-[width] duration-300",
                  w.status === "dead" ? "bg-pink/50" : "bg-gradient-to-r from-cyan to-purple",
                )}
                style={{ width: `${w.status === "busy" ? w.progress : w.status === "dead" ? 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* queue + counters */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="font-pixel text-[8px] text-dim">QUEUE {sim.queue.length}</span>
        {sim.queue.slice(0, 4).map((j, i) => (
          <span
            key={`${j.name}-${i}`}
            className={cn(
              "font-pixel border px-1.5 py-1 text-[7px]",
              j.retries > 0 ? "border-yellow/60 text-yellow" : "border-purple/40 text-[#c8bff0]",
            )}
          >
            {j.name}
            {j.retries > 0 && ` · RETRY ×${j.retries} · BACKOFF ${2 ** j.retries}s`}
          </span>
        ))}
        {sim.queue.length > 4 && (
          <span className="font-pixel text-[7px] text-dim">+{sim.queue.length - 4} more</span>
        )}
        <span className="font-pixel ml-auto text-[8px] text-term" aria-live="polite">
          DONE {sim.done}
        </span>
      </div>

      <p className="font-term mt-3 text-sm text-dim">
        Self-healing pool: killed workers respawn, orphaned jobs re-queue with exponential backoff.
      </p>
    </div>
  );
}
