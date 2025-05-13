
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EmptyTradesStateProps {
  onAddNew: () => void;
}

const EmptyTradesState: React.FC<EmptyTradesStateProps> = ({ onAddNew }) => {
  return (
    <Card>
      <div className="py-16 text-center">
        <p className="text-muted-foreground mb-4">You haven't logged any trades yet.</p>
        <Button onClick={onAddNew}>Log Your First Trade</Button>
      </div>
    </Card>
  );
};

export default EmptyTradesState;
