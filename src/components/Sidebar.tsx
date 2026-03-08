import React from 'react';
import { NodeData } from '../data/mockData';
import { Trophy, Users } from 'lucide-react';

interface SidebarProps {
  nodes: NodeData[];
  onNodeSelect: (node: NodeData) => void;
  selectedNodeId?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ nodes, onNodeSelect, selectedNodeId }) => {
  // Helper function to safely parse follower strings to numbers for accurate sorting.
  const parseFollowers = (val: string | number | undefined): number => {
    if (val === undefined || val === null) return 0;
    if (typeof val === 'number') return val;
    
    let strVal = val.toString().trim().toUpperCase();
    let multiplier = 1;
    
    if (strVal.endsWith('M')) {
      multiplier = 1000000;
      strVal = strVal.slice(0, -1);
    } else if (strVal.endsWith('K')) {
      multiplier = 1000;
      strVal = strVal.slice(0, -1);
    }
    
    const parsed = parseFloat(strVal);
    return isNaN(parsed) ? 0 : parsed * multiplier;
  };

  const sortedNodes = [...nodes].sort((a, b) => parseFollowers(b.followers) - parseFollowers(a.followers));

  return (
    <div 
      className="bg-gradient-to-b from-blue-900/80 to-purple-900/80 backdrop-blur-md"
      style={{
      width: '320px',
      height: '100%',
      borderRight: '1px solid rgba(255,255,255,0.05)',
      display: 'flex',
      flexDirection: 'column',
      color: '#e2e8f0',
      boxShadow: '4px 0 15px rgba(0,0,0,0.5)',
      zIndex: 10,
    }}>
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'transparent'
      }}>
        <h1 className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-700 font-bold" style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="text-2xl mr-2" role="img" aria-label="blueberry">&#129744;</span>
          AI Nexus
        </h1>
        <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
          3D Interactive Influencer Graph
        </p>
      </div>

      <div style={{
        padding: '16px 20px',
        fontSize: '12px',
        fontWeight: 600,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        Top Influencers ({nodes.length})
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0 12px 20px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        {sortedNodes.map((node, index) => {
          const isSelected = selectedNodeId === node.id;
          const isTop3 = index < 3;
          
          return (
            <div
              key={node.id}
              onClick={() => onNodeSelect(node)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: isSelected ? '#1e293b' : 'transparent',
                border: `1px solid ${isSelected ? '#3b82f6' : 'transparent'}`,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.backgroundColor = '#1e293b';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div 
                className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-indigo-700 to-purple-800 text-white text-sm font-bold shadow-lg shadow-indigo-500/30"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  marginRight: '12px',
                  flexShrink: 0
                }}
              >
                {index + 1}
              </div>
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                  fontWeight: 600, 
                  fontSize: '14px', 
                  color: isSelected ? '#fff' : '#e2e8f0',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {node.name}
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  marginTop: '4px',
                  fontSize: '12px',
                  color: '#94a3b8' 
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={12} />
                    {(node.followers / 1000).toFixed(1)}k
                  </span>
                  <span style={{ 
                    padding: '2px 6px', 
                    backgroundColor: '#1e293b', 
                    borderRadius: '4px',
                    fontSize: '10px'
                  }}>
                    {node.category}
                  </span>
                </div>
              </div>
              
              {isTop3 && <Trophy size={16} color="#fbbf24" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
