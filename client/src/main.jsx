var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";
var queryClient = new QueryClient();
var redirectToLoginIfUnauthorized = function (error) {
    if (!(error instanceof TRPCClientError))
        return;
    if (typeof window === "undefined")
        return;
    var isUnauthorized = error.message === UNAUTHED_ERR_MSG;
    if (!isUnauthorized)
        return;
    window.location.href = getLoginUrl();
};
queryClient.getQueryCache().subscribe(function (event) {
    if (event.type === "updated" && event.action.type === "error") {
        var error = event.query.state.error;
        redirectToLoginIfUnauthorized(error);
        console.error("[API Query Error]", error);
    }
});
queryClient.getMutationCache().subscribe(function (event) {
    if (event.type === "updated" && event.action.type === "error") {
        var error = event.mutation.state.error;
        redirectToLoginIfUnauthorized(error);
        console.error("[API Mutation Error]", error);
    }
});
var trpcClient = trpc.createClient({
    links: [
        httpBatchLink({
            url: import.meta.env.VITE_API_URL ? "".concat(import.meta.env.VITE_API_URL, "/api/trpc") : "/api/trpc",
            transformer: superjson,
            fetch: function (input, init) {
                return globalThis.fetch(input, __assign(__assign({}, (init !== null && init !== void 0 ? init : {})), { credentials: "include" }));
            },
        }),
    ],
});
createRoot(document.getElementById("root")).render(<trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>);
