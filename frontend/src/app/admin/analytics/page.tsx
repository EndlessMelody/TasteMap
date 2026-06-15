'use client';

import React, { useEffect, useState } from 'react';
import { Column, Row, Heading, Text } from '@once-ui-system/core';
import { apiGet } from '@/lib/api';
import { Users, Target, MapPin } from 'lucide-react';

interface AnalyticsOverview {
  total_users: number;
  active_challenges: number;
  total_locations: number;
}

const ICON_SIZE = 20;

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await apiGet<AnalyticsOverview>('/analytics/overview');
        setData(result);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const stats: { label: string; value: React.ReactNode; icon: React.ReactNode }[] = [
    {
      label: 'Total Users',
      value: loading ? '...' : data?.total_users ?? '-',
      icon: <Users size={ICON_SIZE} />,
    },
    {
      label: 'Active Challenges',
      value: loading ? '...' : data?.active_challenges ?? '-',
      icon: <Target size={ICON_SIZE} />,
    },
    {
      label: 'Total Locations',
      value: loading ? '...' : data?.total_locations ?? '-',
      icon: <MapPin size={ICON_SIZE} />,
    },
  ];

  return (
    <Column fillWidth padding="32" gap="32">
      <Heading variant="display-strong-l">Analytics &amp; Statistics</Heading>

      <Row gap="16" fillWidth s={{ direction: 'column' }}>
        {stats.map((stat) => (
          <Column
            key={stat.label}
            background="surface"
            border="neutral-alpha-weak"
            padding="24"
            radius="l"
            gap="16"
            fillWidth
          >
            <Row horizontal="between" vertical="center">
              <Text variant="body-default-m" onBackground="neutral-medium">
                {stat.label}
              </Text>
              {/* lucide inherits currentColor; Text.onBackground keeps it theme-aware */}
              <Text onBackground="neutral-medium">{stat.icon}</Text>
            </Row>
            <Heading variant="display-strong-m">{stat.value}</Heading>
          </Column>
        ))}
      </Row>
    </Column>
  );
}
