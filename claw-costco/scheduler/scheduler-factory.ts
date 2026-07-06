import { StoreScheduler } from './store-scheduler';

export class SchedulerFactory {
    static create(
        store: string,
        agent: any,
        config: any
    ): StoreScheduler {
        return new StoreScheduler(store, agent, config);
    }
}
