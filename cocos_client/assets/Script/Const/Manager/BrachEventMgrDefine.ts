export interface BranchEventMgrEvent {
    onBranchEventStepEnd?(currentEventId: string, hasNextStep: boolean): void;
}

export class ActiveEventState {
    /** current event id */
    eventId: string = null;

    prevEventId: string = null;

    pioneerId: string = null;

    buildingId: string = null;
}