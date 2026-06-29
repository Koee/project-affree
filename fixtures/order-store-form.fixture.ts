import { type OrderStoreChain } from './order-recipient.fixture';

export type OrderFieldSource =
    | 'receiverName'
    | 'phone'
    | 'coopPassword'
    | 'province'
    | 'district'
    | 'ward'
    | 'houseNumber'
    | 'streetName'
    | 'deliveryAddress';

export type OrderFieldKind = 'text' | 'password' | 'select' | 'textarea';

export type OrderFormField = {
    label: RegExp;
    source: OrderFieldSource;
    kind?: OrderFieldKind;
    required?: boolean;
    secret?: boolean;
};

export type OrderStoreCase = {
    chain: OrderStoreChain;
    tag: string;
    displayName: string;
    storeMatcher: RegExp;
    finalCta: RegExp;
    minOrderTotal?: number;
    maxQuantity?: number;
    fields: OrderFormField[];
};

export const orderStoreCases: OrderStoreCase[] = [
    {
        chain: 'coop',
        tag: '@coop',
        displayName: 'Coop',
        storeMatcher: /coop|co\.op|co op/i,
        finalCta: /dang nhap co\.op|đăng nhập co\.op|them vao gio|thêm vào giỏ/i,
        minOrderTotal: 200_000,
        maxQuantity: 12,
        fields: [
            { label: /nguoi nhan|người nhận/i, source: 'receiverName', required: true },
            { label: /so dien thoai|số điện thoại/i, source: 'phone', required: true },
            {
                label: /mat khau co\.op|mật khẩu co\.op/i,
                source: 'coopPassword',
                kind: 'password',
                secret: true,
            },
            {
                label: /tinh\/thanh pho|tỉnh\/thành phố/i,
                source: 'province',
                kind: 'select',
            },
            { label: /quan\/huyen|quận\/huyện/i, source: 'district', kind: 'select' },
            { label: /phuong\/xa|phường\/xã/i, source: 'ward', kind: 'select' },
            { label: /so nha|số nhà/i, source: 'houseNumber' },
            { label: /ten duong|tên đường/i, source: 'streetName' },
        ],
    },
    {
        chain: 'bhx',
        tag: '@bhx',
        displayName: 'Bach Hoa Xanh',
        storeMatcher: /bhx|bach hoa xanh|bách hóa xanh/i,
        finalCta: /de tro ly dat giup|để trợ lý đặt giúp/i,
        fields: [
            { label: /nguoi nhan|người nhận/i, source: 'receiverName', required: true },
            { label: /so dien thoai|số điện thoại/i, source: 'phone', required: true },
            {
                label: /dia chi giao|địa chỉ giao|dia chi nhan|địa chỉ nhận/i,
                source: 'deliveryAddress',
                kind: 'textarea',
            },
        ],
    },
    {
        chain: 'concung',
        tag: '@concung',
        displayName: 'Con Cung',
        storeMatcher: /concung|con cung|con cưng/i,
        finalCta: /de tro ly dat giup|để trợ lý đặt giúp/i,
        fields: [
            { label: /nguoi nhan|người nhận/i, source: 'receiverName', required: true },
            { label: /so dien thoai|số điện thoại/i, source: 'phone', required: true },
            {
                label: /dia chi giao|địa chỉ giao|dia chi nhan|địa chỉ nhận/i,
                source: 'deliveryAddress',
                kind: 'textarea',
            },
        ],
    },
    {
        chain: 'mlbl',
        tag: '@mlbl',
        displayName: 'MLBL',
        storeMatcher: /mlbl|me va be|mẹ và bé/i,
        finalCta: /de tro ly dat giup|để trợ lý đặt giúp/i,
        fields: [
            { label: /nguoi nhan|người nhận/i, source: 'receiverName', required: true },
            { label: /so dien thoai|số điện thoại/i, source: 'phone', required: true },
            {
                label: /dia chi giao|địa chỉ giao|dia chi nhan|địa chỉ nhận/i,
                source: 'deliveryAddress',
                kind: 'textarea',
            },
        ],
    },
];

export function getOrderStoreCase(chain: OrderStoreChain): OrderStoreCase {
    const storeCase = orderStoreCases.find(candidate => candidate.chain === chain);

    if (!storeCase) {
        throw new Error(`Missing order store case for chain: ${chain}`);
    }

    return storeCase;
}
