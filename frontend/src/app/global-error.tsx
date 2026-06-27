"use client";

import React from "react";
import { Providers } from "@/providers/Providers";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div style={{ padding: 40, textAlign: "center", fontFamily: "sans-serif" }}>
            <h2>Something went wrong!</h2>
            <button
              onClick={() => reset()}
              style={{ padding: "8px 16px", marginTop: 16, cursor: "pointer" }}
            >
              Try again
            </button>
          </div>
        </Providers>
      </body>
    </html>
  );
}
