import React, { useState } from 'react';
import { X, Users, Tag, TrendingUp, Loader2 } from 'lucide-react';
import { NodeData } from '../data/mockData';

interface ProfileCardProps {
  node: NodeData;
  onClose: () => void;
  expandNetwork?: (handle: string) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ node, onClose, expandNetwork }) => {
  const [isExpanding, setIsExpanding] = useState(false);

  const handleExpand = async () => {
    if (!node.handle || !expandNetwork) return;
    setIsExpanding(true);
    await expandNetwork(node.handle);
    setIsExpanding(false);
  };

  return (
    <div style={{
      position: 'absolute',
      right: '24px',
      top: '24px',
      width: '280px',
      // Glassmorphism effect in Dark Violet
      backgroundColor: 'rgba(15, 10, 31, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(139, 92, 246, 0.2)',
      borderRadius: '16px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05) inset',
      padding: '16px',
      color: 'white',
      zIndex: 100,
      animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <style>
        {`
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(20px) scale(0.95); }
            to { opacity: 1; transform: translateX(0) scale(1); }
          }
        `}
      </style>

      {/* Header with Avatar placeholder and close button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          fontWeight: 'bold',
          color: 'white',
          boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
        }}>
          {node.name.charAt(0)}
        </div>
        
        <button 
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#cbd5e1',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
             e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
             e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
             e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
             e.currentTarget.style.color = '#cbd5e1';
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Profile Info */}
      <div>
        <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>
          {node.name}
        </h2>
        {node.handle && (
          <div style={{ color: '#64748b', fontSize: '13px', marginBottom: '8px' }}>
            {node.handle}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '12px' }}>
          <Tag size={12} />
          {node.category}
        </div>
      </div>

      {/* Bio Row */}
      {node.bio && (
        <div style={{ 
          fontSize: '12px', 
          color: '#cbd5e1', 
          lineHeight: '1.5',
          marginTop: '-4px',
          maxHeight: '60px',
          overflowY: 'auto',
          paddingRight: '4px'
        }}>
          {node.bio}
        </div>
      )}

      {/* Stats Row */}
      <div style={{ 
        display: 'flex', 
        gap: '8px',
        padding: '12px',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Users size={12} /> Followers
          </div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#f8fafc' }}>
            {(node.followers / 1000).toFixed(1)}K
          </div>
        </div>
        <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={12} /> Influence
          </div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#f8fafc' }}>
            Top {(100 - (node.followers / 10000)).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Action Button */}
      {node.handle ? (
        <a 
          href={`https://x.com/${node.handle.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginTop: '8px',
            display: 'block',
            textAlign: 'center',
            textDecoration: 'none',
            width: '100%',
            padding: '12px',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(255,255,255,0.15)',
            transition: 'transform 0.1s, boxShadow 0.2s',
            boxSizing: 'border-box'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Follow on X
        </a>
      ) : (
        <button style={{
          marginTop: '8px',
          width: '100%',
          padding: '12px',
          backgroundColor: '#ffffff',
          color: '#0f172a',
          border: 'none',
          borderRadius: '8px',
          fontSize: '15px',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(255,255,255,0.15)',
          transition: 'transform 0.1s, boxShadow 0.2s',
        }}
        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Follow
        </button>
      )}

      {/* Expand Network Button */}
      {expandNetwork && node.handle && (
        <button 
          onClick={handleExpand}
          disabled={isExpanding}
          style={{
            marginTop: '0px',
            width: '100%',
            padding: '12px',
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: isExpanding ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)',
            transition: 'transform 0.1s, boxShadow 0.2s, opacity 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            opacity: isExpanding ? 0.8 : 1
          }}
          onMouseDown={(e) => !isExpanding && (e.currentTarget.style.transform = 'scale(0.98)')}
          onMouseUp={(e) => !isExpanding && (e.currentTarget.style.transform = 'scale(1)')}
          onMouseLeave={(e) => !isExpanding && (e.currentTarget.style.transform = 'scale(1)')}
        >
          {isExpanding ? (
            <>
              <Loader2 size={18} className="spin" />
              Expanding Data...
            </>
          ) : (
            'Expand Network'
          )}
        </button>
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .spin {
            animation: spin 1s linear infinite;
          }
        `}
      </style>

    </div>
  );
};

export default ProfileCard;
