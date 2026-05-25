"use client";

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the Leaflet widget so Next.js doesn't try SSR on it (which throws "window is not defined")
const MapWidget = dynamic(
  () => import('./MapWidget'),
  { 
    ssr: false,
    loading: () => (
      <div style={{ width: '100%', height: '100%', backgroundColor: '#F2F2F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #E5E5EA', borderTopColor: '#ED1B24', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }
);

export default function Map(props: any) {
  return <MapWidget {...props} />;
}
