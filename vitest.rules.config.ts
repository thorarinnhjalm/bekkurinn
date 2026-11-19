import { defineConfig } from 'vitest/config';

/**
 * Próf fyrir Firestore- og Storage-reglur. Keyra aðeins innan Firebase-emulators:
 * `npm run test:rules` ræsir hann, keyrir prófin og slekkur á honum.
 */
export default defineConfig({
    test: {
        environment: 'node',
        include: ['tests-rules/**/*.test.ts'],
        fileParallelism: false,
        testTimeout: 30_000,
        hookTimeout: 60_000,
    },
});
