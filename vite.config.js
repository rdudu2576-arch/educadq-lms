import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";

export default defineConfig({
    plugins: [
        react()
    ],
    css: {
        postcss: {
            plugins: [
                tailwindcss(),
                autoprefixer()
            ]
        }
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "client/src"),
            "@shared": path.resolve(__dirname, "shared"),
            "@assets": path.resolve(__dirname, "attached_assets")
        }
    },
    envDir: path.resolve(__dirname),
    root: path.resolve(__dirname, "client"),
    publicDir: path.resolve(__dirname, "client/public"),
    build: {
        outDir: path.resolve(__dirname, "dist/public"),
        emptyOutDir: true
    },
    server: {
        host: true,
        port: 5173,
        fs: {
            strict: true
        }
    }
});
