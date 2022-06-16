import Queue from "queue-fifo";

export default abstract class baseService<T>{
    queue = new Queue<T>();

    protected running = false;

    abstract loopCycle(item:T): Promise<void>

    async start(): Promise<void> {
        this.running = true;
        while (!this.queue.isEmpty() && this.running){
            const item = this.queue.dequeue();
            if (item === null) { // queue must be tempty, for now at least
                await new Promise(r => setTimeout(r, 100));
            } else {
                await this.loopCycle(item);
            }
        }
    }

    stop(): void {
        this.running = false;
    }
}