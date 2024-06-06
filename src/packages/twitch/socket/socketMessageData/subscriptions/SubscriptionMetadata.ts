import { SubscriptionConditionMap } from "./Condition";

export interface SubscriptionMetadata<T extends keyof SubscriptionConditionMap> {
    /**
     * Your client ID.
     */
    id: string;
    
    /**
     * The notification’s subscription type.
     */
    type: string;
    
    /**
     * The version of the subscription.
     */
    version: string;
    
    /**
     * The status of the subscription.
     */
    status: string;
    
    /**
     * How much the subscription counts against your limit
     */
    cost: number;
    
    /**
     * Subscription-specific parameters.
     */
    condition: SubscriptionConditionMap[T];

    /**
     * The time the notification was created.
     */
    created_at: string;
}