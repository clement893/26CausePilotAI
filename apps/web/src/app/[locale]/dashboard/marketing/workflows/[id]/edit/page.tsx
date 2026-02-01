'use client';

/**
 * Éditeur de workflow - Étape 3.3.2
 * Canvas avec pan & zoom, déclencheurs/actions, connexion des nœuds.
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useOrganization } from '@/hooks/useOrganization';
import { getWorkflowAction } from '@/app/actions/workflows/get';
import { updateWorkflowAction } from '@/app/actions/workflows/update';
import { activateWorkflowAction } from '@/app/actions/workflows/activate';
import { WorkflowEditor } from '@/components/workflow';
import type { Node, Edge } from '@xyflow/react';
import { ChevronRight, Loader2, Power, PowerOff } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

function parseNodes(raw: unknown): Node[] {
  if (!raw || !Array.isArray(raw)) return [];
  return raw.map((n) => ({
    id: (n as { id?: string }).id ?? `node-${Math.random().toString(36).slice(2, 9)}`,
    type: (n as { type?: string }).type ?? 'action',
    position: (n as { position?: { x: number; y: number } }).position ?? { x: 0, y: 0 },
    data: (n as { data?: Record<string, unknown> }).data ?? {},
  }));
}

function parseEdges(raw: unknown): Edge[] {
  if (!raw || !Array.isArray(raw)) return [];
  return raw.map((e, i) => ({
    id: (e as { id?: string }).id ?? `edge-${i}`,
    source: (e as { source?: string }).source ?? '',
    target: (e as { target?: string }).target ?? '',
  }));
}

export default function EditWorkflowPage() {
  const params = useParams();
  const workflowId = params?.id as string;
  const { activeOrganization, isLoading: orgLoading } = useOrganization();
  const [workflow, setWorkflow] = useState<{ id: string; name: string; status: string; nodes: unknown; edges: unknown } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    if (!workflowId || workflowId === 'new' || !activeOrganization) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      const res = await getWorkflowAction(workflowId, activeOrganization.id);
      if (cancelled) return;
      if (res.error) {
        setError(res.error);
        setWorkflow(null);
      } else if (res.workflow) {
        setWorkflow(res.workflow);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [workflowId, activeOrganization?.id]);

  const handleSave = useCallback(
    async (nodes: Node[], edges: Edge[]) => {
      if (!activeOrganization || !workflowId) return;
      setSaving(true);
      setError(null);
      const serializedNodes = nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
      }));
      const serializedEdges = edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
      }));
      const res = await updateWorkflowAction(workflowId, activeOrganization.id, {
        nodes: serializedNodes,
        edges: serializedEdges,
      });
      setSaving(false);
      if (res.error) setError(res.error);
    },
    [activeOrganization?.id, workflowId]
  );

  const handleToggleActive = async () => {
    if (!activeOrganization || !workflow) return;
    setActivating(true);
    setError(null);
    const res = await activateWorkflowAction(workflow.id, activeOrganization.id, workflow.status !== 'ACTIVE');
    setActivating(false);
    if (res.error) setError(res.error);
    else setWorkflow((w) => (w ? { ...w, status: w.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE' } : null));
  };

  if (orgLoading || !activeOrganization) {
    return (
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="h-8 w-64 animate-pulse rounded bg-white/10 mb-6" />
          <div className="h-[600px] animate-pulse rounded-xl bg-white/10" />
        </div>
      </div>
    );
  }

  if (workflowId === 'new') {
    return (
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
        <div className="mx-auto max-w-6xl rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-12 text-center">
          <p className="text-[var(--text-secondary,#A0A0B0)]">Créez un workflow depuis la liste.</p>
          <Link href="/dashboard/marketing/workflows" className="mt-4 inline-block text-[var(--color-primary,#3B82F6)] hover:underline">
            Voir les workflows
          </Link>
        </div>
      </div>
    );
  }

  if (error && !workflow) {
    return (
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
        <div className="mx-auto max-w-6xl rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-12 text-center">
          <p className="text-red-400">{error}</p>
          <Link href="/dashboard/marketing/workflows" className="mt-4 inline-block text-[var(--color-primary,#3B82F6)] hover:underline">
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  if (loading || !workflow) {
    return (
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary,#3B82F6)]" />
      </div>
    );
  }

  const initialNodes = parseNodes(workflow.nodes);
  const initialEdges = parseEdges(workflow.edges);

  return (
    <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
      <div className="mx-auto max-w-[1400px]">
        <nav className="mb-4 flex items-center gap-2 text-sm text-[var(--text-secondary,#A0A0B0)]">
          <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/dashboard/marketing/workflows" className="hover:text-white">Workflows</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-white">{workflow.name}</span>
        </nav>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-white">Éditeur de workflow</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleActive}
              disabled={activating}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${workflow.status === 'ACTIVE' ? 'border-green-500/50 bg-green-500/20 text-green-400' : 'border-white/10 text-[var(--text-secondary,#A0A0B0)] hover:bg-white/5'}`}
            >
              {workflow.status === 'ACTIVE' ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
              {workflow.status === 'ACTIVE' ? 'Désactiver' : 'Activer'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {saving && (
          <p className="mb-2 text-sm text-[var(--text-secondary,#A0A0B0)]">Enregistrement…</p>
        )}

        <WorkflowEditor
          initialNodes={initialNodes}
          initialEdges={initialEdges}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
