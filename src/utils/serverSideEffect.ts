/**
 * Executes multiple asynchronous functions in parallel and logs their completion status.
 * This utility is designed for handling server-side effects that don't need to block execution.
 * 
 * The function takes any number of asynchronous functions as arguments, executes them concurrently,
 * and logs the result of each operation (success or failure) without affecting the main execution flow.
 * 
 * @param funcs - An array of asynchronous functions to be executed
 * @returns void - This function doesn't return anything as it handles effects asynchronously
 * 
 * @example
 * ```typescript
 * serverSideEffect(
 *   () => sendAnalyticsEvent("page_view"),
 *   () => logUserActivity(userId),
 *   () => updateLastAccessTime(resourceId)
 * );
 * // Main execution continues while these effects run in the background
 * ```
 */
export default function (...funcs: Array<() => Promise<unknown>>) {
  Promise.allSettled(funcs.map((func) => func()))
    .then((results) => {
      results.forEach((result) => {
        if (result.status === "rejected") {
          console.error("Error in server side effect:", result.reason);
        } else {
          console.log(
            "Server side effect completed successfully",
          );
        }
      });
    })
    .catch((error) => {
      console.error("Error in server side effect:", error);
    });
}
