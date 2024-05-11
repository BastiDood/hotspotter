declare global {
    namespace App {
        interface Error {
            message: string;
            stack?: string;
        }
    }
}
export {};
