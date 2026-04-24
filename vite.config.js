import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        port: 5173,
        strictPort: true, // Báo lỗi ngay lập tức nếu port 5173 đang bị app khác dùng
    }
});