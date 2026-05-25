"use client";

import React from "react";
import { Map } from "lucide-react";
import { Card, Button, EmptyState } from "@/components/ui";

export const VisitedTab: React.FC = () => {
  return (
    <Card radius="xl" padding="lg" shadow="none" surface="muted">
      <EmptyState
        icon={<Map size={32} strokeWidth={1.5} />}
        title="Interactive map coming soon"
        description="Track every spot you've visited on a personal map."
        action={
          <Button variant="secondary" size="sm">
            View list instead
          </Button>
        }
      />
    </Card>
  );
};

export default VisitedTab;
