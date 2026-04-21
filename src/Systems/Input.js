export class Input {
    constructor() {
        this.keys = {};

        // Lắng nghe sự kiện nhấn phím
        window.addEventListener('keydown', (e) => {
            // Ngăn sự kiện mặc định để tránh cuộn trang hoặc các hành vi khác
            // Lưu ý: bộ gõ tiếng Việt (Unikey/EVKey) vẫn có thể cản trở và gây khựng
            // Khuyến cáo tắt bộ gõ tiếng Việt khi chơi game dùng WASD.
            if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
                e.preventDefault();
            }
            this.keys[e.code] = true;
        }, { passive: false });

        // Lắng nghe sự kiện thả phím
        window.addEventListener('keyup', (e) => {
            if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
                e.preventDefault();
            }
            this.keys[e.code] = false;
        }, { passive: false });
    }

    // Hàm kiểm tra xem một phím cụ thể (như 'KeyW') có đang được giữ hay không
    isPressed(code) {
        // Trả về true nếu phím tồn tại và đang là true, ngược lại trả về false
        return !!this.keys[code];
    }
}