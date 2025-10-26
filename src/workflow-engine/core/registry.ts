
import { NodeFunction, EdgeConditionFunction, FunctionRegistryEntry } from './types';

export class FunctionRegistry<T> {
  private nodeFunctions = new Map<string, NodeFunction<T>>();
  private edgeConditions = new Map<string, EdgeConditionFunction<T>>();
  private functionDetails = new Map<string, Omit<FunctionRegistryEntry<T>, 'function'>>();

  public registerNodeFunction(name: string, fn: NodeFunction<T>, description = '', schema?: Record<string, any>): void {
    if (this.nodeFunctions.has(name) || this.edgeConditions.has(name)) {
      throw new Error(`Function with name "${name}" is already registered.`);
    }
    this.nodeFunctions.set(name, fn);
    this.functionDetails.set(name, { name, type: 'node', description, schema });
  }

  public registerEdgeCondition(name: string, fn: EdgeConditionFunction<T>, description = '', schema?: Record<string, any>): void {
    if (this.nodeFunctions.has(name) || this.edgeConditions.has(name)) {
      throw new Error(`Function with name "${name}" is already registered.`);
    }
    this.edgeConditions.set(name, fn);
    this.functionDetails.set(name, { name, type: 'edge', description, schema });
  }

  public getNodeFunction(name: string): NodeFunction<T> | undefined {
    return this.nodeFunctions.get(name);
  }

  public getEdgeCondition(name: string): EdgeConditionFunction<T> | undefined {
    return this.edgeConditions.get(name);
  }

  public hasFunction(name: string): boolean {
    return this.nodeFunctions.has(name) || this.edgeConditions.has(name);
  }

  public listFunctions(): FunctionRegistryEntry<T>[] {
    const allFunctions: FunctionRegistryEntry<T>[] = [];
    for (const [name, details] of this.functionDetails.entries()) {
      const func = this.nodeFunctions.get(name) || this.edgeConditions.get(name);
      if (func) {
        allFunctions.push({ ...details, function: func } as FunctionRegistryEntry<T>);
      }
    }
    return allFunctions;
  }
}
