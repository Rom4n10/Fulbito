"use client";

import { useTransition } from "react";
import { applyToMatch } from "@/app/actions/match-requests";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";

import { useRouter } from "next/navigation";

interface ApplyMatchButtonProps {
  matchId: string;
}

export function ApplyMatchButton({ matchId }: ApplyMatchButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleApply = () => {
    startTransition(async () => {
      try {
        const res = await applyToMatch(matchId);
        if (res?.error) {
          toast.error(res.error);
        } else {
          toast.success("¡Te postulaste con éxito!");
          router.refresh();
        }
      } catch (e: any) {
        toast.error("Ocurrió un error al postularse");
      }
    });
  };

  return (
    <Button
      variant="primary"
      size="lg"
      style={{ width: "100%" }}
      loading={isPending}
      disabled={isPending}
      onClick={handleApply}
    >
      {isPending ? "Postulándose..." : "Postularse al partido"}
    </Button>
  );
}
