import { useMemo } from 'react';
import { Link2, MoveRight } from 'lucide-react';

import type { WorkflowEdgeViewModel, WorkflowNodeViewModel } from '../../types';

interface WorkflowCanvasProps {
  nodes: WorkflowNodeViewModel[];
  edges: WorkflowEdgeViewModel[];
}

type PositionedNode = WorkflowNodeViewModel & {
  layoutX: number;
  layoutY: number;
};

const NODE_WIDTH = 220;
const NODE_HEIGHT = 92;
const CANVAS_PADDING = 48;

function layoutNodes(nodes: WorkflowNodeViewModel[]): PositionedNode[] {
  const nodesWithPosition = nodes.every((node) => node.position);

  if (nodesWithPosition) {
    const minX = Math.min(...nodes.map((node) => node.position?.x ?? 0));
    const minY = Math.min(...nodes.map((node) => node.position?.y ?? 0));

    return nodes.map((node) => ({
      ...node,
      layoutX: (node.position?.x ?? 0) - minX + CANVAS_PADDING,
      layoutY: (node.position?.y ?? 0) - minY + CANVAS_PADDING,
    }));
  }

  return nodes.map((node, index) => ({
    ...node,
    layoutX: CANVAS_PADDING + index * (NODE_WIDTH + 80),
    layoutY: CANVAS_PADDING + (index % 2) * 120,
  }));
}

function getEdgePath(source: PositionedNode, target: PositionedNode) {
  const startX = source.layoutX + NODE_WIDTH;
  const startY = source.layoutY + NODE_HEIGHT / 2;
  const endX = target.layoutX;
  const endY = target.layoutY + NODE_HEIGHT / 2;
  const midX = startX + (endX - startX) / 2;

  return `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
}

export function WorkflowCanvas({ nodes, edges }: WorkflowCanvasProps) {
  const positionedNodes = useMemo(() => layoutNodes(nodes), [nodes]);
  const nodeById = useMemo(
    () => new Map(positionedNodes.map((node) => [node.id, node])),
    [positionedNodes],
  );

  const width = Math.max(...positionedNodes.map((node) => node.layoutX + NODE_WIDTH), 960) + CANVAS_PADDING;
  const height = Math.max(...positionedNodes.map((node) => node.layoutY + NODE_HEIGHT), 360) + CANVAS_PADDING;

  return (
    <div className="rounded-2xl border border-surface-variant bg-[#0f1117] p-4 shadow-sm overflow-auto">
      <div className="relative min-w-[720px]" style={{ width, height }}>
        <svg width={width} height={height} className="absolute pointer-events-none">
          <defs>
            <pattern id="workflow-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width={width} height={height} fill="url(#workflow-grid)" rx="16" />

          {edges.map((edge) => {
            const source = nodeById.get(edge.sourceNodeId);
            const target = nodeById.get(edge.targetNodeId);
            if (!source || !target) {
              return null;
            }

            const labelX = source.layoutX + (target.layoutX - source.layoutX) / 2 + NODE_WIDTH / 2;
            const labelY = source.layoutY + (target.layoutY - source.layoutY) / 2 + NODE_HEIGHT / 2 - 14;

            return (
              <g key={edge.id}>
                <path
                  d={getEdgePath(source, target)}
                  stroke="rgba(105, 194, 255, 0.45)"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
                {edge.label && (
                  <g transform={`translate(${labelX}, ${labelY})`}>
                    <rect x="-28" y="-12" width="56" height="24" rx="12" fill="rgba(15,17,23,0.92)" stroke="rgba(255,255,255,0.12)" />
                    <text textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.82)" fontSize="11" fontWeight="700">
                      {edge.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        <div className="relative">
          {positionedNodes.map((node) => (
            <div
              key={node.id}
              className="absolute rounded-2xl border border-white/10 bg-[#1a1f2b] text-white shadow-[0_16px_40px_rgba(0,0,0,0.3)]"
              style={{
                left: node.layoutX,
                top: node.layoutY,
                width: NODE_WIDTH,
                minHeight: NODE_HEIGHT,
              }}
            >
              <div className="border-b border-white/10 px-4 py-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-[#273245] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9ed1ff]">
                    {node.type.replace('_', ' ')}
                  </span>
                  <Link2 size={14} className="text-white/35" />
                </div>
                <div className="text-sm font-semibold leading-5">{node.label}</div>
              </div>

              <div className="px-4 py-3 text-xs text-white/65">
                <div className="mb-1 line-clamp-2">{node.technicalType}</div>
                {node.detail && <div className="font-medium text-white/80">{node.detail}</div>}
              </div>

              <div className="absolute -right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#121722] text-white/40">
                <MoveRight size={12} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
