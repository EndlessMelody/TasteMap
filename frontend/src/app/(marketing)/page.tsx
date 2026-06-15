"use client";

import React from "react";
import dynamic from "next/dynamic";
import { PromoNav }         from "@/components/features/promo/PromoNav";
import { PromoHero }        from "@/components/features/promo/PromoHero";
import { PromoFeatures }    from "@/components/features/promo/PromoFeatures";
import { PromoBackground }  from "@/components/features/promo/PromoBackground";
import { PromoScrollDots }  from "@/components/features/promo/PromoScrollDots";

const PromoWhySection  = dynamic(() => import("@/components/features/promo/PromoWhySection").then(m => m.PromoWhySection));
const PromoHowItWorks  = dynamic(() => import("@/components/features/promo/PromoHowItWorks").then(m => m.PromoHowItWorks));
const PromoSocialProof = dynamic(() => import("@/components/features/promo/PromoSocialProof").then(m => m.PromoSocialProof));
const PromoPlans       = dynamic(() => import("@/components/features/promo/PromoPlans").then(m => m.PromoPlans));
const PromoCTA         = dynamic(() => import("@/components/features/promo/PromoCTA").then(m => m.PromoCTA));

export default function PromoPage() {
  return (
    <div
      style={{
        width: "100%",
        overflowX: "hidden",
        backgroundColor: "#FFFCF7",
        color: "#18160F",
        position: "relative",
      }}
    >
      {/*
        Scroll is handled by PromoScrollDots (wheel + touch + keyboard).
        We hide the native scrollbar but keep overflow-y: scroll so
        window.scrollTo() works correctly.
      */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            #promo-scroll-container::-webkit-scrollbar { display: none; }
            #promo-scroll-container { -ms-overflow-style: none; scrollbar-width: none; }
          `,
        }}
      />
      <PromoBackground />
      <PromoScrollDots />
      <PromoNav />
      <main style={{ position: "relative", zIndex: 1 }}>
        <PromoHero />
        <PromoFeatures />
        <PromoWhySection />
        <PromoHowItWorks />
        <PromoSocialProof />
        <PromoPlans />
        <PromoCTA />
      </main>
    </div>
  );
}
