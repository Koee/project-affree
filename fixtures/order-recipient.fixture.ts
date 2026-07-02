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
    deliverySlot?: string;
};

export const OrderReportPrefixFixture: Record<OrderStoreChain, string> = {
    coop: 'co.op-',
    bhx: 'bhx-',
    concung: 'concung-',
    mlbl: 'mlbl-',
};

export function getOrderReportPrefix(chain: OrderStoreChain): string {
    return OrderReportPrefixFixture[chain];
}

const commonRecipient = {
    receiverName: process.env.ORDER_RECEIVER_NAME || 'Thach',
    phone: process.env.ORDER_RECEIVER_PHONE || '0303050708',
};

const defaultDeliveryAddress =
    process.env.ORDER_DELIVERY_ADDRESS ||
    '5 Đống Đa, Phường Tân Sơn Hòa, TP.HCM';

export const OrderRecipientFixture: Record<OrderStoreChain, OrderRecipientData> = {
    coop: {
        receiverName: process.env.ORDER_COOP_RECEIVER_NAME || 'Trách',
        phone: process.env.ORDER_COOP_RECEIVER_PHONE || '0989346877',
        coopPassword: process.env.ORDER_COOP_PASSWORD || process.env.COOP_PASSWORD,
        province: process.env.ORDER_COOP_PROVINCE || 'Thành phố Hồ Chí Minh',
        district: process.env.ORDER_COOP_DISTRICT || 'Quận Phú Nhuận',
        ward: process.env.ORDER_COOP_WARD || 'Phường 1',
        houseNumber: process.env.ORDER_COOP_HOUSE_NUMBER || '246',
        streetName: process.env.ORDER_COOP_STREET_NAME || 'Nguyễn Trọng Tuyển',
        deliveryAddress:
            process.env.ORDER_COOP_DELIVERY_ADDRESS ||
            '246 Nguyễn Trọng Tuyển, Phường 1, Quận Phú Nhuận, TP.HCM',
    },
    bhx: {
        receiverName: process.env.ORDER_BHX_RECEIVER_NAME || 'Trạch',
        phone: process.env.ORDER_BHX_RECEIVER_PHONE || '0305070809',
        deliveryAddress:
            process.env.ORDER_BHX_DELIVERY_ADDRESS ||
            'Thị trấn Tân Túc, Phường 6, Quận Gò Vấp, Thành phố Hồ Chí Minh',
        deliverySlot: process.env.ORDER_BHX_DELIVERY_SLOT || 'Trong hôm nay',
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
