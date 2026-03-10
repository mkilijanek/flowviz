import type { Edge, Node, Viewport } from 'reactflow';
import { FLOWVIZ_DATA_VERSION } from '../../../shared/config/version';
import type { SavedFlow } from '../types/SavedFlow';

interface BuildSavedFlowOptions {
  id?: string;
  title: string;
  sourceUrl?: string;
  sourceText?: string;
  inputMode: 'url' | 'text';
  nodes: Node[];
  edges: Edge[];
  viewport?: Viewport;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface NodeDataWithAnalysis {
  techniques?: string[];
  tactics?: string[];
}

function uniqueValues(values: string[]): string[] {
  return [...new Set(values)];
}

function extractAnalysis(nodes: Node[]): { extractedTechniques: string[]; extractedTactics: string[] } {
  const techniques: string[] = [];
  const tactics: string[] = [];

  nodes.forEach((node) => {
    const data = node.data as NodeDataWithAnalysis | undefined;

    if (data?.techniques) {
      techniques.push(...data.techniques);
    }

    if (data?.tactics) {
      tactics.push(...data.tactics);
    }
  });

  return {
    extractedTechniques: uniqueValues(techniques),
    extractedTactics: uniqueValues(tactics),
  };
}

export function buildSavedFlow({
  id,
  title,
  sourceUrl,
  sourceText,
  inputMode,
  nodes,
  edges,
  viewport,
  description,
  createdAt,
  updatedAt,
}: BuildSavedFlowOptions): SavedFlow {
  const updatedTimestamp = updatedAt || new Date().toISOString();
  const createdTimestamp = createdAt || updatedTimestamp;

  return {
    id: id || crypto.randomUUID(),
    title,
    sourceUrl,
    sourceText,
    inputMode,
    nodes,
    edges,
    metadata: {
      createdAt: createdTimestamp,
      updatedAt: updatedTimestamp,
      version: FLOWVIZ_DATA_VERSION,
      description,
      tags: [],
      nodeCount: nodes.length,
      edgeCount: edges.length,
    },
    visualization: {
      viewport,
      storyMode: { enabled: false },
    },
    analysis: extractAnalysis(nodes),
  };
}

export function buildLoadedFlowState(flow: SavedFlow) {
  const hasSourceUrl = Boolean(flow.sourceUrl);
  const hasSourceText = Boolean(flow.sourceText);

  return {
    loadedFlow: {
      nodes: flow.nodes,
      edges: flow.edges,
      viewport: flow.visualization?.viewport,
    },
    articleContent: {
      text: flow.sourceText || flow.sourceUrl || 'Loaded from saved flow',
      images: undefined,
    },
    submittedUrl: hasSourceUrl ? flow.sourceUrl || '' : '',
    submittedText: hasSourceText && !hasSourceUrl ? flow.sourceText || '' : '',
    inputMode: hasSourceUrl ? 'url' : hasSourceText ? 'text' : flow.inputMode,
  };
}
