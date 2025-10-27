

import { FunctionDefinition, FunctionRegistryEntry } from './types';

export class FunctionRegistry<T> {
  private functionDefinitions = new Map<string, FunctionRegistryEntry<T>>();

  public register(entry: FunctionRegistryEntry<T>): void {
    if (this.functionDefinitions.has(entry.name)) {
      throw new Error(`Function with name "${entry.name}" is already registered.`);
    }
    this.functionDefinitions.set(entry.name, entry);
  }

  public getFunction(name: string): FunctionDefinition<T> | undefined {
    return this.functionDefinitions.get(name)?.definition;
  }

  public getFunctionEntry(name: string): FunctionRegistryEntry<T> | undefined {
    return this.functionDefinitions.get(name);
  }

  public hasFunction(name: string): boolean {
    return this.functionDefinitions.has(name);
  }

  public listFunctions(): FunctionRegistryEntry<T>[] {
    return Array.from(this.functionDefinitions.values());
  }
}

