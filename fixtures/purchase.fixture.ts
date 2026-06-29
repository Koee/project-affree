import { randomUUID } from 'crypto';

export const PurchaseFixture = {
    product: {
        productId: 'sugar-bienhoa-1kg',
        productName: 'Đường trắng Biên Hòa 1kg',
        unitPrice: 29000,
    },

    stores: [
        {
            storeId: 'bhx-q1',
            storeName: 'Bách Hóa Xanh Nguyễn Thị Minh Khai',
            chain: 'bhx',
            qty: 1,
        },
        {
            storeId: 'coop-q1',
            storeName: 'Co.opmart Quận 1',
            chain: 'coop',
            qty: 2,
        },
        {
            storeId: 'winmart-q1',
            storeName: 'WinMart Quận 1',
            chain: 'winmart',
            qty: 3,
        },
    ],

    buildPurchase(store: {
        storeId: string;
        storeName: string;
        chain: string;
        qty: number;
    }) {
        return {
            productId: this.product.productId,
            productName: this.product.productName,
            storeId: store.storeId,
            storeName: store.storeName,
            chain: store.chain,
            qty: store.qty,
            unitPrice: this.product.unitPrice,
            total: store.qty * this.product.unitPrice,
            id: randomUUID(),
            boughtAt: new Date().toISOString(),
        };
    },
};