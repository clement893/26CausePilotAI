'use client';

/**
 * WorkflowEditor - Éditeur de workflows visuel (Étape 3.3.2)
 * Canvas avec pan & zoom, panneau déclencheurs/actions, connexion des nœuds.
 */

import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  type Connection,
  type Node,
  type Edge,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { NodePalette } from './NodePalette';
import { WorkflowNode } from './WorkflowNode';

const nodeTypes = { trigger: WorkflowNode, action: WorkflowNode };

export interface WorkflowEditorProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (nodes: Node[], edges: Edge[]) => void;
}

let nodeId = 0;
function getId() {
  return `node_${++nodeId}_${Date.now()}`;
}

function WorkflowEditorInner({
  initialNodes = [],
  initialEdges = [],
  onSave,
}: WorkflowEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onAddTrigger = useCallback(
    (triggerType: string, label: string) => {
      const id = getId();
      const newNode: Node = {
        id,
        type: 'trigger',
        position: { x: 100 + nodes.length * 30, y: 100 + nodes.length * 20 },
        data: { label, triggerType } as unknown as Record<string, unknown>,
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [nodes.length, setNodes]
  );

  const onAddAction = useCallback(
    (actionType: string, label: string) => {
      const id = getId();
      const newNode: Node = {
        id,
        type: 'action',
        position: { x: 100 + nodes.length * 30, y: 200 + nodes.length * 20 },
        data: { label, actionType } as unknown as Record<string, unknown>,
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [nodes.length, setNodes]
  );

  const handleSave = useCallback(() => {
    onSave?.(nodes, edges);
  }, [nodes, edges, onSave]);

  return (
    <div className="flex h-[600px] gap-4 rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-4">
      <NodePalette onAddTrigger={onAddTrigger} onAddAction={onAddAction} />
      <div ref={reactFlowWrapper} className="flex-1 min-w-0 h-full min-h-[500px] rounded-lg border border-white/10 bg-[var(--background-primary,#0A0A0F)]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-[var(--background-primary,#0A0A0F)]"
        >
          <Background />
          <Controls className="!bottom-2 !left-2 !bg-[var(--background-secondary,#13131A)] !border-white/10" />
        </ReactFlow>
      </div>
      {onSave && (
        <div className="shrink-0">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-[var(--color-primary,#3B82F6)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Enregistrer
          </button>
        </div>
      )}
    </div>
  );
}

export function WorkflowEditor(props: WorkflowEditorProps) {
  return (
    <ReactFlowProvider>
      <WorkflowEditorInner {...props} />
    </ReactFlowProvider>
  );
}
