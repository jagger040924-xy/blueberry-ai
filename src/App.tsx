import React, { useState, useEffect } from 'react';
import { Info, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Graph3D from './components/Graph3D';
import ProfileCard from './components/ProfileCard';
import { NodeData, LinkData, GraphData } from './data/mockData';

function App() {
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [showModal, setShowModal] = useState(false);

  const handleNodeSelect = (node: NodeData) => {
    setSelectedNode(node);
  };

  const clearSelection = () => {
    setSelectedNode(null);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/graph/init');
        const result = await response.json();
        if (result.success && result.data) {
          setGraphData(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch initial graph data:", error);
      }
    };
    fetchInitialData();
  }, []);

  const expandNetwork = async (handle: string) => {
    try {
      const cleanHandle = handle.replace('@', '');
      const response = await fetch(`http://127.0.0.1:5000/api/graph/expand/${cleanHandle}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setGraphData(prev => {
          const existingNodeIds = new Set(prev.nodes.map(n => n.id));
          const newNodes = result.data.nodes.filter((n: NodeData) => !existingNodeIds.has(n.id));
          
          const existingLinks = new Set(prev.links.map(l => `${l.source}-${l.target}`));
          const newLinks = result.data.links.filter((l: LinkData) => !existingLinks.has(`${l.source}-${l.target}`));
          
          return {
            nodes: [...prev.nodes, ...newNodes],
            links: [...prev.links, ...newLinks]
          };
        });
      }
    } catch (error) {
      console.error(`Failed to expand network for ${handle}:`, error);
    }
  };

  return (
    <div 
      style={{ 
      display: 'flex', 
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden',
      backgroundColor: '#050505'
    }}>
      <div style={{ zIndex: 20, position: 'relative' }}>
        <Sidebar 
          nodes={graphData.nodes as unknown as NodeData[]} 
          onNodeSelect={handleNodeSelect}
          selectedNodeId={selectedNode?.id}
        />
      </div>
      
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        
        {/* Layer 1: Graph3D (Permanent Mount Background) */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
          <Graph3D 
            data={graphData as any} 
            onNodeClick={handleNodeSelect}
            selectedNodeId={selectedNode?.id}
          />
        </div>
        
        {/* Layer 2: UI Header Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '20px 30px',
          background: 'linear-gradient(180deg, rgba(1,2,20,0.8) 0%, rgba(1,2,20,0) 100%)',
          pointerEvents: 'none',
          zIndex: 10
        }}>
          <div className="absolute top-8 left-8 z-50 pointer-events-auto" style={{ display: 'flex', flexDirection: 'column', gap: '4px', pointerEvents: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ margin: 0, color: '#fff', fontSize: '24px', fontWeight: 300, letterSpacing: '1px' }}>
                Top AI <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500" style={{ fontWeight: 600 }}>Influencers</span> on X
              </h2>
              <button
                className="cursor-pointer"
                onClick={() => setShowModal(true)}
                style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#c4b5fd',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 0 10px rgba(139, 92, 246, 0.2)',
                  pointerEvents: 'auto'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(139, 92, 246, 0.5)';
                  e.currentTarget.style.color = '#e2e8f0';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 10px rgba(139, 92, 246, 0.2)';
                  e.currentTarget.style.color = '#c4b5fd';
                }}
              >
                <Info size={18} />
              </button>
            </div>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
              Visualizing influence in the AI Industry
            </p>
          </div>
        </div>

        {/* Layer 3: Profile Card Container */}
        {selectedNode && (
          <div style={{ position: 'absolute', top: 0, right: 0, zIndex: 100 }}>
            <ProfileCard 
              node={selectedNode} 
              onClose={clearSelection} 
              expandNetwork={expandNetwork}
            />
          </div>
        )}

      </div>
      {/* Geek Info Modal */}
      {showModal && (
        <div 
          onClick={() => setShowModal(false)}
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(5, 5, 5, 0.7)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '450px',
              backgroundColor: 'rgba(15, 10, 31, 0.85)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '16px',
              padding: '24px',
              color: '#e2e8f0',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05) inset',
              position: 'relative'
            }}
          >
            <button 
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'transparent', border: 'none', color: '#94a3b8',
                cursor: 'pointer', padding: '4px'
              }}
            >
              <X size={20} />
            </button>
            <h2 className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500" style={{ margin: '0 0 20px 0', fontSize: '24px', fontWeight: 700 }}>
              Welcome to AI Nexus &#129744;
            </h2>
            
            <div style={{ marginBottom: '20px' }}>
              <div className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 font-bold text-lg" style={{ marginBottom: '6px' }}>Expand Network</div>
              <div style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
                Clicking this button triggers our backend engine to dynamically scrape X (Twitter) in real-time, fetching the hard-core connections of the selected influencer and expanding your 3D universe!
              </div>
            </div>

            <div>
              <div className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 font-bold text-lg" style={{ marginBottom: '6px' }}>Influence Score</div>
              <div style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
                Not just raw followers. This is a percentile ranking (e.g., Top 95%) calculated based on the influencer&apos;s follower volume combined with their topological centrality within the current graph.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
}

export default App;
