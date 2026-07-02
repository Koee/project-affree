# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e\order\flow-order.spec.ts >> @flow-order @bhx Bách Hóa Xanh order flow >> @bhx should fill recipient form and capture agentic order state
- Location: tests\e2e\order\flow-order.spec.ts:1504:9

# Error details

```
Error: Order form did not open for bhx after clicking Mua/cart
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - alert [ref=e2]
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e6]:
        - button "Quay lại trang chính" [ref=e7]:
          - img [ref=e8]
        - link "Affree Affree v1.3.5 Switch to English Kết nối mua bán - Không thu phí Tìm gì cũng có - Giá hời quanh đây" [ref=e10] [cursor=pointer]:
          - /url: /
          - img "Affree" [ref=e11]:
            - generic [ref=e14]: ₫
          - generic [ref=e15]:
            - generic [ref=e16]:
              - text: Affree
              - button "v1.3.5" [ref=e17]:
                - text: v1.3.5
                - img [ref=e18]
              - button "Switch to English" [ref=e20]:
                - generic [ref=e21]: VI
                - generic [ref=e22]: EN
            - generic [ref=e23]:
              - generic [ref=e24]: Kết nối mua bán - Không thu phí
              - generic [ref=e25]: Tìm gì cũng có - Giá hời quanh đây
        - generic [ref=e26]:
          - button "📍 Chọn vị trí" [ref=e28]:
            - generic [ref=e29]: 📍
            - generic [ref=e31]: Chọn vị trí
          - button "Giỏ hàng" [active] [ref=e32]:
            - img [ref=e34]
            - generic: "+1"
            - generic [ref=e38]: "1"
          - link "Lịch sử mua" [ref=e39] [cursor=pointer]:
            - /url: /history
            - img [ref=e40]
          - button "🛒 Mua hàng TXNN" [ref=e43]
    - main [ref=e44]:
      - generic [ref=e46]:
        - button "← Tất cả kết quả" [ref=e47]
        - generic [ref=e48]:
          - generic [ref=e49]:
            - generic [ref=e50]:
              - generic [ref=e52]:
                - heading "Trà xanh Không Độ chanh 455ml Xem thông tin & chứng nhận" [level=2] [ref=e53]:
                  - generic [ref=e54]: Trà xanh Không Độ chanh 455ml
                  - button "Xem thông tin & chứng nhận" [ref=e55]:
                    - img [ref=e56]
                - paragraph [ref=e58]: Không Độ · Chai 455ml · 3 cửa hàng
              - button "Báo giá giảm" [ref=e60]:
                - img [ref=e61]
                - generic [ref=e64]: Báo giá giảm
            - button "📍 Chọn vị trí (định vị hoặc nhập địa chỉ) để xem khoảng cách tới từng cửa hàng và lọc theo bán kính." [ref=e65]:
              - generic [ref=e66]: 📍
              - generic [ref=e67]: Chọn vị trí (định vị hoặc nhập địa chỉ) để xem khoảng cách tới từng cửa hàng và lọc theo bán kính.
            - generic [ref=e68]:
              - generic [ref=e69]: Sắp xếp theo
              - generic [ref=e70]:
                - button "Giá rẻ" [ref=e71]:
                  - img [ref=e72]
                  - text: Giá rẻ
                - button "Gần nhất" [ref=e75]:
                  - img [ref=e76]
                  - text: Gần nhất
            - list [ref=e79]:
              - listitem [ref=e80]:
                - generic:
                  - generic: Rẻ nhất
                - generic [ref=e81]:
                  - generic [ref=e83]:
                    - generic [ref=e84]:
                      - generic "Bách Hóa Xanh" [ref=e85]:
                        - img "Bách Hóa Xanh" [ref=e86]
                      - generic [ref=e87]:
                        - generic [ref=e88]: Bách Hóa Xanh Nguyễn Thị Minh Khai
                        - generic [ref=e89]: 123 Nguyễn Thị Minh Khai, Quận 1
                        - generic [ref=e91]: Còn hàng
                        - generic [ref=e93]: (16h26 ngày 2/7/2026)
                    - generic [ref=e94]:
                      - generic [ref=e96]:
                        - img [ref=e97]
                        - text: 11.300₫
                      - generic [ref=e100]:
                        - button "Mua ngay" [ref=e101]:
                          - img [ref=e102]
                          - text: Mua ngay
                        - button "Thêm vào giỏ" [ref=e106]:
                          - text: +
                          - generic [ref=e107]: "1"
                  - button "2 chi nhánh khác" [ref=e108]:
                    - img [ref=e109]
                    - text: 2 chi nhánh khác
            - generic [ref=e113]:
              - generic [ref=e114]:
                - generic:
                  - generic:
                    - button "RẺ NHẤT" [ref=e115] [cursor=pointer]:
                      - generic [ref=e116]:
                        - img [ref=e117]
                        - generic [ref=e119]: RẺ NHẤT
                    - button [ref=e120] [cursor=pointer]:
                      - img [ref=e122]
                    - button [ref=e123] [cursor=pointer]:
                      - img [ref=e125]
                - generic:
                  - generic:
                    - generic [ref=e126]:
                      - button "Zoom in" [ref=e127] [cursor=pointer]: +
                      - button "Zoom out" [ref=e128] [cursor=pointer]: −
                    - generic [ref=e130]:
                      - text: © One Solution |
                      - link "OSM" [ref=e131] [cursor=pointer]:
                        - /url: https://www.openstreetmap.org/
              - generic [ref=e132]:
                - button "Ẩn chú thích" [ref=e133] [cursor=pointer]:
                  - img [ref=e134]
                - generic [ref=e136]:
                  - generic [ref=e137]: Vị trí của bạn
                  - generic [ref=e139]:
                    - generic [ref=e140]: "Cửa hàng (bấm để bật/tắt):"
                    - button "Bách Hóa Xanh (3)" [ref=e141] [cursor=pointer]:
                      - img [ref=e142]
                      - generic [ref=e145]: Bách Hóa Xanh
                      - generic [ref=e146]: (3)
                  - generic [ref=e147]:
                    - generic [ref=e148]: RẺ NHẤT
                    - text: Nơi bán giá thấp nhất
                  - generic [ref=e149]:
                    - generic [ref=e150]: GẦN NHẤT
                    - text: Cửa hàng gần bạn nhất
          - complementary [ref=e151]:
            - heading "Sản phẩm tương tự" [level=3] [ref=e152]
            - generic [ref=e153]:
              - button "Coca-Cola 1.5L 16.000₫" [ref=e154]:
                - generic [ref=e155]:
                  - generic [ref=e156]: Coca-Cola 1.5L
                  - generic [ref=e157]: 16.000₫
              - button "Cà phê G7 3in1 hộp 21 gói 75.500₫" [ref=e158]:
                - generic [ref=e159]:
                  - generic [ref=e160]: Cà phê G7 3in1 hộp 21 gói
                  - generic [ref=e161]: 75.500₫
              - button "Trà sữa thạch trái cây 20.000₫" [ref=e162]:
                - generic [ref=e163]:
                  - generic [ref=e164]: Trà sữa thạch trái cây
                  - generic [ref=e165]: 20.000₫
              - button "Trà sữa trân châu đen 20.000₫" [ref=e166]:
                - generic [ref=e167]:
                  - generic [ref=e168]: Trà sữa trân châu đen
                  - generic [ref=e169]: 20.000₫
              - button "Trà sữa trân châu trắng 20.000₫" [ref=e170]:
                - generic [ref=e171]:
                  - generic [ref=e172]: Trà sữa trân châu trắng
                  - generic [ref=e173]: 20.000₫
              - button "7 Up 15.200₫" [ref=e174]:
                - generic [ref=e175]:
                  - generic [ref=e176]: 7 Up
                  - generic [ref=e177]: 15.200₫
              - button "Pepsi 15.200₫" [ref=e178]:
                - generic [ref=e179]:
                  - generic [ref=e180]: Pepsi
                  - generic [ref=e181]: 15.200₫
              - button "Nước Suối 12.000₫" [ref=e182]:
                - generic [ref=e183]:
                  - generic [ref=e184]: Nước Suối
                  - generic [ref=e185]: 12.000₫
              - button "Nước Chanh Sả 15.200₫" [ref=e186]:
                - generic [ref=e187]:
                  - generic [ref=e188]: Nước Chanh Sả
                  - generic [ref=e189]: 15.200₫
              - button "Nước Hoa Vô Thường 15.200₫" [ref=e190]:
                - generic [ref=e191]:
                  - generic [ref=e192]: Nước Hoa Vô Thường
                  - generic [ref=e193]: 15.200₫
    - contentinfo [ref=e194]:
      - generic [ref=e195]:
        - generic [ref=e196]:
          - link "One Solution" [ref=e197] [cursor=pointer]:
            - /url: https://one-solution.vn
            - img "One Solution" [ref=e198]
          - paragraph [ref=e199]:
            - text: © 2026 Affree — sản phẩm của
            - link "One Solution" [ref=e200] [cursor=pointer]:
              - /url: https://one-solution.vn
            - text: .
            - text: Kết nối mua bán - Không thu phí
            - text: Tìm gì cũng có - Giá hời quanh đây
        - paragraph [ref=e201]: "Giá & thông tin được tổng hợp từ nguồn công khai, có thể thay đổi theo thời gian. Hình ảnh, logo và thương hiệu thuộc về chủ sở hữu tương ứng; Affree là dịch vụ so sánh giá & điều hướng mua hàng. Yêu cầu gỡ nội dung: liên hệ One Solution."
    - dialog [ref=e202]:
      - generic [ref=e204]:
        - generic [ref=e205]:
          - img [ref=e206]
          - heading "Giỏ hàng(1 sản phẩm)" [level=2] [ref=e210]:
            - text: Giỏ hàng
            - generic [ref=e211]: (1 sản phẩm)
          - button "Đóng" [ref=e212]: ✕
        - generic [ref=e213]:
          - generic [ref=e214]:
            - heading "Thông tin chung" [level=3] [ref=e215]
            - generic [ref=e216]:
              - generic [ref=e217]:
                - generic [ref=e218]: Họ tên
                - textbox "Họ tên" [ref=e219]:
                  - /placeholder: Nguyễn Văn A
              - generic [ref=e220]:
                - generic [ref=e221]: Số điện thoại
                - textbox "Số điện thoại" [ref=e222]:
                  - /placeholder: 0912 345 678
              - generic [ref=e223]:
                - generic [ref=e224]: Địa chỉ giao hàng
                - textbox "Địa chỉ giao hàng" [ref=e225]:
                  - /placeholder: Số nhà, đường, phường, quận…
              - generic [ref=e226]:
                - generic [ref=e227]: Khung giờ giao
                - combobox "Khung giờ giao" [ref=e228]:
                  - option "Trong hôm nay (2–4 giờ)" [selected]
                  - option "Tối nay (18:00–21:00)"
                  - option "Sáng mai (8:00–11:00)"
                  - option "Chiều mai (14:00–17:00)"
          - generic [ref=e229]:
            - generic [ref=e230]:
              - generic [ref=e231]:
                - text: BÁ
                - img "Bách Hóa Xanh" [ref=e232]
              - generic [ref=e233]:
                - paragraph [ref=e234]: Bách Hóa Xanh
                - paragraph [ref=e235]: 1 sản phẩm · 11.300₫
            - generic [ref=e237]:
              - img "Trà xanh Không Độ chanh 455ml" [ref=e238]
              - generic [ref=e239]:
                - paragraph [ref=e240]: Trà xanh Không Độ chanh 455ml
                - paragraph [ref=e241]: 11.300₫
              - generic [ref=e242]:
                - button "−" [ref=e243]
                - generic [ref=e244]: "1"
                - button "+" [ref=e245]
        - generic [ref=e246]:
          - generic [ref=e247]:
            - generic [ref=e248]: Tổng cộng
            - generic [ref=e249]: 11.300₫
          - button "Đặt hàng tất cả (1 cửa hàng)" [disabled] [ref=e250]:
            - img [ref=e251]
            - text: Đặt hàng tất cả (1 cửa hàng)
          - paragraph [ref=e255]: Vui lòng điền SĐT và địa chỉ giao hàng
    - generic [ref=e257]:
      - generic [ref=e258]:
        - generic [ref=e259]:
          - heading "Phục vụ bởi Affree Agentic AI - AAAI" [level=2] [ref=e260]
          - paragraph [ref=e261]: Trà xanh Không Độ chanh 455ml · Bách Hóa Xanh
        - button "Đóng" [ref=e262]:
          - img [ref=e263]
      - generic [ref=e265]:
        - generic [ref=e266]: Bản mô phỏng — chưa kết nối web thật. Dùng để xem cơ chế trợ lý tự thao tác và dừng lại khi cần bạn.
        - generic [ref=e267]:
          - generic [ref=e268]:
            - img "Trà xanh Không Độ chanh 455ml" [ref=e269]
            - generic [ref=e270]:
              - paragraph [ref=e271]: Trà xanh Không Độ chanh 455ml
              - paragraph [ref=e272]: Bách Hóa Xanh · Bách Hóa Xanh Nguyễn Thị Minh Khai
              - generic [ref=e274]: 11.300₫
            - generic [ref=e275]:
              - generic [ref=e276]: Số lượng
              - generic [ref=e277]:
                - button "−" [ref=e278]
                - generic [ref=e279]: "1"
                - button "+" [ref=e280]
          - generic [ref=e281]:
            - generic [ref=e282]: Khung giờ giao
            - combobox "Khung giờ giao" [ref=e283]:
              - option "Trong hôm nay (2–4 giờ)" [selected]
              - option "Tối nay (18:00–21:00)"
              - option "Sáng mai (8:00–11:00)"
              - option "Chiều mai (14:00–17:00)"
          - generic [ref=e284]:
            - paragraph [ref=e285]: "Bách Hóa Xanh yêu cầu để đặt món này:"
            - list [ref=e286]:
              - listitem [ref=e287]: Số điện thoại (xác minh OTP)
              - listitem [ref=e289]: Địa chỉ giao
              - listitem [ref=e291]: Khung giờ giao
          - generic [ref=e293]:
            - generic [ref=e294]: Người nhận
            - textbox "Người nhận" [ref=e295]:
              - /placeholder: Họ và tên
          - generic [ref=e296]:
            - generic [ref=e297]: Số điện thoại
            - textbox "Số điện thoại" [ref=e298]:
              - /placeholder: "VD: 0901234567"
          - generic [ref=e299]:
            - generic [ref=e300]: Địa chỉ giao
            - textbox "Địa chỉ giao" [ref=e301]:
              - /placeholder: Số nhà, đường, phường, quận…
              - text: Thành phố Hồ Chí Minh
          - generic [ref=e302]:
            - paragraph [ref=e303]: 📍 Định vị theo địa chỉ giao — đang định vị & tính khoảng cách theo địa chỉ giao…
            - generic [ref=e304]:
              - button "Gần nhất" [ref=e305]
              - button "Rẻ nhất" [ref=e306]
            - generic [ref=e307]:
              - button "Bách Hóa Xanh · Bách Hóa Xanh Nguyễn Thị Minh Khai Online Rẻ nhất 11.300₫ Đang chọn" [ref=e308]:
                - generic [ref=e309]:
                  - generic [ref=e311]: Bách Hóa Xanh · Bách Hóa Xanh Nguyễn Thị Minh Khai
                  - generic [ref=e312]:
                    - generic [ref=e313]: Online
                    - generic [ref=e314]: Rẻ nhất
                - generic [ref=e315]:
                  - generic [ref=e316]: 11.300₫
                  - text: Đang chọn
              - button "Bách Hóa Xanh · Bách Hóa Xanh Cách Mạng Tháng 8 Online 11.300₫" [ref=e317]:
                - generic [ref=e318]:
                  - generic [ref=e320]: Bách Hóa Xanh · Bách Hóa Xanh Cách Mạng Tháng 8
                  - generic [ref=e322]: Online
                - generic [ref=e324]: 11.300₫
              - button "Bách Hóa Xanh · Bách Hóa Xanh Xô Viết Nghệ Tĩnh Online 11.300₫" [ref=e325]:
                - generic [ref=e326]:
                  - generic [ref=e328]: Bách Hóa Xanh · Bách Hóa Xanh Xô Viết Nghệ Tĩnh
                  - generic [ref=e330]: Online
                - generic [ref=e332]: 11.300₫
          - generic [ref=e334]:
            - generic [ref=e335]: Số lượng
            - generic [ref=e336]:
              - button "Số lượng 1 +" [ref=e337]: −
              - generic [ref=e338]: "1"
              - button "+" [ref=e339]
          - 'button "Thanh toán COD (tiền mặt khi nhận) Bách Hóa Xanh hỗ trợ: COD · MoMo/ZaloPay · Thẻ ATM/Visa/Master/JCB. Chọn trước tại Affree để trợ lý chuẩn bị đúng bước thanh toán." [ref=e340]':
            - generic [ref=e341]:
              - generic [ref=e342]: Thanh toán
              - generic [ref=e343]: COD (tiền mặt khi nhận)
            - paragraph [ref=e344]: "Bách Hóa Xanh hỗ trợ: COD · MoMo/ZaloPay · Thẻ ATM/Visa/Master/JCB. Chọn trước tại Affree để trợ lý chuẩn bị đúng bước thanh toán."
          - generic [ref=e345]:
            - generic [ref=e346]: Tạm tính
            - generic [ref=e347]: 11.300₫
          - button "Để trợ lý đặt giúp →" [disabled] [ref=e348]
          - paragraph [ref=e349]: Nhập đủ tên, số điện thoại và địa chỉ để bắt đầu.
      - generic [ref=e350]:
        - generic [ref=e351]:
          - generic [ref=e352]: Tạm tính
          - generic [ref=e353]: 11.300₫
        - button "Để trợ lý đặt giúp →" [disabled] [ref=e354]
        - paragraph [ref=e355]: Nhập đủ tên, số điện thoại và địa chỉ để bắt đầu.
```

# Test source

```ts
  20  |         agentWaitMs: Number(env.ORDER_AGENT_WAIT_MS || 30_000),
  21  |     };
  22  | }
  23  | 
  24  | export function resolveFieldValue(
  25  |     field: OrderFormField,
  26  |     recipient: OrderRecipientData
  27  | ): string {
  28  |     const value = recipient[field.source];
  29  | 
  30  |     if (field.required && !value) {
  31  |         throw new Error(`Missing required order recipient value: ${field.source}`);
  32  |     }
  33  | 
  34  |     return value || '';
  35  | }
  36  | 
  37  | function labelToPlaceholderPattern(label: RegExp): RegExp {
  38  |     return new RegExp(label.source, label.flags.includes('i') ? 'i' : undefined);
  39  | }
  40  | 
  41  | function fieldPlaceholderPattern(field: OrderFormField): RegExp {
  42  |     if (field.source === 'phone') {
  43  |         return /so dien thoai|số điện thoại|phone|090|09|vd:\s*0/i;
  44  |     }
  45  | 
  46  |     if (field.source === 'deliveryAddress') {
  47  |         return /dia chi|địa chỉ|so nha|số nhà|duong|đường|phuong|phường|quan|quận/i;
  48  |     }
  49  | 
  50  |     if (field.source === 'receiverName') {
  51  |         return /nguoi nhan|người nhận|ho va ten|họ và tên|ten nguoi nhan|tên người nhận/i;
  52  |     }
  53  | 
  54  |     return labelToPlaceholderPattern(field.label);
  55  | }
  56  | 
  57  | export class OrderFormComponent {
  58  |     constructor(private readonly page: Page) { }
  59  | 
  60  |     finalCta(storeCase: OrderStoreCase): Locator {
  61  |         const dialog = this.page.locator('[role="dialog"]').last();
  62  |         const enabledDialogCta = dialog
  63  |             .locator('button:not([disabled]):not([aria-disabled="true"])')
  64  |             .filter({ hasText: storeCase.finalCta })
  65  |             .first();
  66  |         const enabledPageCta = this.page
  67  |             .locator('button:not([disabled]):not([aria-disabled="true"])')
  68  |             .filter({ hasText: storeCase.finalCta })
  69  |             .first();
  70  | 
  71  |         return enabledDialogCta.or(enabledPageCta).first();
  72  |     }
  73  | 
  74  |     async fillStoreForm(
  75  |         storeCase: OrderStoreCase,
  76  |         recipient: OrderRecipientData
  77  |     ): Promise<void> {
  78  |         for (const field of storeCase.fields) {
  79  |             const value = resolveFieldValue(field, recipient);
  80  | 
  81  |             if (!value) {
  82  |                 continue;
  83  |             }
  84  | 
  85  |             await this.fillField(field, value);
  86  |         }
  87  |     }
  88  | 
  89  |     async expectStoreFormReady(
  90  |         storeCase: OrderStoreCase,
  91  |         testInfo: TestInfo
  92  |     ): Promise<void> {
  93  |         const marker = this.page
  94  |             .getByText(/nguoi nhan|người nhận|so dien thoai|số điện thoại/i)
  95  |             .or(this.finalCta(storeCase))
  96  |             .first();
  97  |         const isReady = await marker.isVisible({ timeout: 10_000 }).catch(() => false);
  98  | 
  99  |         if (isReady) {
  100 |             return;
  101 |         }
  102 | 
  103 |         await testInfo.attach(`${storeCase.chain}-order-form-missing`, {
  104 |             body: await this.page.screenshot({ fullPage: true }),
  105 |             contentType: 'image/png',
  106 |         });
  107 | 
  108 |         await testInfo.attach(`${storeCase.chain}-order-form-missing-state`, {
  109 |             body: JSON.stringify(
  110 |                 {
  111 |                     url: this.page.url(),
  112 |                     text: (await this.page.locator('body').innerText()).slice(0, 10_000),
  113 |                 },
  114 |                 null,
  115 |                 2
  116 |             ),
  117 |             contentType: 'application/json',
  118 |         });
  119 | 
> 120 |         throw new Error(
      |               ^ Error: Order form did not open for bhx after clicking Mua/cart
  121 |             `Order form did not open for ${storeCase.chain} after clicking Mua/cart`
  122 |         );
  123 |     }
  124 | 
  125 |     async increaseQuantityUntilMinTotal(
  126 |         minTotal: number,
  127 |         maxQuantity = 12
  128 |     ): Promise<void> {
  129 |         for (let quantity = 1; quantity < maxQuantity; quantity += 1) {
  130 |             const currentTotal = await this.currentVisibleTotal();
  131 | 
  132 |             if (currentTotal !== undefined && currentTotal >= minTotal) {
  133 |                 return;
  134 |             }
  135 | 
  136 |             const increaseButton = this.page
  137 |                 .getByRole('button', { name: /tang|tăng|\+/i })
  138 |                 .first();
  139 |             const canIncrease = await increaseButton.isVisible().catch(() => false);
  140 | 
  141 |             if (!canIncrease) {
  142 |                 return;
  143 |             }
  144 | 
  145 |             await increaseButton.click();
  146 |         }
  147 |     }
  148 | 
  149 |     async attachFilledFormScreenshot(
  150 |         testInfo: TestInfo,
  151 |         chain: string
  152 |     ): Promise<void> {
  153 |         await testInfo.attach(`${chain}-form-filled`, {
  154 |             body: await this.page.screenshot({ fullPage: true }),
  155 |             contentType: 'image/png',
  156 |         });
  157 |     }
  158 | 
  159 |     private async fillField(field: OrderFormField, value: string): Promise<void> {
  160 |         const input = this.fieldLocator(field);
  161 | 
  162 |         await expect(input).toBeVisible({ timeout: 30_000 });
  163 | 
  164 |         if (field.kind === 'select') {
  165 |             await this.selectField(input, value);
  166 |             return;
  167 |         }
  168 | 
  169 |         await input.fill(value);
  170 |     }
  171 | 
  172 |     private fieldLocator(field: OrderFormField): Locator {
  173 |         const placeholderPattern = fieldPlaceholderPattern(field);
  174 |         const controls = 'input, textarea, select, [role="combobox"]';
  175 |         const directControls =
  176 |             ':scope > input, :scope > textarea, :scope > select, :scope > [role="combobox"]';
  177 | 
  178 |         return this.page
  179 |             .getByLabel(field.label)
  180 |             .or(this.page.getByRole('textbox', { name: field.label }))
  181 |             .or(this.page.getByRole('combobox', { name: field.label }))
  182 |             .or(this.page.getByPlaceholder(placeholderPattern))
  183 |             .or(
  184 |                 this.page
  185 |                     .locator('label', { hasText: field.label })
  186 |                     .locator(controls)
  187 |             )
  188 |             .or(
  189 |                 this.page
  190 |                     .locator('div', { hasText: field.label })
  191 |                     .locator(directControls)
  192 |             )
  193 |             .first();
  194 |     }
  195 | 
  196 |     private async selectField(locator: Locator, value: string): Promise<void> {
  197 |         const tagName = await locator.evaluate(element =>
  198 |             element.tagName.toLowerCase()
  199 |         );
  200 | 
  201 |         if (tagName === 'select') {
  202 |             await locator.selectOption({ label: value }).catch(async () => {
  203 |                 await locator.selectOption(value);
  204 |             });
  205 |             return;
  206 |         }
  207 | 
  208 |         await locator.click();
  209 |         await locator.fill(value).catch(() => undefined);
  210 | 
  211 |         const option = this.page
  212 |             .getByRole('option', { name: new RegExp(value, 'i') })
  213 |             .or(this.page.getByText(new RegExp(value, 'i')))
  214 |             .first();
  215 | 
  216 |         if (await option.isVisible({ timeout: 5_000 }).catch(() => false)) {
  217 |             await option.click();
  218 |         }
  219 |     }
  220 | 
```