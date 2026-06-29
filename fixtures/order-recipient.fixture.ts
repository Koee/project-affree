export type OrderStoreChain = 'coop' | 'bhx' | 'concung' | 'mlbl';

export type OrderRecipientData = {
    receiverName: string;
    phone: string;
    coopPassword?: string;
    province?: string;
    district?: string;
    ward?: string;
    houseNumber?: string;
    streetName?: string;
    deliveryAddress?: string;
};

const commonRecipient = {
    receiverName: process.env.ORDER_RECEIVER_NAME || 'Thach',
    phone: process.env.ORDER_RECEIVER_PHONE || '0303050708',
};

const defaultDeliveryAddress =
    process.env.ORDER_DELIVERY_ADDRESS ||
    '5 Đống Đa, Phường Tân Sơn Hòa, TP.HCM';

export const OrderRecipientFixture: Record<OrderStoreChain, OrderRecipientData> = {
    coop: {
        ...commonRecipient,
        coopPassword: process.env.COOP_PASSWORD,
        province: process.env.ORDER_COOP_PROVINCE || 'TP. Ho Chi Minh',
        district: process.env.ORDER_COOP_DISTRICT || 'Quan Tan Binh',
        ward: process.env.ORDER_COOP_WARD || 'Phuong Tan Son Hoa',
        houseNumber: process.env.ORDER_COOP_HOUSE_NUMBER || '5',
        streetName: process.env.ORDER_COOP_STREET_NAME || 'Dong Da',
        deliveryAddress: defaultDeliveryAddress,
    },
    bhx: {
        ...commonRecipient,
        deliveryAddress: defaultDeliveryAddress,
    },
    concung: {
        ...commonRecipient,
        deliveryAddress: defaultDeliveryAddress,
    },
    mlbl: {
        ...commonRecipient,
        deliveryAddress: defaultDeliveryAddress,
    },
};
