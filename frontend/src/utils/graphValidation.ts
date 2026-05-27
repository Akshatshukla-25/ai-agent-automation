import { generateNodeId, generateEdgeId } from './ids';

/**
 * Deep clones an array of workflow nodes and ensures every node 
 * receives a completely unique ID, shifting their position slightly 
 * so they don't visually overlap.
 */
export const duplicateNodesSafely = (nodesToDuplicate: any[]): any[] => {
  return nodesToDuplicate.map((node) => {
    // Deep clone to cut all object references
    const clonedNode = JSON.parse(JSON.stringify(node));
    
    // Assign completely fresh tracking IDs
    clonedNode.id = generateNodeId(clonedNode.type);
    
    // Unselect the new clone and slightly offset its visual position
    clonedNode.selected = false;
    if (clonedNode.position) {
      clonedNode.position.x += 40;
      clonedNode.position.y += 40;
    }
    
    return clonedNode;
  });
};

/**
 * Sanitizes imported workflows/templates by translating potentially conflicting IDs 
 * into freshly generated, guaranteed-unique keys while preserving valid edge connections.
 */
export const sanitizeImportedGraph = (
  importedNodes: any[], 
  importedEdges: any[], 
  existingNodes: any[]
) => {
  const existingIds = new Set(existingNodes.map((n) => n.id));
  const idMap = new Map<string, string>(); // Maps old_id -> new_id

  // 1. Process and rebuild node array
  const sanitizedNodes = importedNodes.map((node) => {
    let newId = node.id;
    
    // Force a new ID if it collides with anything currently on the canvas
    if (existingIds.has(node.id)) {
      newId = generateNodeId(node.type);
    }
    
    idMap.set(node.id, newId);

    return {
      ...node,
      id: newId,
      selected: false,
    };
  });

  // 2. Process and safely route edges
  const sanitizedEdges = (importedEdges || []).map((edge) => {
    const sourceId = idMap.get(edge.source) || edge.source;
    const targetId = idMap.get(edge.target) || edge.target;

    return {
      ...edge,
      id: generateEdgeId(), // Edge IDs should always be clean slates
      source: sourceId,
      target: targetId,
    };
  });

  return { sanitizedNodes, sanitizedEdges };
};