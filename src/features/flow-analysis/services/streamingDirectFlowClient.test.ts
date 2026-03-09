import { describe, expect, it, vi } from 'vitest';
import { StreamingDirectFlowClient } from './streamingDirectFlowClient';

describe('StreamingDirectFlowClient', () => {
  it('emits edges from final JSON when they were not parsed during streaming', () => {
    const client = new StreamingDirectFlowClient();
    const onNode = vi.fn();
    const onEdge = vi.fn();

    (client as any).parseAndEmitAllNodes(
      JSON.stringify({
        nodes: [
          { id: 'action-1', type: 'action', data: { name: 'Initial Access' } },
          { id: 'tool-1', type: 'tool', data: { name: 'PowerShell' } },
        ],
        edges: [
          { id: 'edge-1', source: 'action-1', target: 'tool-1', label: 'Uses' },
        ],
      }),
      {
        onNode,
        onEdge,
        onComplete: vi.fn(),
        onError: vi.fn(),
      }
    );

    expect(onNode).toHaveBeenCalledTimes(2);
    expect(onEdge).toHaveBeenCalledTimes(1);
    expect(onEdge).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'edge-1',
        source: 'action-1',
        target: 'tool-1',
        label: 'Uses',
      })
    );
  });

  it('resets parser state between streaming sessions', () => {
    const client = new StreamingDirectFlowClient();
    const callbacks = {
      onNode: vi.fn(),
      onEdge: vi.fn(),
      onComplete: vi.fn(),
      onError: vi.fn(),
    };

    (client as any).processedNodeIds.add('stale-node');
    (client as any).processedEdgeIds.add('stale-edge');
    (client as any).pendingEdges.push({ edge: { id: 'edge-stale' }, source: 'a', target: 'b' });
    (client as any).emittedNodeIds.add('stale-node');
    (client as any).resetState();

    (client as any).parseAndEmitAllNodes(
      JSON.stringify({
        nodes: [{ id: 'fresh-node', type: 'action', data: { name: 'Fresh' } }],
        edges: [],
      }),
      callbacks
    );

    expect(callbacks.onNode).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'fresh-node' })
    );
    expect((client as any).processedNodeIds.has('stale-node')).toBe(false);
    expect((client as any).processedEdgeIds.has('stale-edge')).toBe(false);
  });
});
