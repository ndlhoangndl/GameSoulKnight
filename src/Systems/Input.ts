export class Input {
    private keys: { [key: string]: boolean } = {};

    constructor() {
        // Lắng nghe nhấn phím
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });

        // Lắng nghe thả phím
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    // Hàm kiểm tra nhanh một phím cụ thể
    isPressed(code: string): boolean {
        return !!this.keys[code];
    }
}