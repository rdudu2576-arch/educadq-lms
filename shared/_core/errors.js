var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
 * Base HTTP error class with status code.
 * Throw this from route handlers to send specific HTTP errors.
 */
var HttpError = /** @class */ (function (_super) {
    __extends(HttpError, _super);
    function HttpError(statusCode, message) {
        var _this = _super.call(this, message) || this;
        _this.statusCode = statusCode;
        _this.name = "HttpError";
        return _this;
    }
    return HttpError;
}(Error));
export { HttpError };
// Convenience constructors
export var BadRequestError = function (msg) { return new HttpError(400, msg); };
export var UnauthorizedError = function (msg) { return new HttpError(401, msg); };
export var ForbiddenError = function (msg) { return new HttpError(403, msg); };
export var NotFoundError = function (msg) { return new HttpError(404, msg); };
