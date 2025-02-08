export const BUCKET = {
    STORE: 'code_store',
    FILE: 'cody',
    EXCALIDRAW: 'excalidraw',
} as const;

export type BucketType = typeof BUCKET[keyof typeof BUCKET];

