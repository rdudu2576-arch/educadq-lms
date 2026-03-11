var _a, _b, _c, _d, _e, _f, _g, _h, _j;
export var ENV = {
    appId: (_a = process.env.VITE_APP_ID) !== null && _a !== void 0 ? _a : "",
    cookieSecret: (_b = process.env.JWT_SECRET) !== null && _b !== void 0 ? _b : "",
    databaseUrl: (_c = process.env.DATABASE_URL) !== null && _c !== void 0 ? _c : "",
    oAuthServerUrl: (_d = process.env.OAUTH_SERVER_URL) !== null && _d !== void 0 ? _d : "",
    ownerOpenId: (_e = process.env.OWNER_OPEN_ID) !== null && _e !== void 0 ? _e : "",
    isProduction: process.env.NODE_ENV === "production",
    forgeApiUrl: (_f = process.env.BUILT_IN_FORGE_API_URL) !== null && _f !== void 0 ? _f : "",
    forgeApiKey: (_g = process.env.BUILT_IN_FORGE_API_KEY) !== null && _g !== void 0 ? _g : "",
    mercadoPagoAccessToken: (_h = process.env.MERCADO_PAGO_ACCESS_TOKEN) !== null && _h !== void 0 ? _h : "",
    mercadoPagoPublicKey: (_j = process.env.MERCADO_PAGO_PUBLIC_KEY) !== null && _j !== void 0 ? _j : "",
};
