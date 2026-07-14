"use client";

import dynamic from 'next/dynamic';
import React from 'react';
import { Row } from '@once-ui-system/core';

// Dynamically import the Mapbox GL widget so Next.js doesn't try SSR on it (which throws "window is not defined")
const MapWidget = dynamic(
  () => import('./MapWidget'),
  { 
    ssr: false,
    loading: () => (
      <Row horizontal="center" vertical="center" style={{ width: '100%', height: '100%', backgroundColor: '#F2F2F7' }}>
        <Row style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #E5E5EA', borderTopColor: '#ED1B24', animation: 'spin 1s linear infinite' }} />
      </Row>
    )
  }
);

export default function Map(props: any) {
  return <MapWidget {...props} />;
}
