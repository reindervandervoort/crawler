import Queue from "queue-fifo";

export default abstract class BaseService<T>{
    queue = new Queue<T>();

    running = false;

    abstract loopCycle(item:T): Promise<void>
    
    abstract onStop(): void

    abstract onEmptyQueue(): void

    async start(): Promise<void> {
        this.running = true;
        while (!this.queue.isEmpty() || this.running){
            const item = this.queue.dequeue();
            if (item === null) { // queue must is empty, for now at least
                await new Promise(r => setTimeout(r, 100));
            } else {
                await this.loopCycle(item);
            }
        }
        
        this.onStop();
    }

    stop(): void {
        this.running = false;
    }
}