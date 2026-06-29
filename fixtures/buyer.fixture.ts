export const BuyerFixture = {
    valid: {
        name: 'Thạch',
        phone: '0303050708',
        address: 'HCM',
    },

    emptyName: {
        name: '',
        phone: '0303050708',
        address: 'HCM',
    },

    invalidPhone: {
        name: 'Thạch',
        phone: '123',
        address: 'HCM',
    },

    emptyAddress: {
        name: 'Thạch',
        phone: '0303050708',
        address: '',
    },

    xssPayload: {
        name: '<script>alert(1)</script>',
        phone: '0303050708',
        address: 'HCM',
    },
};