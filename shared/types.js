/**
 * SHARED TYPES - CONTRATO OBRIGATÓRIO
 *
 * ⚠️ REGRA CRÍTICA:
 * Todos os tipos de User, Auth, Roles devem estar aqui.
 * Frontend E Backend devem importar DAQUI.
 * Nenhuma redefinição local é permitida.
 *
 * Se você tentar redefinir localmente, o build falhará.
 */
export * from "./_core/errors.js";
// ============================================================================
// VALIDATION HELPERS
// ============================================================================
export function isValidRole(role) {
    return role === "admin" || role === "professor" || role === "user";
}
