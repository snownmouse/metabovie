
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Pathway, Node, Link, NodeType, Language } from '../../types';
import { LINK_COLOR_ACTIVE, LINK_COLOR_DEFAULT, LINK_COLOR_INHIBITED, NODE_COLOR_METABOLITE, NODE_RADIUS, MITO_BG_COLOR, MITO_STROKE_COLOR, STAR_COLOR, CYTO_BG_COLOR, CYTO_STROKE_COLOR } from '../../constants';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  data: Pathway;
  language: Language;
  highlightStep?: number;
  isEducationMode?: boolean;
  quizConfig?: { hideMetabolites: boolean; hideEnzymes: boolean };
}

// Extend Node type internally to handle simulation properties
interface SimNode extends Node {
  targetX?: number;
  targetY?: number;
  x: number;
  y: number;
}

const PathwayGraph: React.FC<Props> = ({ data, language, highlightStep, isEducationMode, quizConfig }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; content: string } | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !data) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const zoomGroup = svg.append("g");
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        zoomGroup.attr("transform", event.transform);
      });
    svg.call(zoom);

    // Layout Calculation
    // MODIFY: Initialize nodes with 'target' positions instead of 'fixed' positions
    // This allows the physics engine to resolve collisions while keeping the general layout.
    const nodes: any[] = data.nodes.map(n => ({
      ...n,
      targetX: n.fx, // Store the textbook coordinate as a target
      targetY: n.fy,
      x: n.fx || 0,  // Start at that position
      y: n.fy || 0,
      fx: undefined, // Release the pin so physics can move it
      fy: undefined
    }));
    
    const links: any[] = data.links.map(l => ({ ...l }));

    const drawCompartment = (compartmentType: 'cytosol' | 'mitochondria', bgColor: string, strokeColor: string, labelKey: string) => {
      const targetNodes = nodes.filter(n => n.compartment === compartmentType);
      if (targetNodes.length > 0) {
        // Use targetX/targetY for the background box so it stays stable relative to the intended layout
        const xExtent = d3.extent(targetNodes, d => d.targetX || d.x || 0) as [number, number];
        const yExtent = d3.extent(targetNodes, d => d.targetY || d.y || 0) as [number, number];
        
        if (xExtent[0] !== undefined) {
          const padding = 80; // Increased padding
          zoomGroup.append("rect")
            .attr("x", xExtent[0] - padding)
            .attr("y", yExtent[0] - padding)
            .attr("width", xExtent[1] - xExtent[0] + padding * 2)
            .attr("height", yExtent[1] - yExtent[0] + padding * 2)
            .attr("rx", 30) // Rounded corners
            .attr("fill", bgColor)
            .attr("stroke", strokeColor)
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", compartmentType === 'mitochondria' ? "10,5" : "0")
            .attr("opacity", 0.6);
          
          zoomGroup.append("text")
            .attr("x", compartmentType === 'cytosol' ? xExtent[0] - padding + 15 : xExtent[1] + padding - 15)
            .attr("y", yExtent[0] - padding + 25)
            .attr("text-anchor", compartmentType === 'cytosol' ? "start" : "end")
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .attr("fill", strokeColor)
            .text(t(labelKey));
        }
      }
    };

    // --- 1. Draw Compartments (Backgrounds) ---
    drawCompartment('cytosol', CYTO_BG_COLOR, CYTO_STROKE_COLOR, 'compartment.cytosol');
    drawCompartment('mitochondria', MITO_BG_COLOR, MITO_STROKE_COLOR, 'compartment.mitochondria');
    
    // Center layout logic
    const boundsX = d3.extent(nodes, d => d.targetX || 0) as [number, number];
    const boundsY = d3.extent(nodes, d => d.targetY || 0) as [number, number];
    
    if (boundsX[0] !== undefined && boundsY[0] !== undefined) {
       const midX = (boundsX[0] + boundsX[1]) / 2;
       const midY = (boundsY[0] + boundsY[1]) / 2;
       const scale = nodes.length > 30 ? 0.45 : 0.7; 
       svg.call(zoom.transform, d3.zoomIdentity.translate(width/2, height/2).scale(scale).translate(-midX, -midY));
    }

    const defs = svg.append("defs");
    // Standard Arrow
    defs.append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", NODE_RADIUS + 8)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", LINK_COLOR_DEFAULT);
      
    // Reverse Arrow for Bidirectional
    defs.append("marker")
      .attr("id", "arrowhead-reverse")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", -NODE_RADIUS - 8)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,5L-10,0L0,-5") // Points backwards
      .attr("fill", LINK_COLOR_DEFAULT);

    // Active Arrow
    defs.append("marker")
      .attr("id", "arrowhead-active")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", NODE_RADIUS + 8)
      .attr("refY", 0)
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", LINK_COLOR_ACTIVE);

    // Simulation Setup
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).strength(0)) 
      .force("charge", d3.forceManyBody().strength(-300)) // Stronger repulsion
      .force("collide", d3.forceCollide().radius(NODE_RADIUS * 2.2).strength(1)) // Ensure separation
      .force("x", d3.forceX((d: any) => d.targetX || 0).strength(0.3)) // Pull back to textbook X
      .force("y", d3.forceY((d: any) => d.targetY || 0).strength(0.3)); // Pull back to textbook Y

    const linkGroup = zoomGroup.append("g").attr("class", "links");
    
    // Links
    const link = linkGroup.selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke-width", (d: any) => 3 + (d.flux * 2))
      .attr("stroke", (d: any) => {
        if (highlightStep !== undefined) {
           const index = data.links.findIndex(l => l.id === d.id);
           return index === highlightStep ? LINK_COLOR_ACTIVE : '#cbd5e1';
        }
        if (d.flux < 0.2) return LINK_COLOR_INHIBITED;
        return d.flux > 1.2 ? LINK_COLOR_ACTIVE : LINK_COLOR_DEFAULT;
      })
      .attr("opacity", (d: any) => d.flux < 0.1 ? 0.2 : 1)
      .attr("marker-end", (d: any) => {
        if (highlightStep !== undefined) {
          const index = data.links.findIndex(l => l.id === d.id);
          return index === highlightStep ? "url(#arrowhead-active)" : "url(#arrowhead)";
        }
        return d.flux > 1.2 ? "url(#arrowhead-active)" : "url(#arrowhead)";
      })
      .attr("marker-start", (d: any) => {
        return (d.isReversible || d.enzymeReverse) ? "url(#arrowhead-reverse)" : null;
      });

    // Label Group
    const labelGroup = zoomGroup.append("g").attr("class", "labels");
    const linkLabels = labelGroup.selectAll("g")
      .data(links)
      .enter().append("g");

    // 1. Forward Enzyme (Above line)
    linkLabels.append("text")
      .text((d: any) => {
        if (!d.enzyme) return "";
        return quizConfig?.hideEnzymes ? "???" : d.enzyme[language];
      })
      .attr("text-anchor", "middle")
      // If enzymeReverse exists (two distinct enzymes), shift forward one up
      .attr("dy", (d: any) => d.enzymeReverse ? -8 : -5) 
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("fill", (d: any) => quizConfig?.hideEnzymes ? "#94a3b8" : "#475569")
      .attr("stroke", "#f8fafc")
      .attr("stroke-width", "3px")
      .attr("paint-order", "stroke")
      .attr("cursor", "help")
      .attr("opacity", (d: any) => d.flux < 0.1 ? 0.2 : 1)
      .on("mouseenter", function(event, d: any) {
        if (quizConfig?.hideEnzymes && d.enzyme) {
          d3.select(this).text(d.enzyme[language]).attr("fill", LINK_COLOR_ACTIVE);
        }
      })
      .on("mouseleave", function(event, d: any) {
        if (quizConfig?.hideEnzymes && d.enzyme) {
          d3.select(this).text("???").attr("fill", "#94a3b8");
        }
      });

    // 2. Reverse Enzyme (Below line, Italic) - ONLY if enzymeReverse exists
    linkLabels.append("text")
      .text((d: any) => {
        if (!d.enzymeReverse) return "";
        return quizConfig?.hideEnzymes ? "???" : d.enzymeReverse[language];
      })
      .attr("text-anchor", "middle")
      .attr("dy", 14) 
      .attr("font-size", "9px")
      .attr("font-style", "italic") // Visual distinction
      .attr("fill", (d: any) => quizConfig?.hideEnzymes ? "#94a3b8" : "#64748b")
      .attr("stroke", "#f8fafc")
      .attr("stroke-width", "3px")
      .attr("paint-order", "stroke")
      .attr("cursor", "help")
      .attr("opacity", (d: any) => d.flux < 0.1 ? 0.2 : 1)
      .on("mouseenter", function(event, d: any) {
        if (quizConfig?.hideEnzymes && d.enzymeReverse) {
          d3.select(this).text(d.enzymeReverse[language]).attr("fill", LINK_COLOR_ACTIVE);
        }
      })
      .on("mouseleave", function(event, d: any) {
        if (quizConfig?.hideEnzymes && d.enzymeReverse) {
          d3.select(this).text("???").attr("fill", "#94a3b8");
        }
      });

    // 3. Rate Limiting Star
    linkLabels.each(function(d: any) {
      if (d.isRateLimiting) {
        d3.select(this).append("text")
          .text("★")
          .attr("text-anchor", "middle")
          .attr("dy", d.enzymeReverse ? -20 : -18) // Position above enzyme name
          .attr("fill", STAR_COLOR)
          .attr("font-size", "12px");
      }
    });

    // Exam Lightbulbs
    let examIcons: any;
    if (isEducationMode) {
      const examPoints = links.filter((d: any) => d.examPoint);
      const examGroup = zoomGroup.append("g");
      
      examIcons = examGroup.selectAll("g")
        .data(examPoints)
        .enter().append("g")
        .attr("class", "cursor-pointer")
        .on("mouseenter", (event, d: any) => {
           setTooltip({
            visible: true,
            x: event.clientX,
            y: event.clientY,
            content: d.examPoint[language]
          });
          d3.select(event.currentTarget).select("circle").attr("r", 14).attr("fill", "#fbbf24");
        })
        .on("mousemove", (event) => {
           setTooltip(prev => prev ? { ...prev, x: event.clientX, y: event.clientY } : null);
        })
        .on("mouseleave", (event) => {
          setTooltip(null);
          d3.select(event.currentTarget).select("circle").attr("r", 10).attr("fill", "#f59e0b");
        });

      examIcons.append("circle")
       .attr("r", 10)
       .attr("fill", "#f59e0b")
       .attr("stroke", "#fff")
       .attr("stroke-width", 2)
       .attr("class", "animate-pulse");

      examIcons.append("text")
       .text("💡")
       .attr("text-anchor", "middle")
       .attr("dy", 4)
       .attr("font-size", "12px");
    }

    const node = zoomGroup.append("g").attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .enter().append("g")
      .call(d3.drag<any, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    node.append("circle")
      .attr("r", (d: any) => d.type === NodeType.COFACTOR ? NODE_RADIUS * 0.7 : NODE_RADIUS)
      .attr("fill", NODE_COLOR_METABOLITE)
      .attr("stroke", (d: any) => {
        if (['pyruvate', 'acetyl_coa', 'g6p', 'oxaloacetate', 'citrate'].includes(d.id)) return '#0ea5e9';
        if (d.type === NodeType.COFACTOR) return '#94a3b8';
        return '#475569';
      })
      .attr("stroke-width", (d: any) => ['pyruvate', 'acetyl_coa'].includes(d.id) ? 3 : 2)
      .on("mouseenter", (event, d) => {
        // Show tooltip (which acts as the "Reveal Answer" in quiz mode)
        setTooltip({
          visible: true,
          x: event.clientX,
          y: event.clientY,
          content: `${d.name[language]}${d.formula ? ` (${d.formula})` : ''}`
        });
        d3.select(event.currentTarget).attr("fill", "#e0f2fe");
      })
      .on("mousemove", (event) => {
        setTooltip(prev => prev ? { ...prev, x: event.clientX, y: event.clientY } : null);
      })
      .on("mouseleave", (event) => {
        setTooltip(null);
        d3.select(event.currentTarget).attr("fill", NODE_COLOR_METABOLITE);
      });

    node.append("text")
      .attr("dy", (d: any) => d.type === NodeType.COFACTOR ? 25 : 32)
      .attr("text-anchor", "middle")
      .text((d: any) => quizConfig?.hideMetabolites ? "???" : d.name[language])
      .attr("class", "text-[10px] font-sans font-medium pointer-events-none")
      .attr("fill", quizConfig?.hideMetabolites ? "#94a3b8" : "#475569")
      .attr("stroke", "#f8fafc")
      .attr("stroke-width", "3px")
      .attr("paint-order", "stroke");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      linkLabels.attr("transform", (d: any) => {
         const x = (d.source.x + d.target.x) / 2;
         const y = (d.source.y + d.target.y) / 2;
         return `translate(${x},${y})`;
      });

      if (examIcons) {
        examIcons.attr("transform", (d: any) => {
          const x = (d.source.x + d.target.x) / 2;
          const y = (d.source.y + d.target.y) / 2 - 25; 
          return `translate(${x},${y})`;
        });
      }

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [data, language, highlightStep, isEducationMode, quizConfig]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-slate-50">
      <svg ref={svgRef} className="w-full h-full cursor-move" />
      {tooltip && tooltip.visible && (
        <div 
          className="fixed z-50 px-3 py-2 text-xs text-white bg-slate-800/95 backdrop-blur rounded shadow-lg pointer-events-none border border-slate-700 max-w-[240px]"
          style={{ 
            left: tooltip.x, 
            top: tooltip.y, 
            transform: 'translate(-50%, -130%)' 
          }}
        >
          {tooltip.content}
          <div className="absolute left-1/2 bottom-0 w-2 h-2 bg-slate-800/95 transform -translate-x-1/2 translate-y-1/2 rotate-45"></div>
        </div>
      )}
    </div>
  );
};

export default PathwayGraph;
