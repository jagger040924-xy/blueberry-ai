import React, { useRef, useEffect, useState, useCallback } from 'react';
import ForceGraph3D, { ForceGraphMethods } from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';
import * as THREE from 'three';
import { GraphData, NodeData } from '../data/mockData';

interface Graph3DProps {
  data: GraphData;
  onNodeClick: (node: NodeData) => void;
  selectedNodeId?: string;
}



const Graph3D: React.FC<Graph3DProps> = ({ data, onNodeClick, selectedNodeId }) => {
  const fgRef = useRef<ForceGraphMethods | undefined>();
  const [dimensions, setDimensions] = useState({ width: window.innerWidth - 320, height: window.innerHeight });
  const spritesRef = useRef(new Map<string, { sprite: any, outline: any }>());
  const [graphData, setGraphData] = useState({ nodes: [] as NodeData[], links: [] as any[] });
  const [prevNodeCount, setPrevNodeCount] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth - 320,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Format data once & Trigger zoomToFit on Expansion
  useEffect(() => {
    if (!data || !data.nodes) return;

    // 找出排名前 5 的节点
    const sortedNodes = [...data.nodes].sort((a, b) => (b.followers || 0) - (a.followers || 0));
    const top5Ids = new Set(sortedNodes.slice(0, 5).map(n => n.id));

    const formattedNodes = data.nodes.map(node => {
      const isTop5 = top5Ids.has(node.id);
      // Top 5 极其耀眼的视觉设定，普通节点使用紫色背景板
      const color = isTop5 ? '#00F0FF' : '#A855F7';
      
      // 硬编码节点大小，防止绝对值导致体积无限膨胀变成巨大气球
      const radius = isTop5 ? 8 : 3;
      
      return { ...node, radius, visualColor: color };
    });
    setGraphData({ nodes: formattedNodes, links: data.links });

    // Expand scaling logic: if data expanded and engine is ready
    if (data.nodes.length > prevNodeCount && prevNodeCount > 0 && fgRef.current) {
      setTimeout(() => {
        fgRef.current?.zoomToFit(1000, 50);
      }, 300); // 延迟等待物理引擎将新节点推开
    }
    setPrevNodeCount(data.nodes.length);
  }, [data]);

  // Adjust Gravity & Force Parameters
  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      // 1. 恢复完美的物理引力 (Physics Tuning):
      
      // 增强排斥力 (Charge)：必须把节点推开，防止名字和球体挤在一起。
      fgRef.current.d3Force('charge')?.strength(-400);
      
      // 加长连线距离 (Link)：给节点留出呼吸空间。
      fgRef.current.d3Force('link')?.distance(120);

      // Center force 确保所有节点微微向中心聚拢，但不挤在一起
      fgRef.current.d3Force('center')?.strength(0.05);
      
      // (关键) 重新激活引擎：设置完力学参数后，请确保调用了
      fgRef.current.d3ReheatSimulation();
    }
  }, [graphData.nodes.length]);

  // 【修复点 1】：相机焦点计算不再除以 0，并且实现平滑飞行而不锁定相机
  useEffect(() => {
    if (!selectedNodeId || !fgRef.current || graphData.nodes.length === 0) return;

    const node = graphData.nodes.find(n => n.id === selectedNodeId);
    // 确保节点确实已经有了 3D 坐标 (x,y,z)
    if (node && (node as any).x !== undefined) {
      const distance = 150;
      const dist = Math.hypot((node as any).x, (node as any).y, (node as any).z);
      // 防止除以 0 导致 Infinity
      const distRatio = 1 + distance / (dist === 0 ? 1 : dist);

      const targetPos = { 
        x: (node as any).x * distRatio, 
        y: (node as any).y * distRatio, 
        z: (node as any).z * distRatio 
      };

      // 1000ms 的平滑飞行，且 lookAt 直接对准节点本身释放镜头控制权，用户后续仍然可缩放
      fgRef.current.cameraPosition(targetPos, node as any, 1000);
    }
  }, [selectedNodeId, graphData.nodes]);

  const renderNode = useCallback((node: any) => {
    // 默认回退值为 3，预防未携带 radius 的属性
    const radius = node.radius || 3;

    const sprite = new SpriteText(node.name || "");
    sprite.color = 'rgba(255, 255, 255, 0.9)'; // 纯净的白色
    sprite.textHeight = 4; // 精巧的尺寸
    sprite.fontWeight = 'normal';
    sprite.center.set(0.5, 0);
    // 关键：名字绝对不能和原来的球体重叠。将其悬浮在星球正上方
    sprite.position.y = radius + 4; // 动态向上偏移量

    spritesRef.current.set(node.id, { sprite, outline: null });
    return sprite;
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', background: 'transparent', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10, pointerEvents: 'none' }}>
        <p style={{ color: '#4A90E2', fontSize: '13px', margin: 0, textAlign: 'right', opacity: 0.7 }}>
          Left Click: Rotate • Scroll: Zoom • Right Click: Pan
        </p>
      </div>

      <ForceGraph3D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel=""
        nodeVal={(node: any) => node.radius}
        nodeColor={(node: any) => node.visualColor}
        nodeThreeObjectExtend={true} // 开启节点拓展渲染，不破坏现有球体
        nodeThreeObject={renderNode}

        linkColor={(link: any) => {
          if (selectedNodeId != null) {
            const sId = typeof link.source === 'object' ? link.source?.id : link.source;
            const tId = typeof link.target === 'object' ? link.target?.id : link.target;
            if (sId === selectedNodeId || tId === selectedNodeId) return '#00F0FF'; // Highlight selected link 
          }
          return '#C4B5FD'; // 极其醒目的浅电光紫色，不透明
        }}
        linkWidth={(link: any) => {
          if (selectedNodeId != null) {
            const sId = typeof link.source === 'object' ? link.source?.id : link.source;
            const tId = typeof link.target === 'object' ? link.target?.id : link.target;
            if (sId === selectedNodeId || tId === selectedNodeId) return 3;
          }
          return 2; // 确保连线在致密的星球之间像激光一样穿透出来
        }}

        enableNodeDrag={false}
        onNodeClick={(node) => {
          if (node) {
            setTimeout(() => onNodeClick(node as NodeData), 10);
          }
        }}

        // 【修复点 2】：LOD 名字显隐计算也改用正确的 graphData，不再导致文字乱飞
        onEngineTick={() => {
          if (fgRef.current && (fgRef.current as any).cameraPosition) {
            const camPos = (fgRef.current as any).cameraPosition();
            if (camPos && camPos.x !== undefined) {
              graphData.nodes.forEach((node: any) => {
                const refs = spritesRef.current.get(node.id);
                if (refs) {
                  const { sprite } = refs;
                  const isSelected = selectedNodeId != null && node.id === selectedNodeId;

                  if (isSelected) {
                    sprite.visible = true;
                  } else {
                    const distToNode = Math.hypot(
                      (node.x || 0) - camPos.x,
                      (node.y || 0) - camPos.y,
                      (node.z || 0) - camPos.z
                    );
                    // 仅在非常近的距离下（如拉近镜头时）才显示文字，保持宇宙的干净
                    sprite.visible = distToNode < 500;
                  }
                }
              });
            }
          }
        }}
        controlType="orbit"
        backgroundColor="#050505"
      />
    </div>
  );
};

export default Graph3D;