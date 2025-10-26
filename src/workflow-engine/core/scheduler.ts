
export class SchedulerService {
  public async wait(duration: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, duration));
  }

  public scheduleTask(callback: () => void, delay: number): () => void {
    const timeoutId = setTimeout(callback, delay);
    return () => clearTimeout(timeoutId);
  }
}
