export class Input {
    constructor() {
        this.keys = {};

        // Lắng nghe sự kiện nhấn phím
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });

        // Lắng nghe sự kiện thả phím
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    // Hàm kiểm tra xem một phím cụ thể (như 'KeyW') có đang được giữ hay không
    isPressed(code) {
        // Trả về true nếu phím tồn tại và đang là true, ngược lại trả về false
        return !!this.keys[code];
    }
}