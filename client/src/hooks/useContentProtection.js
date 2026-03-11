import { useEffect } from "react";
/**
 * Hook to protect content from copying, printing, and inspection
 * Disables:
 * - CTRL+C (copy)
 * - CTRL+V (paste)
 * - CTRL+X (cut)
 * - CTRL+A (select all)
 * - Right-click context menu
 * - F12 (developer tools)
 * - CTRL+SHIFT+I (developer tools)
 * - CTRL+SHIFT+J (developer tools)
 * - CTRL+SHIFT+C (developer tools)
 * - Text selection
 * - Print screen
 */
export function useContentProtection() {
    useEffect(function () {
        // Disable right-click
        var handleContextMenu = function (e) {
            e.preventDefault();
            return false;
        };
        // Disable keyboard shortcuts
        var handleKeyDown = function (e) {
            // CTRL+C, CTRL+X, CTRL+V, CTRL+A
            if ((e.ctrlKey || e.metaKey) &&
                (e.key === "c" || e.key === "x" || e.key === "v" || e.key === "a")) {
                e.preventDefault();
                return false;
            }
            // F12, CTRL+SHIFT+I, CTRL+SHIFT+J, CTRL+SHIFT+C
            if (e.key === "F12" ||
                (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C"))) {
                e.preventDefault();
                return false;
            }
            // Print Screen
            if (e.key === "PrintScreen") {
                e.preventDefault();
                return false;
            }
        };
        // Disable text selection
        var handleSelectStart = function (e) {
            e.preventDefault();
            return false;
        };
        // Disable drag
        var handleDragStart = function (e) {
            e.preventDefault();
            return false;
        };
        // Disable copy
        var handleCopy = function (e) {
            e.preventDefault();
            return false;
        };
        // Disable cut
        var handleCut = function (e) {
            e.preventDefault();
            return false;
        };
        // Disable paste
        var handlePaste = function (e) {
            e.preventDefault();
            return false;
        };
        // Add event listeners
        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("selectstart", handleSelectStart);
        document.addEventListener("dragstart", handleDragStart);
        document.addEventListener("copy", handleCopy);
        document.addEventListener("cut", handleCut);
        document.addEventListener("paste", handlePaste);
        // Disable user select via CSS
        var style = document.createElement("style");
        style.textContent = "\n      * {\n        -webkit-user-select: none !important;\n        -moz-user-select: none !important;\n        -ms-user-select: none !important;\n        user-select: none !important;\n        -webkit-touch-callout: none !important;\n      }\n      \n      /* Allow selection in input fields */\n      input, textarea {\n        -webkit-user-select: text !important;\n        -moz-user-select: text !important;\n        -ms-user-select: text !important;\n        user-select: text !important;\n      }\n    ";
        document.head.appendChild(style);
        // Cleanup
        return function () {
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("selectstart", handleSelectStart);
            document.removeEventListener("dragstart", handleDragStart);
            document.removeEventListener("copy", handleCopy);
            document.removeEventListener("cut", handleCut);
            document.removeEventListener("paste", handlePaste);
            document.head.removeChild(style);
        };
    }, []);
}
/**
 * Hook to protect video content from downloading
 * Disables right-click on video and prevents download
 */
export function useVideoProtection(videoRef) {
    useEffect(function () {
        var video = videoRef.current;
        if (!video)
            return;
        // Disable right-click on video
        var handleContextMenu = function (e) {
            e.preventDefault();
            return false;
        };
        // Disable keyboard shortcuts on video
        video.addEventListener("contextmenu", handleContextMenu);
        // Disable controls menu (some browsers)
        video.controlsList = "nodownload";
        return function () {
            video.removeEventListener("contextmenu", handleContextMenu);
        };
    }, [videoRef]);
}
