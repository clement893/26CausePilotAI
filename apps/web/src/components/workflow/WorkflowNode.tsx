'use client';

/**
 * Node - Nœud personnalisé (déclencheur ou action) - Étape 3.3.2
 */

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Zap, Mail, MessageSquare, Clock, Users } from 'lucide-react';
import type { TriggerNodeData, ActionNodeData } from '@/lib/workflow/types';

const ICONS: Record<string, React.ReactNode> = {
  new_donator: <Users className="w-4 h-4" />,
  donation_anniversary: <Clock className="w-4 h-4" />,
  segment_entered: <Users className="w-4 h-4" />,
  campaign_clicked: <Zap className="w-4 h-4" />,
  send_email: <Mail className="w-4 h-4" />,
  send_sms: <MessageSquare className="w-4 h-4" />,
  wait_days: <Clock className="w-4 h-4" />,
  add_to_segment: <Users className="w-4 h-4" />,
};

function TriggerNodeInner({ data }: { data: TriggerNodeData }) {
  const type = data.triggerType ?? 'new_donator';
  return (
    <div className="rounded-lg border-2 border-amber-500/50 bg-amber-500/10 px-4 py-3 min-w-[160px] shadow-lg">
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !border-2 !bg-amber-500" />
      <div className="flex items-center gap-2">
        <span className="text-amber-400">{ICONS[type] ?? <Zap className="w-4 h-4" />}</span>
        <span className="text-sm font-medium text-white">{data.label ?? type}</span>
      </div>
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !border-2 !bg-amber-500" />
    </div>
  );
}

function ActionNodeInner({ data }: { data: ActionNodeData }) {
  const type = data.actionType ?? 'send_email';
  return (
    <div className="rounded-lg border-2 border-[var(--color-primary,#3B82F6)]/50 bg-[var(--color-primary,#3B82F6)]/10 px-4 py-3 min-w-[160px] shadow-lg">
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !border-2 !bg-[var(--color-primary,#3B82F6)]" />
      <div className="flex items-center gap-2">
        <span className="text-[var(--color-primary,#3B82F6)]">{ICONS[type] ?? <Mail className="w-4 h-4" />}</span>
        <span className="text-sm font-medium text-white">{data.label ?? type}</span>
      </div>
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !border-2 !bg-[var(--color-primary,#3B82F6)]" />
    </div>
  );
}

function WorkflowNodeComponent(props: { data: TriggerNodeData | ActionNodeData; type?: string }) {
  const { data, type } = props;
  if (type === 'trigger') {
    return <TriggerNodeInner data={data as TriggerNodeData} />;
  }
  if (type === 'action') {
    return <ActionNodeInner data={data as ActionNodeData} />;
  }
  return (
    <div className="rounded-lg border border-white/20 bg-[var(--background-secondary,#13131A)] px-4 py-3 min-w-[120px]">
      <Handle type="target" position={Position.Left} className="!w-2 !h-2" />
      <span className="text-sm text-white">{String((data as { label?: string }).label ?? 'Node')}</span>
      <Handle type="source" position={Position.Right} className="!w-2 !h-2" />
    </div>
  );
}

export const WorkflowNode = memo(WorkflowNodeComponent);
