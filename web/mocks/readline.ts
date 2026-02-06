export const createInterface = () => ({
    on: (event, cb) => {},
    close: () => {},
    [Symbol.asyncIterator]: async function* () {}
});
