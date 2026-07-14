"use client";

import { useEffect, useState } from "react";
import { membershipApi } from "@/lib/membershipApi";
import type { Plan } from "@/types/membership";

let plansCache: Promise<Plan[]> | null = null;

function fetchPlans(): Promise<Plan[]> {
  if (!plansCache) {
    plansCache = membershipApi.getPlans().catch((err) => {
      plansCache = null;
      throw err;
    });
  }
  return plansCache;
}

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchPlans()
      .then((data) => {
        if (isMounted) setPlans(data);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const byId = plans.reduce<Partial<Record<Plan["plan"], Plan>>>((acc, plan) => {
    acc[plan.plan] = plan;
    return acc;
  }, {});

  return { plans, byId, loading };
}
