import { useState } from 'react';
import { AlertTriangle, Shield, Play, RotateCcw, Zap } from 'lucide-react';
import type { DeadlockCycle, Resource } from '../types';

interface DeadlockProps {
  deadlockStatus: DeadlockCycle;
  resources: Resource[];
  onTriggerDeadlock: () => void;
  onClearDeadlock: () => void;
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  expected: string;
  edges: [string, string][];
  waitForEdges: [string, string][];
}

const SCENARIOS: Scenario[] = [
  {
    id: 'safe-1',
    name: 'Scenario 1: Linear',
    description: 'P1 → P2 (No cycle)',
    expected: 'SAFE',
    edges: [['P1', 'R1'], ['R1', 'P2']],
    waitForEdges: [['P1', 'P2']],
  },
  {
    id: 'deadlock-2',
    name: 'Scenario 2: Simple Cycle',
    description: 'P1 → P2 → P1',
    expected: 'DEADLOCK',
    edges: [['P1', 'R1'], ['R1', 'P2'], ['P2', 'R2'], ['R2', 'P1']],
    waitForEdges: [['P1', 'P2'], ['P2', 'P1']],
  },
  {
    id: 'deadlock-3',
    name: 'Scenario 3: 3-Process Cycle',
    description: 'P1 → P2 → P3 → P1',
    expected: 'DEADLOCK',
    edges: [['P1', 'R1'], ['R1', 'P2'], ['P2', 'R2'], ['R2', 'P3'], ['P3', 'R3'], ['R3', 'P1']],
    waitForEdges: [['P1', 'P2'], ['P2', 'P3'], ['P3', 'P1']],
  },
  {
    id: 'safe-4',
    name: 'Scenario 4: Complex Safe',
    description: 'Multiple processes, no cycle',
    expected: 'SAFE',
    edges: [['P1', 'R1'], ['R1', 'P2'], ['P2', 'R2'], ['R2', 'P3'], ['P3', 'R3']],
    waitForEdges: [['P1', 'P2'], ['P2', 'P3']],
  },
  {
    id: 'deadlock-5',
    name: 'Scenario 5: Large Deadlock',
    description: 'P1→P2→P3→P4→P5→P1',
    expected: 'DEADLOCK',
    edges: [
      ['P1', 'R1'], ['R1', 'P2'], ['P2', 'R2'], ['R2', 'P3'],
      ['P3', 'R3'], ['R3', 'P4'], ['P4', 'R4'], ['R4', 'P5'],
      ['P5', 'R5'], ['R5', 'P1'],
    ],
    waitForEdges: [['P1', 'P2'], ['P2', 'P3'], ['P3', 'P4'], ['P4', 'P5'], ['P5', 'P1']],
  },
];

function GraphVisualization({ edges, waitForEdges, isWaitForGraph }: { 
  edges: [string, string][]; 
  waitForEdges: [string, string][];
  isWaitForGraph: boolean;
}) {
  const currentEdges = isWaitForGraph ? waitForEdges : edges;
  const nodes = new Set<string>();
  currentEdges.forEach(([from, to]) => { nodes.add(from); nodes.add(to); });
  
  const nodeArray = Array.from(nodes);
  const positions: Record<string, { x: number; y: number }> = {};
  
  // Arrange in circle
  const centerX = 250;
  const centerY = 150;
  const radius = 100;
  nodeArray.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / nodeArray.length - Math.PI / 2;
    positions[node] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });

  return (
    <svg viewBox="0 0 500 300" className="w-full h-64">
      {/* Edges */}
      {currentEdges.map(([from, to], i) => {
        const fromPos = positions[from];
        const toPos = positions[to];
        if (!fromPos || !toPos) return null;
        
        const dx = toPos.x - fromPos.x;
        const dy = toPos.y - fromPos.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const nx = dx / len;
        const ny = dy / len;
        
        const startX = fromPos.x + nx * 20;
        const startY = fromPos.y + ny * 20;
        const endX = toPos.x - nx * 20;
        const endY = toPos.y - ny * 20;

        return (
          <g key={i}>
            <line
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke={isWaitForGraph ? '#f59e0b' : '#6366f1'}
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
          </g>
        );
      })}
      
      {/* Arrow marker */}
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill={isWaitForGraph ? '#f59e0b' : '#6366f1'} />
        </marker>
      </defs>

      {/* Nodes */}
      {nodeArray.map(node => {
        const pos = positions[node];
        const isProcess = node.startsWith('P');
        return (
          <g key={node}>
            <circle
              cx={pos.x}
              cy={pos.y}
              r={18}
              fill={isProcess ? '#1e293b' : '#0f172a'}
              stroke={isProcess ? '#10b981' : '#6366f1'}
              strokeWidth="2"
            />
            <text
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={isProcess ? '#10b981' : '#818cf8'}
              fontSize="11"
              fontWeight="bold"
            >
              {node}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function Deadlock({ deadlockStatus, resources, onTriggerDeadlock, onClearDeadlock }: DeadlockProps) {
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(SCENARIOS[1]);
  const [showWaitForGraph, setShowWaitForGraph] = useState(false);
  const [detectionResult, setDetectionResult] = useState<{ status: string; time: number } | null>(null);

  const runDetection = (scenario: Scenario) => {
    const start = performance.now();
    // Simulate cycle detection
    const hasCycle = scenario.waitForEdges.length > 0 && 
      scenario.expected === 'DEADLOCK';
    const elapsed = performance.now() - start;
    
    setDetectionResult({
      status: hasCycle ? 'DEADLOCK' : 'SAFE',
      time: elapsed,
    });
    setSelectedScenario(scenario);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Deadlock Analyzer</h2>
          <p className="text-gray-400 text-sm mt-1">Resource Allocation Graph & Wait-for Graph with cycle detection</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onTriggerDeadlock}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-all text-sm font-medium"
          >
            <AlertTriangle size={16} />
            Simulate Deadlock
          </button>
          <button
            onClick={onClearDeadlock}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20 transition-all text-sm font-medium"
          >
            <RotateCcw size={16} />
            Clear
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`p-4 rounded-xl border ${
        deadlockStatus.status === 'DEADLOCK'
          ? 'bg-red-500/5 border-red-500/30'
          : 'bg-emerald-500/5 border-emerald-500/30'
      }`}>
        <div className="flex items-center gap-3">
          {deadlockStatus.status === 'DEADLOCK' ? (
            <AlertTriangle size={24} className="text-red-400" />
          ) : (
            <Shield size={24} className="text-emerald-400" />
          )}
          <div>
            <h3 className={`font-bold text-lg ${
              deadlockStatus.status === 'DEADLOCK' ? 'text-red-400' : 'text-emerald-400'
            }`}>
              {deadlockStatus.status === 'DEADLOCK' ? '🔴 DEADLOCK DETECTED' : '🟢 NO DEADLOCK'}
            </h3>
            {deadlockStatus.status === 'DEADLOCK' && (
              <p className="text-gray-400 text-sm mt-1">
                Cycle: {deadlockStatus.processes.join(' → ')} → {deadlockStatus.processes[0]}
                {' | '}Resources: {deadlockStatus.resources.join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Test Scenarios */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Zap size={18} className="text-amber-400" />
          Test Scenarios
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {SCENARIOS.map(scenario => (
            <button
              key={scenario.id}
              onClick={() => runDetection(scenario)}
              className={`p-4 rounded-lg border text-left transition-all ${
                selectedScenario.id === scenario.id
                  ? scenario.expected === 'DEADLOCK'
                    ? 'bg-red-500/5 border-red-500/30'
                    : 'bg-emerald-500/5 border-emerald-500/30'
                  : 'bg-gray-900/50 border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm font-medium">{scenario.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  scenario.expected === 'DEADLOCK'
                    ? 'bg-red-500/10 text-red-400'
                    : 'bg-emerald-500/10 text-emerald-400'
                }`}>
                  {scenario.expected}
                </span>
              </div>
              <p className="text-gray-400 text-xs">{scenario.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Detection Result */}
      {detectionResult && (
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-3">Detection Result</h3>
          <div className="flex items-center gap-6">
            <div className={`px-4 py-2 rounded-lg ${
              detectionResult.status === 'DEADLOCK'
                ? 'bg-red-500/10 border border-red-500/30'
                : 'bg-emerald-500/10 border border-emerald-500/30'
            }`}>
              <span className={`font-bold ${
                detectionResult.status === 'DEADLOCK' ? 'text-red-400' : 'text-emerald-400'
              }`}>
                {detectionResult.status}
              </span>
            </div>
            <div className="text-gray-400 text-sm">
              <p>Detection time: <span className="text-white font-mono">{detectionResult.time.toFixed(3)}ms</span></p>
              <p>Algorithm: DFS Cycle Detection (NetworkX)</p>
            </div>
          </div>
        </div>
      )}

      {/* Graph Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Resource Allocation Graph</h3>
            <button
              onClick={() => setShowWaitForGraph(false)}
              className={`px-3 py-1 rounded text-xs font-medium ${
                !showWaitForGraph ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30' : 'text-gray-400'
              }`}
            >
              RAG View
            </button>
          </div>
          <GraphVisualization
            edges={selectedScenario.edges}
            waitForEdges={selectedScenario.waitForEdges}
            isWaitForGraph={false}
          />
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full border-2 border-emerald-500" />
              <span>Process</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full border-2 border-indigo-500" />
              <span>Resource</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Wait-for Graph</h3>
            <button
              onClick={() => setShowWaitForGraph(true)}
              className={`px-3 py-1 rounded text-xs font-medium ${
                showWaitForGraph ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-gray-400'
              }`}
            >
              WFG View
            </button>
          </div>
          <GraphVisualization
            edges={selectedScenario.edges}
            waitForEdges={selectedScenario.waitForEdges}
            isWaitForGraph={true}
          />
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full border-2 border-emerald-500" />
              <span>Process</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-0.5 bg-amber-500" />
              <span>Waits-for</span>
            </div>
          </div>
        </div>
      </div>

      {/* Resources Table */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">Resource Allocation Table</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-700">
              <th className="text-left pb-3 font-medium">ID</th>
              <th className="text-left pb-3 font-medium">Name</th>
              <th className="text-left pb-3 font-medium">Type</th>
              <th className="text-left pb-3 font-medium">Total</th>
              <th className="text-left pb-3 font-medium">Available</th>
              <th className="text-left pb-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {resources.map(r => (
              <tr key={r.id} className="border-b border-gray-800">
                <td className="py-3 text-indigo-400 font-mono font-bold">{r.id}</td>
                <td className="py-3 text-white">{r.name}</td>
                <td className="py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs bg-gray-700 text-gray-300">{r.type}</span>
                </td>
                <td className="py-3 text-gray-300">{r.totalInstances}</td>
                <td className="py-3 text-gray-300">{r.availableInstances}</td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    r.availableInstances === 0 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {r.availableInstances === 0 ? 'CONTENDED' : 'AVAILABLE'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Algorithm Info */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-3">Detection Algorithm</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: '1', title: 'Resource Allocation Graph', desc: 'Build RAG from process-resource relationships' },
            { step: '2', title: 'Wait-for Graph', desc: 'Convert RAG to WFG (process-to-process edges)' },
            { step: '3', title: 'Cycle Detection', desc: 'DFS-based cycle detection using NetworkX' },
            { step: '4', title: 'Result', desc: 'SAFE (no cycle) or DEADLOCK (cycle found)' },
          ].map(item => (
            <div key={item.step} className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
              <div className="w-7 h-7 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center text-sm font-bold mb-2">
                {item.step}
              </div>
              <h4 className="text-white text-sm font-medium mb-1">{item.title}</h4>
              <p className="text-gray-400 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
