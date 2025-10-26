
import { Edge, WorkflowState, WorkflowConfig } from './types';
import { FunctionRegistry } from './registry';

export class EdgeRouter<T> {
  constructor(
    private config: WorkflowConfig,
    private registry: FunctionRegistry<T>
  ) {}

  public async getNextNode(currentNodeId: string, state: WorkflowState<T>): Promise<string | null> {
    const outgoingEdges = this.config.edges.filter(edge => edge.source === currentNodeId);
    if (outgoingEdges.length === 0) {
      return null; // End of a branch
    }

    const conditionalEdges = outgoingEdges.filter(edge => edge.condition);
    const defaultEdge = outgoingEdges.find(edge => !edge.condition);
    let fallbackTarget: string | undefined = undefined;

    for (const edge of conditionalEdges) {
      // The first defined fallback target is usually the intended "else" case
      if (edge.condition?.fallbackTarget && !fallbackTarget) {
        fallbackTarget = edge.condition.fallbackTarget;
      }

      const conditionMet = await this.evaluateCondition(edge, state);
      if (conditionMet) {
        return edge.target;
      }
    }

    // If no conditions were met, check for a fallback target from the conditional edges.
    if (fallbackTarget) {
      return fallbackTarget;
    }

    if (defaultEdge) {
      return defaultEdge.target;
    }

    // A decision node might not have a default path, ending the workflow if no conditions are met.
    return null;
  }

  private async evaluateCondition(edge: Edge, state: WorkflowState<T>): Promise<boolean> {
    if (!edge.condition) {
      return false;
    }

    const { functionRef, params } = edge.condition;
    const func = this.registry.getEdgeCondition(functionRef);

    if (!func) {
      console.error(`Edge condition function "${functionRef}" not found in registry.`);
      return false;
    }

    const result = await func(state, params);
    // A non-null result from the condition function indicates the condition is met.
    return result !== null;
  }
}
