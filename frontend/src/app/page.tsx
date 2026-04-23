"use client";

import React from "react";
import dynamic from "next/dynamic";
import { PromoNav }         from "@/components/features/promo/PromoNav";
import { PromoHero }        from "@/components/features/promo/PromoHero";
import { PromoFeatures }    from "@/components/features/promo/PromoFeatures";

const PromoWhySection = dynamic(() => import("@/components/features/promo/PromoWhySection").then(mod => mod.PromoWhySection));
const PromoHowItWorks = dynamic(() => import("@/components/features/promo/PromoHowItWorks").then(mod => mod.PromoHowItWorks));
const PromoSocialProof = dynamic(() => import("@/components/features/promo/PromoSocialProof").then(mod => mod.PromoSocialProof));
const PromoPlans = dynamic(() => import("@/components/features/promo/PromoPlans").then(mod => mod.PromoPlans));
const PromoCTA = dynamic(() => import("@/components/features/promo/PromoCTA").then(mod => mod.PromoCTA));
const PromoFooter = dynamic(() => import("@/components/features/promo/PromoFooter").then(mod => mod.PromoFooter));

export default function PromoPage() {
  return (
    <div style={{ width: "100%", overflowX: "hidden" }}>
      <PromoNav />
      <main>
        <PromoHero />
        <PromoFeatures />
        <PromoWhySection />
        <PromoHowItWorks />
        <PromoSocialProof />
        <PromoPlans />
        <PromoCTA />
      </main>
      <PromoFooter />
    </div>
  );
}
