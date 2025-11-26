/**
 * Dependency Graph Component
 * 
 * Interactive D3.js visualization of ABAP code dependencies
 * Implements Requirement 6.3: render interactive D3.js visualization with zoom, pan, and filtering
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, ZoomIn, ZoomOut, Maximize2, Search } from 'lucide-react';

interface DependencyNode {
  id: string;
  name: string;
  type: string;
  module: string;
  linesOfCode: number;
  dependencies?: string[];
}

interface DependencyLink {
  source: string;
  target: string;
  type: 'calls' | 'uses' | 'includes';
}

interface DependencyGraphData {
  nodes: DependencyNode[];
  links: DependencyLink[];
}

interface DependencyGraphProps {
  data?: DependencyGraphData;
  onNodeClick?: (node: DependencyNode) => void;
}

export function DependencyGraph({ data, onNodeClick }: DependencyGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [loading, setLoading] = useState(!data);
  const [graphData, setGraphData] = useState<DependencyGraphData | null>(data || null);
  const [selectedNode, setSelectedNode] = useState<DependencyNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (!data) {
      loadDependencyData();
    }
  }, [data]);

  useEffect(() => {
    if (graphData && svgRef.current) {
      renderGraph();
    }
  }, [graphData, searchQuery]);

  const loadDependencyData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/intelligence/dependencies');
      if (response.ok) {
        const result = await response.json();
        setGraphData(result.data);
      }
    } catch (error) {
      console.error('Error loading dependency data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderGraph = () => {
    if (!svgRef.current || !graphData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Filter nodes based on search
    const filteredNodes = searchQuery
      ? graphData.nodes.filter(n => 
          n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.module.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : graphData.nodes;

    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = graphData.links.filter(
      l => filteredNodeIds.has(l.source) && filteredNodeIds.has(l.target)
    );

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom);

    const g = svg.append('g');

    // Create force simulation
    const simulation = d3.forceSimulation(filteredNodes as any)
      .force('link', d3.forceLink(filteredLinks)
        .id((d: any) => d.id)
        .distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));

    // Create arrow markers for links
    svg.append('defs').selectAll('marker')
      .data(['calls', 'uses', 'includes'])
      .enter().append('marker')
      .attr('id', d => `arrow-${d}`)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', d => {
        if (d === 'calls') return '#FF6B35';
        if (d === 'uses') return '#a78bfa';
        return '#10B981';
      });

    // Create links
    const link = g.append('g')
      .selectAll('line')
      .data(filteredLinks)
      .enter().append('line')
      .attr('stroke', d => {
        if (d.type === 'calls') return '#FF6B35';
        if (d.type === 'uses') return '#a78bfa';
        return '#10B981';
      })
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2)
      .attr('marker-end', d => `url(#arrow-${d.type})`);

    // Create nodes
    const node = g.append('g')
      .selectAll('g')
      .data(filteredNodes)
      .enter().append('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    // Add tombstone-shaped nodes (rectangles with rounded tops)
    node.append('rect')
      .attr('width', 60)
      .attr('height', 80)
      .attr('x', -30)
      .attr('y', -40)
      .attr('rx', 30)
      .attr('ry', 30)
      .attr('fill', d => {
        if (d.module === 'SD') return '#FF6B35';
        if (d.module === 'MM') return '#a78bfa';
        if (d.module === 'FI') return '#10B981';
        if (d.module === 'CO') return '#F59E0B';
        return '#6B7280';
      })
      .attr('fill-opacity', 0.8)
      .attr('stroke', '#F7F7FF')
      .attr('stroke-width', 2)
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d);
        if (onNodeClick) onNodeClick(d);
      })
      .on('mouseover', function() {
        d3.select(this)
          .attr('stroke-width', 4)
          .attr('filter', 'drop-shadow(0 0 10px rgba(255, 107, 53, 0.8))');
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('stroke-width', 2)
          .attr('filter', 'none');
      });

    // Add node labels
    node.append('text')
      .text(d => d.name.length > 10 ? d.name.substring(0, 10) + '...' : d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .attr('fill', '#F7F7FF')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('pointer-events', 'none');

    // Add module badge
    node.append('text')
      .text(d => d.module)
      .attr('text-anchor', 'middle')
      .attr('dy', -25)
      .attr('fill', '#F7F7FF')
      .attr('font-size', '8px')
      .attr('pointer-events', 'none');

    // Add LOC indicator
    node.append('text')
      .text(d => `${d.linesOfCode} LOC`)
      .attr('text-anchor', 'middle')
      .attr('dy', 30)
      .attr('fill', '#a78bfa')
      .attr('font-size', '8px')
      .attr('pointer-events', 'none');

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
  };

  const handleZoomIn = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().call(
        d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
        1.3
      );
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().call(
        d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
        0.7
      );
    }
  };

  const handleReset = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().call(
        d3.zoom<SVGSVGElement, unknown>().transform as any,
        d3.zoomIdentity
      );
    }
  };

  if (loading) {
    return (
      <Card className="border-2 border-[#5b21b6] bg-[#2e1065]/20">
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-[#FF6B35] mb-4" />
            <p className="text-[#a78bfa]">Loading dependency graph...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-[#5b21b6] bg-[#2e1065]/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[#FF6B35] text-2xl flex items-center gap-2">
              <span>🕸️</span>
              Dependency Graph
            </CardTitle>
            <CardDescription className="text-[#a78bfa]">
              Interactive visualization of ABAP code dependencies
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              className="border-[#5b21b6] text-[#a78bfa]"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              className="border-[#5b21b6] text-[#a78bfa]"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="border-[#5b21b6] text-[#a78bfa]"
              title="Reset View"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Badge variant="outline" className="bg-[#2e1065]/50 text-[#a78bfa] border-[#5b21b6]">
              Zoom: {Math.round(zoomLevel * 100)}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#a78bfa]" />
            <Input
              placeholder="Search nodes by name or module..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#2e1065]/30 border-[#5b21b6] text-[#F7F7FF] placeholder:text-[#a78bfa]"
            />
          </div>
          {searchQuery && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="border-[#5b21b6] text-[#a78bfa]"
            >
              Clear
            </Button>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#FF6B35]"></div>
            <span className="text-[#a78bfa]">SD Module</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#a78bfa]"></div>
            <span className="text-[#a78bfa]">MM Module</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#10B981]"></div>
            <span className="text-[#a78bfa]">FI Module</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#F59E0B]"></div>
            <span className="text-[#a78bfa]">CO Module</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-[#FF6B35]"></div>
            <span className="text-[#a78bfa]">Calls</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-[#a78bfa]"></div>
            <span className="text-[#a78bfa]">Uses</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-[#10B981]"></div>
            <span className="text-[#a78bfa]">Includes</span>
          </div>
        </div>

        {/* Graph SVG */}
        <div className="relative border-2 border-[#5b21b6] rounded-lg bg-[#1a0f2e]/50 overflow-hidden">
          <svg
            ref={svgRef}
            className="w-full"
            style={{ height: '600px' }}
          />
        </div>

        {/* Selected Node Details */}
        {selectedNode && (
          <Card className="border border-[#5b21b6] bg-[#1a0f2e]/50">
            <CardHeader>
              <CardTitle className="text-[#FF6B35] text-lg">
                Selected: {selectedNode.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[#a78bfa]">Type:</span>
                  <span className="ml-2 text-[#F7F7FF]">{selectedNode.type}</span>
                </div>
                <div>
                  <span className="text-[#a78bfa]">Module:</span>
                  <span className="ml-2 text-[#F7F7FF]">{selectedNode.module}</span>
                </div>
                <div>
                  <span className="text-[#a78bfa]">Lines of Code:</span>
                  <span className="ml-2 text-[#F7F7FF]">{selectedNode.linesOfCode}</span>
                </div>
                <div>
                  <span className="text-[#a78bfa]">Dependencies:</span>
                  <span className="ml-2 text-[#F7F7FF]">
                    {selectedNode.dependencies?.length || 0}
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                className="w-full bg-[#FF6B35] hover:bg-[#E85A2A] text-[#F7F7FF]"
                onClick={() => setSelectedNode(null)}
              >
                Close Details
              </Button>
            </CardContent>
          </Card>
        )}

        {(!graphData || graphData.nodes.length === 0) && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🕸️</div>
            <p className="text-[#a78bfa] text-lg">
              No dependency data available
            </p>
            <p className="text-[#a78bfa] text-sm mt-2">
              Upload ABAP files to visualize dependencies
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
