'use client';

import React, { useEffect, useState } from 'react';
import { Column, Row, Heading, Text } from '@/once-ui/components';
import { apiGet } from '@/lib/api';
import { Users, Target, MapPin } from 'lucide-react';

interface AnalyticsOverview {
  total_users: number;
  active_challenges: number;
  total_locations: number;
}

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

  return (
    <Column fillWidth padding="32" gap="32">
      <Heading variant="display-strong-l">Analytics & Statistics</Heading>

      <Row gap="16" s={{ direction: 'column' }}>
        {/* Total Users */}
        <Column background="surface" padding="24" radius="l" gap="16" fillWidth>
          <Row horizontal="space-between" vertical="center">
            <Text variant="body-default-m" onBackground="neutral-medium">Total Users</Text>
            <Users size={20} className="text-neutral-medium" />
          </Row>
          <Heading variant="display-strong-m">
            {loading ? '...' : data?.total_users ?? '-'}
          </Heading>
        </Column>

        {/* Active Challenges */}
        <Column background="surface" padding="24" radius="l" gap="16" fillWidth>
          <Row horizontal="space-between" vertical="center">
            <Text variant="body-default-m" onBackground="neutral-medium">Active Challenges</Text>
            <Target size={20} className="text-neutral-medium" />
          </Row>
          <Heading variant="display-strong-m">
            {loading ? '...' : data?.active_challenges ?? '-'}
          </Heading>
        </Column>

        {/* Total Locations */}
        <Column background="surface" padding="24" radius="l" gap="16" fillWidth>
          <Row horizontal="space-between" vertical="center">
            <Text variant="body-default-m" onBackground="neutral-medium">Total Locations</Text>
            <MapPin size={20} className="text-neutral-medium" />
          </Row>
          <Heading variant="display-strong-m">
            {loading ? '...' : data?.total_locations ?? '-'}
          </Heading>
        </Column>
      </Row>
    </Column>
  );
}
