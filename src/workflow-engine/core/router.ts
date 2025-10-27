

import { Edge, WorkflowState, WorkflowConfig, FunctionDefinition, ApiOptions, AuthOptions } from './types';
import { FunctionRegistry } from './registry';

function isApiOptions<T>(def: FunctionDefinition<T>): def is ApiOptions {
  return typeof def === 'object' && 'url' in def;
}

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

    const { functionRef, params, api } = edge.condition;

    if (api) {
      return this.evaluateApiCondition(api, state, params);
    }

    if (!functionRef) {
      return false;
    }

    const funcDef = this.registry.getFunction(functionRef);
    if (!funcDef) {
      console.error(`Edge condition function "${functionRef}" not found in registry.`);
      return false;
    }

    if (isApiOptions(funcDef)) {
      return this.evaluateApiCondition(funcDef, state, params);
    }

    if (typeof funcDef === 'function') {
      const edgeFunction = funcDef as (state: WorkflowState<T>, params?: Record<string, any>) => Promise<string | null>;
      const result = await edgeFunction(state, params);
      return result !== null;
    }

    return false;
  }

  private async evaluateApiCondition(api: ApiOptions, state: WorkflowState<T>, params?: Record<string, any>): Promise<boolean> {
    const headers = new Headers(api.headers || {});
    if (api.auth) {
      this.applyAuth(headers, api.auth);
    }

    const url = this.replacePlaceholders(api.url, { ...state, params });
    const body = api.body ? this.replacePlaceholders(api.body, { ...state, params }) : undefined;

    try {
      const response = await fetch(url, {
        method: api.method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      // For now, we'll consider any 2xx response as the condition being met.
      // This could be made more sophisticated to check the response body.
      return response.ok;
    } catch (error) {
      console.error(`Error evaluating API condition:`, error);
      return false;
    }
  }

  private applyAuth(headers: Headers, auth: AuthOptions) {
    switch (auth.type) {
      case 'bearer':
        if (auth.credentials.token) {
          headers.set('Authorization', `Bearer ${this.replacePlaceholders(auth.credentials.token, {})}`);
        }
        break;
      case 'apiKey':
        if (auth.credentials.apiKey) {
          headers.set('X-API-Key', this.replacePlaceholders(auth.credentials.apiKey, {}));
        }
        break;
    }
  }

  private replacePlaceholders(template: any, context: any): any {
    if (typeof template === 'string') {
      return template.replace(/\${(.*?)}/g, (_, key) => {
        const value = key.split('.').reduce((acc, k) => acc && acc[k], context);
        return value !== undefined ? String(value) : '';
      });
    }
    if (Array.isArray(template)) {
      return template.map(item => this.replacePlaceholders(item, context));
    }
    if (typeof template === 'object' && template !== null) {
      return Object.fromEntries(
        Object.entries(template).map(([key, value]) => [key, this.replacePlaceholders(value, context)])
      );
    }
    return template;
  }
}

