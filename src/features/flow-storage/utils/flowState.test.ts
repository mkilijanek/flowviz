import { describe, expect, it, vi } from 'vitest';
import type { Edge, Node } from 'reactflow';
import { FLOWVIZ_DATA_VERSION } from '../../../shared/config/version';
import type { SavedFlow } from '../types/SavedFlow';
import { buildLoadedFlowState, buildSavedFlow } from './flowState';

describe('flow state helpers', () => {
  it('builds a saved flow with deduplicated analysis metadata', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-10T12:00:00.000Z'));

    const nodes: Node[] = [
      {
        id: 'n1',
        type: 'action',
        position: { x: 0, y: 0 },
        data: {
          techniques: ['T1059', 'T1059'],
          tactics: ['execution', 'execution'],
        },
      },
      {
        id: 'n2',
        type: 'tool',
        position: { x: 10, y: 20 },
        data: {
          techniques: ['T1105'],
          tactics: ['command-and-control'],
        },
      },
    ];
    const edges: Edge[] = [
      { id: 'e1', source: 'n1', target: 'n2', type: 'default' },
    ];

    const flow = buildSavedFlow({
      id: 'flow-1',
      title: 'Incident',
      sourceUrl: 'https://example.com/article',
      inputMode: 'url',
      nodes,
      edges,
      viewport: { x: 1, y: 2, zoom: 0.8 },
      description: 'Exported from FlowViz',
    });

    expect(flow.metadata.version).toBe(FLOWVIZ_DATA_VERSION);
    expect(flow.metadata.nodeCount).toBe(2);
    expect(flow.metadata.edgeCount).toBe(1);
    expect(flow.analysis.extractedTechniques).toEqual(['T1059', 'T1105']);
    expect(flow.analysis.extractedTactics).toEqual(['execution', 'command-and-control']);
    expect(flow.visualization.viewport).toEqual({ x: 1, y: 2, zoom: 0.8 });

    vi.useRealTimers();
  });

  it('builds loaded flow state for URL-backed analyses', () => {
    const flow = {
      id: 'flow-2',
      title: 'URL Flow',
      sourceUrl: 'https://example.com/report',
      inputMode: 'url',
      nodes: [],
      edges: [],
      metadata: {
        createdAt: '2026-03-10T12:00:00.000Z',
        updatedAt: '2026-03-10T12:00:00.000Z',
        version: FLOWVIZ_DATA_VERSION,
        tags: [],
        nodeCount: 0,
        edgeCount: 0,
      },
      visualization: {
        viewport: { x: 5, y: 10, zoom: 1 },
      },
      analysis: {},
    } as SavedFlow;

    expect(buildLoadedFlowState(flow)).toEqual({
      loadedFlow: {
        nodes: [],
        edges: [],
        viewport: { x: 5, y: 10, zoom: 1 },
      },
      articleContent: {
        text: 'https://example.com/report',
        images: undefined,
      },
      submittedUrl: 'https://example.com/report',
      submittedText: '',
      inputMode: 'url',
    });
  });

  it('builds loaded flow state for text-backed analyses', () => {
    const flow = {
      id: 'flow-3',
      title: 'Text Flow',
      sourceText: 'incident notes',
      inputMode: 'text',
      nodes: [],
      edges: [],
      metadata: {
        createdAt: '2026-03-10T12:00:00.000Z',
        updatedAt: '2026-03-10T12:00:00.000Z',
        version: FLOWVIZ_DATA_VERSION,
        tags: [],
        nodeCount: 0,
        edgeCount: 0,
      },
      visualization: {},
      analysis: {},
    } as SavedFlow;

    expect(buildLoadedFlowState(flow)).toEqual({
      loadedFlow: {
        nodes: [],
        edges: [],
        viewport: undefined,
      },
      articleContent: {
        text: 'incident notes',
        images: undefined,
      },
      submittedUrl: '',
      submittedText: 'incident notes',
      inputMode: 'text',
    });
  });
});
