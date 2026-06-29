export const SearchFixture = {
    nearbyStores: {
        product: {
            code: 'chung00005',
            name: 'Bia Tiger Crystal lốc 6 lon x 330ml',
            path: '/p/chung00005',
        },
        location: {
            address: '5 Đống Đa, Phường Tân Sơn Hòa, TP.HCM',
            suggestionText: /đống đa|dong da|tân sơn hòa|tan son hoa|hồ chí minh|ho chi minh|tp\.?hcm/i,
            expected: {
                loc: {
                    lat: 10.8090411,
                    lng: 106.6655541,
                },
                addr: '5 Đống Đa, Phường Tân Sơn Hòa, TP.HCM',
                area: 'Phường Tân Sơn Hòa',
                country: 'vn',
                region: 'TPHCM',
            },
        },
    },
    productName: 'Bia Tiger Crystal lốc 6 lon x 330ml',
    address: '5 đống đa',
};
