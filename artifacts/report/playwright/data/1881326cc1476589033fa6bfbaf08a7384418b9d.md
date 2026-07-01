# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e\order\flow-order.spec.ts >> @flow-order @coop Co.op order flow >> @coop should continue through Co.op checkout handoff
- Location: tests\e2e\order\flow-order.spec.ts:1104:9

# Error details

```
Error: Could not find the first Coop delivery store
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
          - button "📍 TRÁI CÂY NỘI NGOẠI NHÃP, 246 Nguyễn Trọng Tuyển, Phường 8, Quận Phú Nhuận, Thành Phố Hồ Chí Minh" [ref=e28]:
            - generic [ref=e29]: 📍
            - generic [ref=e31]:
              - generic [ref=e32]: TRÁI CÂY NỘI NGOẠI NHÃP, 246 Nguyễn Trọng Tuyển, Phường 8, Quận Phú Nhuận, Thành Phố Hồ Chí Minh
              - generic [ref=e33]: TRÁI CÂY NỘI NGOẠI NHÃP, 246 Nguyễn Trọng Tuyển, Phường 8, Quận Phú Nhuận, Thành Phố Hồ Chí Minh
          - button "Giỏ hàng" [ref=e34]:
            - img [ref=e36]
          - link "Lịch sử mua" [ref=e40] [cursor=pointer]:
            - /url: /history
            - img [ref=e41]
          - button "🛒 Mua hàng TXNN" [ref=e44]
    - main [ref=e45]:
      - generic [ref=e47]:
        - button "← Tất cả kết quả" [ref=e48]
        - generic [ref=e49]:
          - generic [ref=e50]:
            - generic [ref=e51]:
              - generic [ref=e53]:
                - heading "Sữa tươi Vinamilk có đường 1L Xem thông tin & chứng nhận" [level=2] [ref=e54]:
                  - generic [ref=e55]: Sữa tươi Vinamilk có đường 1L
                  - button "Xem thông tin & chứng nhận" [ref=e56]:
                    - img [ref=e57]
                - paragraph [ref=e59]: Vinamilk · Hộp 1L · 5 cửa hàng
              - button "Báo giá giảm" [ref=e61]:
                - img [ref=e62]
                - generic [ref=e65]: Báo giá giảm
            - generic [ref=e66]:
              - generic [ref=e67]: 💰
              - generic [ref=e68]: Rẻ hơn 10.000₫ nếu mua ở Co.opmart Đinh Tiên Hoàng
            - generic [ref=e69]:
              - generic [ref=e70]: Sắp xếp theo
              - generic [ref=e71]:
                - button "Giá rẻ" [ref=e72]:
                  - img [ref=e73]
                  - text: Giá rẻ
                - button "Gần nhất" [ref=e76]:
                  - img [ref=e77]
                  - text: Gần nhất
            - list [ref=e80]:
              - listitem [ref=e81]:
                - generic:
                  - generic: Rẻ nhất
                - generic [ref=e82]:
                  - generic [ref=e84]:
                    - generic [ref=e85]:
                      - generic "Co.opmart" [ref=e86]:
                        - img "Co.opmart" [ref=e87]
                      - generic [ref=e88]:
                        - generic [ref=e89]: Co.opmart Đinh Tiên Hoàng
                        - generic [ref=e90]: 127 Đinh Tiên Hoàng, Bình Thạnh
                        - generic [ref=e91]:
                          - generic [ref=e92]: Còn hàng
                          - generic [ref=e94]: ·
                          - generic [ref=e95]:
                            - img [ref=e96]
                            - text: cách bạn 3.3 km
                          - link "Chỉ đường" [ref=e99] [cursor=pointer]:
                            - /url: https://www.google.com/maps/dir/?api=1&destination=10.799,106.7035
                            - img [ref=e100]
                            - text: Chỉ đường
                        - generic [ref=e102]: (7h34 ngày 22/6/2026)
                    - generic [ref=e103]:
                      - generic [ref=e105]:
                        - img [ref=e106]
                        - text: 37.500₫
                      - generic [ref=e109]:
                        - button "Mua ngay" [ref=e110]:
                          - img [ref=e111]
                          - text: Mua ngay
                        - button "Thêm vào giỏ" [ref=e115]: +
                  - button "1 chi nhánh khác" [ref=e116]:
                    - img [ref=e117]
                    - text: 1 chi nhánh khác
              - listitem [ref=e119]:
                - generic:
                  - generic:
                    - img
                    - text: Gần nhất
                - generic [ref=e120]:
                  - generic [ref=e122]:
                    - generic [ref=e123]:
                      - generic "Bách Hóa Xanh" [ref=e124]:
                        - img "Bách Hóa Xanh" [ref=e125]
                      - generic [ref=e126]:
                        - generic [ref=e127]: Bách Hóa Xanh Cách Mạng Tháng 8
                        - generic [ref=e128]: 456 CMT8, Quận 3
                        - generic [ref=e129]:
                          - generic [ref=e130]: Còn hàng
                          - generic [ref=e132]: ·
                          - generic [ref=e133]:
                            - img [ref=e134]
                            - text: cách bạn 2.0 km
                          - link "Chỉ đường" [ref=e137] [cursor=pointer]:
                            - /url: https://www.google.com/maps/dir/?api=1&destination=10.782,106.681
                            - img [ref=e138]
                            - text: Chỉ đường
                        - generic [ref=e140]: (7h ngày 18/6/2026)
                    - generic [ref=e141]:
                      - generic [ref=e142]:
                        - generic [ref=e143]:
                          - img [ref=e144]
                          - text: 47.500₫
                        - generic [ref=e147]: Chênh 10.000₫
                      - generic [ref=e148]:
                        - button "Mua ngay" [ref=e149]:
                          - img [ref=e150]
                          - text: Mua ngay
                        - button "Thêm vào giỏ" [ref=e154]: +
                  - button "2 chi nhánh khác" [ref=e155]:
                    - img [ref=e156]
                    - text: 2 chi nhánh khác
            - generic [ref=e158]:
              - generic [ref=e159]:
                - generic [ref=e160]:
                  - img [ref=e161]
                  - text: Bán kính
                - button "50m" [ref=e164]
                - button "100m" [ref=e165]
                - button "150m" [ref=e166]
                - button "300m" [ref=e167]
                - button "500m" [ref=e168]
                - button "700m" [ref=e169]
                - button "1km" [ref=e170]
              - generic [ref=e172]:
                - generic [ref=e173]:
                  - generic:
                    - generic:
                      - button "TRÁI CÂY NỘI NGOẠI NHÃP, 246 Nguyễn Trọng Tuyển, Phường 8, Quận Phú Nhuận, Thành Phố Hồ Chí Minh" [ref=e174] [cursor=pointer]
                      - button "RẺ NHẤT" [ref=e176] [cursor=pointer]:
                        - generic [ref=e177]:
                          - img [ref=e178]
                          - generic [ref=e180]: RẺ NHẤT
                      - button [ref=e181] [cursor=pointer]:
                        - img [ref=e183]
                      - button "GẦN NHẤT" [ref=e184] [cursor=pointer]:
                        - generic [ref=e185]:
                          - img [ref=e186]
                          - generic [ref=e188]: GẦN NHẤT
                      - button [ref=e189] [cursor=pointer]:
                        - img [ref=e191]
                      - button [ref=e192] [cursor=pointer]:
                        - img [ref=e194]
                  - generic:
                    - generic:
                      - generic [ref=e195]:
                        - button "Zoom in" [ref=e196] [cursor=pointer]: +
                        - button "Zoom out" [ref=e197] [cursor=pointer]: −
                      - generic [ref=e199]:
                        - text: © One Solution |
                        - link "OSM" [ref=e200] [cursor=pointer]:
                          - /url: https://www.openstreetmap.org/
                - button "Về vị trí của tôi" [ref=e201] [cursor=pointer]:
                  - img [ref=e202]
                - generic [ref=e205]:
                  - button "Ẩn chú thích" [ref=e206] [cursor=pointer]:
                    - img [ref=e207]
                  - generic [ref=e209]:
                    - generic [ref=e210]: Vị trí của bạn
                    - generic [ref=e212]:
                      - generic [ref=e213]: "Cửa hàng (bấm để bật/tắt):"
                      - button "Co.opmart (2)" [ref=e214] [cursor=pointer]:
                        - img [ref=e215]
                        - generic [ref=e218]: Co.opmart
                        - generic [ref=e219]: (2)
                      - button "Bách Hóa Xanh (3)" [ref=e220] [cursor=pointer]:
                        - img [ref=e221]
                        - generic [ref=e224]: Bách Hóa Xanh
                        - generic [ref=e225]: (3)
                    - generic [ref=e226]:
                      - generic [ref=e227]: RẺ NHẤT
                      - text: Nơi bán giá thấp nhất
                    - generic [ref=e228]:
                      - generic [ref=e229]: GẦN NHẤT
                      - text: Cửa hàng gần bạn nhất
          - complementary [ref=e230]:
            - heading "Sản phẩm tương tự" [level=3] [ref=e231]
            - generic [ref=e232]:
              - button "Dầu ăn Neptune Light 1L 58.500₫" [ref=e233]:
                - generic [ref=e234]:
                  - generic [ref=e235]: Dầu ăn Neptune Light 1L
                  - generic [ref=e236]: 58.500₫
              - button "Nước mắm Nam Ngư 900ml 52.800₫" [ref=e237]:
                - generic [ref=e238]:
                  - generic [ref=e239]: Nước mắm Nam Ngư 900ml
                  - generic [ref=e240]: 52.800₫
              - button "Mì Hảo Hảo tôm chua cay 75g 4.000₫" [ref=e241]:
                - generic [ref=e242]:
                  - generic [ref=e243]: Mì Hảo Hảo tôm chua cay 75g
                  - generic [ref=e244]: 4.000₫
              - button "Đường trắng Biên Hòa 1kg 27.200₫" [ref=e245]:
                - generic [ref=e246]:
                  - generic [ref=e247]: Đường trắng Biên Hòa 1kg
                  - generic [ref=e248]: 27.200₫
              - button "Mì Omachi sườn hầm 80g 8.200₫" [ref=e249]:
                - generic [ref=e250]:
                  - generic [ref=e251]: Mì Omachi sườn hầm 80g
                  - generic [ref=e252]: 8.200₫
              - button "Sữa đặc Ông Thọ lon 380g 27.700₫" [ref=e253]:
                - generic [ref=e254]:
                  - generic [ref=e255]: Sữa đặc Ông Thọ lon 380g
                  - generic [ref=e256]: 27.700₫
              - button "Sữa chua uống Yakult lốc 5 x 65ml 25.900₫" [ref=e257]:
                - generic [ref=e258]:
                  - generic [ref=e259]: Sữa chua uống Yakult lốc 5 x 65ml
                  - generic [ref=e260]: 25.900₫
              - button "Bột ngọt Ajinomoto 454g 33.000₫" [ref=e261]:
                - generic [ref=e262]:
                  - generic [ref=e263]: Bột ngọt Ajinomoto 454g
                  - generic [ref=e264]: 33.000₫
              - button "Hạt nêm Knorr thịt thăn 900g 72.000₫" [ref=e265]:
                - generic [ref=e266]:
                  - generic [ref=e267]: Hạt nêm Knorr thịt thăn 900g
                  - generic [ref=e268]: 72.000₫
              - button "Gạo thơm đặc sản ST25 Neptune 5kg 210.000₫" [ref=e269]:
                - generic [ref=e270]:
                  - generic [ref=e271]: Gạo thơm đặc sản ST25 Neptune 5kg
                  - generic [ref=e272]: 210.000₫
    - contentinfo [ref=e273]:
      - generic [ref=e274]:
        - generic [ref=e275]:
          - link "One Solution" [ref=e276] [cursor=pointer]:
            - /url: https://one-solution.vn
            - img "One Solution" [ref=e277]
          - paragraph [ref=e278]:
            - text: © 2026 Affree — sản phẩm của
            - link "One Solution" [ref=e279] [cursor=pointer]:
              - /url: https://one-solution.vn
            - text: .
            - text: Kết nối mua bán - Không thu phí
            - text: Tìm gì cũng có - Giá hời quanh đây
        - paragraph [ref=e280]: "Giá & thông tin được tổng hợp từ nguồn công khai, có thể thay đổi theo thời gian. Hình ảnh, logo và thương hiệu thuộc về chủ sở hữu tương ứng; Affree là dịch vụ so sánh giá & điều hướng mua hàng. Yêu cầu gỡ nội dung: liên hệ One Solution."
    - dialog [ref=e281]:
      - generic [ref=e282]:
        - generic [ref=e283]:
          - generic [ref=e284]:
            - heading "Đặt hàng Co.op" [level=2] [ref=e285]
            - paragraph [ref=e286]: Sữa tươi Vinamilk có đường 1L · Co.opmart
          - button "Đóng" [ref=e287]:
            - img [ref=e288]
        - generic [ref=e292]:
          - generic [ref=e294]:
            - generic [ref=e295]: "1"
            - generic [ref=e296]:
              - paragraph [ref=e297]: Sữa tươi Vinamilk có đường 1L
              - paragraph [ref=e298]: Co.opmart Đinh Tiên Hoàng · 37.500₫
          - list [ref=e299]:
            - listitem [ref=e300]:
              - generic [ref=e302]: "1"
              - generic [ref=e303]: Nhập tài khoản và địa chỉ
            - listitem [ref=e304]:
              - generic [ref=e307]: Nhập OTP nếu Co.op gửi
            - listitem [ref=e308]:
              - generic [ref=e311]: Chọn ngày và khung giờ
            - listitem [ref=e312]:
              - generic [ref=e315]: Chọn phương thức thanh toán
            - listitem [ref=e316]:
              - generic [ref=e319]: Xác nhận đặt hàng
          - generic [ref=e320]:
            - paragraph [ref=e321]: Thông tin Co.op
            - generic [ref=e322]:
              - generic [ref=e323]:
                - generic [ref=e324]: Người nhận
                - textbox "Người nhận" [ref=e325]:
                  - /placeholder: Họ và tên
                  - text: Trách
              - generic [ref=e326]:
                - generic [ref=e327]: Số điện thoại
                - textbox "Số điện thoại" [ref=e328]:
                  - /placeholder: "VD: 0901234567"
                  - text: "0989346877"
            - generic [ref=e329]:
              - generic [ref=e330]: Mật khẩu Co.op
              - textbox "Mật khẩu Co.op" [ref=e331]:
                - /placeholder: Mật khẩu tài khoản Co.op
                - text: Y@ngkul549
            - generic [ref=e332]:
              - generic [ref=e333]:
                - generic [ref=e334]: Tỉnh/Thành phố
                - combobox "Tỉnh/Thành phố" [ref=e335]:
                  - option "Chọn tỉnh/thành phố"
                  - option "Thành phố Hà Nội"
                  - option "Thành phố Hồ Chí Minh" [selected]
                  - option "Thành phố Đà Nẵng"
                  - option "Tỉnh An Giang"
                  - option "Tỉnh Bà Rịa - Vũng Tàu"
                  - option "Tỉnh Bắc Giang"
                  - option "Tỉnh Bắc Kạn"
                  - option "Tỉnh Bạc Liêu"
                  - option "Tỉnh Bắc Ninh"
                  - option "Tỉnh Bến Tre"
                  - option "Tỉnh Bình Định"
                  - option "Tỉnh Bình Dương"
                  - option "Tỉnh Bình Phước"
                  - option "Tỉnh Bình Thuận"
                  - option "Tỉnh Cà Mau"
                  - option "Thành phố Cần Thơ"
                  - option "Tỉnh Cao Bằng"
                  - option "Tỉnh Đắk Lắk"
                  - option "Tỉnh Đắk Nông"
                  - option "Tỉnh Điện Biên"
                  - option "Thành phố Đồng Nai"
                  - option "Tỉnh Đồng Tháp"
                  - option "Tỉnh Gia Lai"
                  - option "Tỉnh Hà Giang"
                  - option "Tỉnh Hà Nam"
                  - option "Tỉnh Hà Tĩnh"
                  - option "Tỉnh Hải Dương"
                  - option "Thành phố Hải Phòng"
                  - option "Tỉnh Hậu Giang"
                  - option "Tỉnh Hoà Bình"
                  - option "Thành phố Huế"
                  - option "Tỉnh Hưng Yên"
                  - option "Tỉnh Khánh Hòa"
                  - option "Tỉnh Kiên Giang"
                  - option "Tỉnh Kon Tum"
                  - option "Tỉnh Lai Châu"
                  - option "Tỉnh Lâm Đồng"
                  - option "Tỉnh Lạng Sơn"
                  - option "Tỉnh Lào Cai"
                  - option "Tỉnh Long An"
                  - option "Tỉnh Nam Định"
                  - option "Tỉnh Nghệ An"
                  - option "Tỉnh Ninh Bình"
                  - option "Tỉnh Ninh Thuận"
                  - option "Tỉnh Phú Thọ"
                  - option "Tỉnh Phú Yên"
                  - option "Tỉnh Quảng Bình"
                  - option "Tỉnh Quảng Nam"
                  - option "Tỉnh Quảng Ngãi"
                  - option "Tỉnh Quảng Ninh"
                  - option "Tỉnh Quảng Trị"
                  - option "Tỉnh Sóc Trăng"
                  - option "Tỉnh Sơn La"
                  - option "Tỉnh Tây Ninh"
                  - option "Tỉnh Thái Bình"
                  - option "Tỉnh Thái Nguyên"
                  - option "Tỉnh Thanh Hóa"
                  - option "Tỉnh Tiền Giang"
                  - option "Tỉnh Trà Vinh"
                  - option "Tỉnh Tuyên Quang"
                  - option "Tỉnh Vĩnh Long"
                  - option "Tỉnh Vĩnh Phúc"
                  - option "Tỉnh Yên Bái"
              - generic [ref=e336]:
                - generic [ref=e337]: Quận/Huyện
                - combobox "Quận/Huyện" [ref=e338]:
                  - option "Chọn quận/huyện"
                  - option "Huyện Bình Chánh"
                  - option "Huyện Cần Giờ"
                  - option "Huyện Củ Chi"
                  - option "Huyện Hóc Môn"
                  - option "Huyện Nhà Bè"
                  - option "Quận 1"
                  - option "Quận 3"
                  - option "Quận 4"
                  - option "Quận 5"
                  - option "Quận 6"
                  - option "Quận 7"
                  - option "Quận 8"
                  - option "Quận 10"
                  - option "Quận 11"
                  - option "Quận 12"
                  - option "Quận Bình Tân"
                  - option "Quận Bình Thạnh"
                  - option "Quận Gò Vấp"
                  - option "Quận Phú Nhuận" [selected]
                  - option "Quận Tân Bình"
                  - option "Quận Tân Phú"
                  - option "Thành phố Thủ Đức"
              - generic [ref=e339]:
                - generic [ref=e340]: Phường/Xã
                - combobox "Phường/Xã" [ref=e341]:
                  - option "Chọn phường/xã"
                  - option "Phường 01" [selected]
                  - option "Phường 02"
                  - option "Phường 03"
                  - option "Phường 04"
                  - option "Phường 05"
                  - option "Phường 07"
                  - option "Phường 08"
                  - option "Phường 09"
                  - option "Phường 10"
                  - option "Phường 11"
                  - option "Phường 13"
                  - option "Phường 15"
                  - option "Phường 17"
              - generic [ref=e342]:
                - generic [ref=e343]: Số nhà, tên đường
                - textbox "Số nhà, tên đường" [active] [ref=e344]:
                  - /placeholder: "VD: 17 Đống Đa"
                  - text: 246 Nguyễn Trọng Tuyển
            - button "Cập nhật lại cửa hàng gần nhất" [ref=e345]
            - generic [ref=e346]:
              - generic [ref=e347]:
                - paragraph [ref=e348]: Cửa hàng Co.op gần địa chỉ giao
                - generic [ref=e349]: 23 cửa hàng
              - generic [ref=e350]:
                - button "Co.opmart Nguyễn Kiệm 573 Đ. Nguyễn Kiệm, Phường 09, Quận Phú Nhuận, Thành phố Hồ Chí Minh 1.9 km" [ref=e351]:
                  - generic [ref=e352]:
                    - generic [ref=e353]:
                      - generic [ref=e354]: Co.opmart Nguyễn Kiệm
                      - generic [ref=e355]: 573 Đ. Nguyễn Kiệm, Phường 09, Quận Phú Nhuận, Thành phố Hồ Chí Minh
                    - generic [ref=e356]: 1.9 km
                - button "Co.opmart Rạch Miễu 48 Hoa Sứ, Phường 07, Quận Phú Nhuận, Thành phố Hồ Chí Minh 2.1 km" [ref=e357]:
                  - generic [ref=e358]:
                    - generic [ref=e359]:
                      - generic [ref=e360]: Co.opmart Rạch Miễu
                      - generic [ref=e361]: 48 Hoa Sứ, Phường 07, Quận Phú Nhuận, Thành phố Hồ Chí Minh
                    - generic [ref=e362]: 2.1 km
                - button "Co.opmart Nhiêu Lộc Tầng trệt cao ốc SCREC, Số 974A TP, 974 Đ. Trường Sa, Phường 12, Quận 3, Thành phố Hồ Chí Minh 2.8 km" [ref=e363]:
                  - generic [ref=e364]:
                    - generic [ref=e365]:
                      - generic [ref=e366]: Co.opmart Nhiêu Lộc
                      - generic [ref=e367]: Tầng trệt cao ốc SCREC, Số 974A TP, 974 Đ. Trường Sa, Phường 12, Quận 3, Thành phố Hồ Chí Minh
                    - generic [ref=e368]: 2.8 km
                - button "Co.opmart Nguyễn Đình Chiểu 168 Nguyễn Đình Chiểu, Phường Võ Thị Sáu, Quận 3, Thành phố Hồ Chí Minh 3.1 km" [ref=e369]:
                  - generic [ref=e370]:
                    - generic [ref=e371]:
                      - generic [ref=e372]: Co.opmart Nguyễn Đình Chiểu
                      - generic [ref=e373]: 168 Nguyễn Đình Chiểu, Phường Võ Thị Sáu, Quận 3, Thành phố Hồ Chí Minh
                    - generic [ref=e374]: 3.1 km
                - button "Finelife FOODSTORE Hà Đô 200 3 THÁNG 2, Phường 12, Quận 10, Thành phố Hồ Chí Minh 4.0 km" [ref=e375]:
                  - generic [ref=e376]:
                    - generic [ref=e377]:
                      - generic [ref=e378]: Finelife FOODSTORE Hà Đô
                      - generic [ref=e379]: 200 3 THÁNG 2, Phường 12, Quận 10, Thành phố Hồ Chí Minh
                    - generic [ref=e380]: 4.0 km
                - button "Co.opmart Chu Văn An 241A Chu Văn An, Phường 12, Quận Bình Thạnh, Thành phố Hồ Chí Minh 4.2 km" [ref=e381]:
                  - generic [ref=e382]:
                    - generic [ref=e383]:
                      - generic [ref=e384]: Co.opmart Chu Văn An
                      - generic [ref=e385]: 241A Chu Văn An, Phường 12, Quận Bình Thạnh, Thành phố Hồ Chí Minh
                    - generic [ref=e386]: 4.2 km
                - button "Co.opmart Sca Cao Thắng 181 Đ. Cao Thắng, Phường 12, Quận 10, Thành phố Hồ Chí Minh 4.5 km" [ref=e387]:
                  - generic [ref=e388]:
                    - generic [ref=e389]:
                      - generic [ref=e390]: Co.opmart Sca Cao Thắng
                      - generic [ref=e391]: 181 Đ. Cao Thắng, Phường 12, Quận 10, Thành phố Hồ Chí Minh
                    - generic [ref=e392]: 4.5 km
                - button "Co.opmart Cống Quỳnh 189c Cống Quỳnh, Phường Nguyễn Cư Trinh, Quận 1, Thành phố Hồ Chí Minh 4.7 km" [ref=e393]:
                  - generic [ref=e394]:
                    - generic [ref=e395]:
                      - generic [ref=e396]: Co.opmart Cống Quỳnh
                      - generic [ref=e397]: 189c Cống Quỳnh, Phường Nguyễn Cư Trinh, Quận 1, Thành phố Hồ Chí Minh
                    - generic [ref=e398]: 4.7 km
                - button "Co.opmart Phan Văn Trị 543/1 Đ. Phan Văn Trị, Phường 01, Quận Gò Vấp, Thành phố Hồ Chí Minh 4.8 km" [ref=e399]:
                  - generic [ref=e400]:
                    - generic [ref=e401]:
                      - generic [ref=e402]: Co.opmart Phan Văn Trị
                      - generic [ref=e403]: 543/1 Đ. Phan Văn Trị, Phường 01, Quận Gò Vấp, Thành phố Hồ Chí Minh
                    - generic [ref=e404]: 4.8 km
                - button "Co.opXtra Vạn Hạnh 11 Đ. Sư Vạn Hạnh, Phường 12, Quận 10, Thành phố Hồ Chí Minh 5.3 km" [ref=e405]:
                  - generic [ref=e406]:
                    - generic [ref=e407]:
                      - generic [ref=e408]: Co.opXtra Vạn Hạnh
                      - generic [ref=e409]: 11 Đ. Sư Vạn Hạnh, Phường 12, Quận 10, Thành phố Hồ Chí Minh
                    - generic [ref=e410]: 5.3 km
                - button "Co.opmart Phú Thọ Chung cư Phú Thọ - Khu B, Khu A, Nguyễn Thị Nhỏ, Phường 15, Quận 11, Thành phố Hồ Chí Minh 5.4 km" [ref=e411]:
                  - generic [ref=e412]:
                    - generic [ref=e413]:
                      - generic [ref=e414]: Co.opmart Phú Thọ
                      - generic [ref=e415]: Chung cư Phú Thọ - Khu B, Khu A, Nguyễn Thị Nhỏ, Phường 15, Quận 11, Thành phố Hồ Chí Minh
                    - generic [ref=e416]: 5.4 km
                - button "Co.opmart Văn Thánh Tòa nhà Pearl Plaza, 561A Điện Biên Phủ, Phường 25, Quận Bình Thạnh, Thành phố Hồ Chí Minh 6.1 km" [ref=e417]:
                  - generic [ref=e418]:
                    - generic [ref=e419]:
                      - generic [ref=e420]: Co.opmart Văn Thánh
                      - generic [ref=e421]: Tòa nhà Pearl Plaza, 561A Điện Biên Phủ, Phường 25, Quận Bình Thạnh, Thành phố Hồ Chí Minh
                    - generic [ref=e422]: 6.1 km
                - button "Co.opmart Thắng Lợi 2 Đ. Trường Chinh, Phường Tây Thạnh, Quận Tân Phú, Thành phố Hồ Chí Minh 6.4 km" [ref=e423]:
                  - generic [ref=e424]:
                    - generic [ref=e425]:
                      - generic [ref=e426]: Co.opmart Thắng Lợi
                      - generic [ref=e427]: 2 Đ. Trường Chinh, Phường Tây Thạnh, Quận Tân Phú, Thành phố Hồ Chí Minh
                    - generic [ref=e428]: 6.4 km
                - button "Co.opmart Foodcosa 304A Đ. Quang Trung, Phường 11, Quận Gò Vấp, Thành phố Hồ Chí Minh 6.6 km" [ref=e429]:
                  - generic [ref=e430]:
                    - generic [ref=e431]:
                      - generic [ref=e432]: Co.opmart Foodcosa
                      - generic [ref=e433]: 304A Đ. Quang Trung, Phường 11, Quận Gò Vấp, Thành phố Hồ Chí Minh
                    - generic [ref=e434]: 6.6 km
                - button "Co.opmart Lý Thường Kiệt 497 Hòa Hảo, Phường 06, Quận 10, Thành phố Hồ Chí Minh 6.6 km" [ref=e435]:
                  - generic [ref=e436]:
                    - generic [ref=e437]:
                      - generic [ref=e438]: Co.opmart Lý Thường Kiệt
                      - generic [ref=e439]: 497 Hòa Hảo, Phường 06, Quận 10, Thành phố Hồ Chí Minh
                    - generic [ref=e440]: 6.6 km
                - button "Co.opXtra Phạm Văn Đồng Tp, 240 - 242, TTTM Sense City, P, 3 Đ. Phạm Văn Đồng, Phường Hiệp Bình Chánh, Thành phố Thủ Đức, Thành phố Hồ Chí Minh 7.5 km" [ref=e441]:
                  - generic [ref=e442]:
                    - generic [ref=e443]:
                      - generic [ref=e444]: Co.opXtra Phạm Văn Đồng
                      - generic [ref=e445]: Tp, 240 - 242, TTTM Sense City, P, 3 Đ. Phạm Văn Đồng, Phường Hiệp Bình Chánh, Thành phố Thủ Đức, Thành phố Hồ Chí Minh
                    - generic [ref=e446]: 7.5 km
                - button "Co.opmart Hoà Bình 175 Đ. Hòa Bình, Phường Hiệp Tân, Quận Tân Phú, Thành phố Hồ Chí Minh 7.9 km" [ref=e447]:
                  - generic [ref=e448]:
                    - generic [ref=e449]:
                      - generic [ref=e450]: Co.opmart Hoà Bình
                      - generic [ref=e451]: 175 Đ. Hòa Bình, Phường Hiệp Tân, Quận Tân Phú, Thành phố Hồ Chí Minh
                    - generic [ref=e452]: 7.9 km
                - button "Co.opmart Phú Lâm 6 Bà Hom, Phường 14, Quận 6, Thành phố Hồ Chí Minh 8.2 km" [ref=e453]:
                  - generic [ref=e454]:
                    - generic [ref=e455]:
                      - generic [ref=e456]: Co.opmart Phú Lâm
                      - generic [ref=e457]: 6 Bà Hom, Phường 14, Quận 6, Thành phố Hồ Chí Minh
                    - generic [ref=e458]: 8.2 km
                - button "Co.opmart Phan Văn Hớn 102 Phan Văn Hớn, Phường Tân Thới Nhất, Quận 12, Thành phố Hồ Chí Minh 8.2 km" [ref=e459]:
                  - generic [ref=e460]:
                    - generic [ref=e461]:
                      - generic [ref=e462]: Co.opmart Phan Văn Hớn
                      - generic [ref=e463]: 102 Phan Văn Hớn, Phường Tân Thới Nhất, Quận 12, Thành phố Hồ Chí Minh
                    - generic [ref=e464]: 8.2 km
                - button "Co.opmart Hậu Giang 188 Đ. Hậu Giang, Phường 02, Quận 6, Thành phố Hồ Chí Minh 8.4 km" [ref=e465]:
                  - generic [ref=e466]:
                    - generic [ref=e467]:
                      - generic [ref=e468]: Co.opmart Hậu Giang
                      - generic [ref=e469]: 188 Đ. Hậu Giang, Phường 02, Quận 6, Thành phố Hồ Chí Minh
                    - generic [ref=e470]: 8.4 km
                - button "Co.opXtra Tạ Quang Bửu 854 - 856 Đ. Tạ Quang Bửu, Phường 05, Quận 8, Thành phố Hồ Chí Minh 9.0 km" [ref=e471]:
                  - generic [ref=e472]:
                    - generic [ref=e473]:
                      - generic [ref=e474]: Co.opXtra Tạ Quang Bửu
                      - generic [ref=e475]: 854 - 856 Đ. Tạ Quang Bửu, Phường 05, Quận 8, Thành phố Hồ Chí Minh
                    - generic [ref=e476]: 9.0 km
                - button "Co.opmart Tuy Lý Vương 40-54 Đ. Tuy Lý Vương, Phường 13, Quận 8, Thành phố Hồ Chí Minh 9.1 km" [ref=e477]:
                  - generic [ref=e478]:
                    - generic [ref=e479]:
                      - generic [ref=e480]: Co.opmart Tuy Lý Vương
                      - generic [ref=e481]: 40-54 Đ. Tuy Lý Vương, Phường 13, Quận 8, Thành phố Hồ Chí Minh
                    - generic [ref=e482]: 9.1 km
                - button "Co.opmart Phạm Thế Hiển 2225 Đ. Phạm Thế Hiển, Phường 06, Quận 8, Thành phố Hồ Chí Minh 11.3 km" [ref=e483]:
                  - generic [ref=e484]:
                    - generic [ref=e485]:
                      - generic [ref=e486]: Co.opmart Phạm Thế Hiển
                      - generic [ref=e487]: 2225 Đ. Phạm Thế Hiển, Phường 06, Quận 8, Thành phố Hồ Chí Minh
                    - generic [ref=e488]: 11.3 km
            - generic [ref=e489]:
              - generic [ref=e490]: Số lượng
              - generic [ref=e491]:
                - button "Số lượng 1 +" [ref=e492]: −
                - generic [ref=e493]: "1"
                - button "+" [ref=e494]
            - generic [ref=e495]:
              - generic [ref=e496]:
                - generic [ref=e497]: Kho Co.op
                - generic [ref=e498]: 160_sgc
              - generic [ref=e499]:
                - generic [ref=e500]: Phương thức thanh toán
                - generic [ref=e501]: Chọn ở bước checkout
              - generic [ref=e502]:
                - generic [ref=e503]: Tạm tính
                - generic [ref=e504]: 37.500₫
            - generic [ref=e505]: Co.op chỉ cho thanh toán khi đơn từ 200.000đ. Tăng số lượng hoặc chọn sản phẩm khác để tiếp tục.
            - button "Đăng nhập Co.op và thêm vào giỏ" [disabled] [ref=e506]
            - paragraph [ref=e507]: Nhập đủ tên, số điện thoại, mật khẩu, xem cửa hàng gần nhất và đảm bảo đơn từ 200.000đ.
```

# Test source

```ts
  401 |         .or(coopmartStoreCard.getByText(/mua|chon mua|chọn mua/i))
  402 |         .first();
  403 | 
  404 |     await expect(buyButton).toBeVisible({ timeout: 30_000 });
  405 |     await buyButton.click();
  406 | 
  407 |     await attachPageState(page, testInfo, 'coop-after-first-coopmart-buy-click');
  408 | }
  409 | 
  410 | async function clickFirstVisible(locator: Locator, timeout = 30_000): Promise<void> {
  411 |     await expect(locator.first()).toBeVisible({ timeout });
  412 |     await locator.first().click();
  413 | }
  414 | 
  415 | async function clickLastVisibleOption(page: Page): Promise<void> {
  416 |     const roleOptions = page.getByRole('option');
  417 |     const optionCount = await roleOptions.count();
  418 | 
  419 |     for (let index = optionCount - 1; index >= 0; index -= 1) {
  420 |         const option = roleOptions.nth(index);
  421 | 
  422 |         if (await option.isVisible().catch(() => false)) {
  423 |             await option.click();
  424 |             return;
  425 |         }
  426 |     }
  427 | 
  428 |     const fallbackOptions = page
  429 |         .locator('[role="listbox"] li, [role="menu"] li, [data-radix-popper-content-wrapper] button, [data-radix-popper-content-wrapper] div')
  430 |         .filter({ hasText: /\S/ });
  431 |     const fallbackCount = await fallbackOptions.count();
  432 | 
  433 |     for (let index = fallbackCount - 1; index >= 0; index -= 1) {
  434 |         const option = fallbackOptions.nth(index);
  435 | 
  436 |         if (await option.isVisible().catch(() => false)) {
  437 |             await option.click();
  438 |             return;
  439 |         }
  440 |     }
  441 | 
  442 |     throw new Error('Could not find a visible Coop delivery date option');
  443 | }
  444 | 
  445 | async function selectLastCoopDeliveryDate(page: Page): Promise<void> {
  446 |     const root = coopFormRoot(page);
  447 |     let dateSelect = root
  448 |         .getByRole('combobox', { name: /chon ngay nhan hang|chọn ngày nhận hàng/i })
  449 |         .first();
  450 | 
  451 |     if ((await dateSelect.count()) === 0) {
  452 |         dateSelect = root.locator('select').first();
  453 |     }
  454 | 
  455 |     if ((await dateSelect.count()) > 0) {
  456 |         const optionCount = await dateSelect.locator('option').count();
  457 | 
  458 |         if (optionCount > 0) {
  459 |             await dateSelect.selectOption({ index: optionCount - 1 }, { force: true });
  460 |             await expect
  461 |                 .poll(
  462 |                     () => dateSelect.evaluate(element => (element as HTMLSelectElement).selectedIndex),
  463 |                     { message: 'Expected Coop delivery date select to move to the last available option' }
  464 |                 )
  465 |                 .toBe(optionCount - 1);
  466 |             return;
  467 |         }
  468 |     }
  469 | 
  470 |     await clickFirstVisible(
  471 |         page
  472 |             .getByRole('button', { name: /chon ngay nhan hang|chọn ngày nhận hàng|\d{2}\/\d{2}\/\d{4}/i })
  473 |             .or(page.getByText(/chon ngay nhan hang|chọn ngày nhận hàng|\d{2}\/\d{2}\/\d{4}/i))
  474 |     );
  475 |     await clickLastVisibleOption(page).catch(() => undefined);
  476 | }
  477 | 
  478 | async function selectFirstCoopDeliveryStore(
  479 |     page: Page,
  480 |     testInfo: TestInfo
  481 | ): Promise<void> {
  482 |     const root = coopFormRoot(page);
  483 |     const storeCandidates = root
  484 |         .locator('button, li, article, [role="option"], [data-testid*="store"], .store-card')
  485 |         .filter({ hasText: /co\.opmart|co\.op|coop/i })
  486 |         .filter({ hasText: /\d+(?:[.,]\d+)?\s*km/i });
  487 |     let storeCandidate: Locator | undefined;
  488 |     const candidateCount = await storeCandidates.count();
  489 | 
  490 |     for (let index = 0; index < candidateCount; index += 1) {
  491 |         const candidate = storeCandidates.nth(index);
  492 | 
  493 |         if (await candidate.isVisible().catch(() => false)) {
  494 |             storeCandidate = candidate;
  495 |             break;
  496 |         }
  497 |     }
  498 | 
  499 |     if (!storeCandidate) {
  500 |         await attachPageState(page, testInfo, 'coop-delivery-store-list-missing');
> 501 |         throw new Error('Could not find the first Coop delivery store');
      |               ^ Error: Could not find the first Coop delivery store
  502 |     }
  503 | 
  504 |     const chooseButton = storeCandidate
  505 |         .getByRole('button', { name: /chon|chọn|mua|select/i })
  506 |         .first();
  507 | 
  508 |     if (await chooseButton.isVisible().catch(() => false)) {
  509 |         await chooseButton.scrollIntoViewIfNeeded();
  510 |         await chooseButton.click({ force: true });
  511 |     } else {
  512 |         await storeCandidate.scrollIntoViewIfNeeded();
  513 |         await storeCandidate.click({ force: true });
  514 |     }
  515 | 
  516 |     await expect
  517 |         .poll(
  518 |             async () => {
  519 |                 const normalizedText = normalizeCoopOptionText(await root.innerText());
  520 | 
  521 |                 return !/dang tim|chua chon/.test(normalizedText);
  522 |             },
  523 |             { message: 'Expected Coop delivery store to be selected' }
  524 |         )
  525 |         .toBeTruthy();
  526 | 
  527 |     await attachPageState(page, testInfo, 'coop-after-first-delivery-store-selected');
  528 | }
  529 | 
  530 | async function visibleCoopSubtotal(page: Page): Promise<number | undefined> {
  531 |     const root = coopFormRoot(page);
  532 |     const subtotalTextbox = root
  533 |         .getByRole('textbox', { name: /tam tinh|tạm tính/i })
  534 |         .first();
  535 | 
  536 |     if (await subtotalTextbox.isVisible().catch(() => false)) {
  537 |         const value = await subtotalTextbox.inputValue().catch(async () =>
  538 |             subtotalTextbox.innerText()
  539 |         );
  540 |         const parsedValue = parseCurrencyValue(value);
  541 | 
  542 |         if (parsedValue !== undefined) {
  543 |             return parsedValue;
  544 |         }
  545 |     }
  546 | 
  547 |     const bodyText = await root.innerText();
  548 |     const subtotalLine = bodyText
  549 |         .split('\n')
  550 |         .find(line => /tam tinh|tạm tính/i.test(line));
  551 | 
  552 |     if (subtotalLine) {
  553 |         const parsedValue = parseCurrencyValue(subtotalLine);
  554 | 
  555 |         if (parsedValue !== undefined) {
  556 |             return parsedValue;
  557 |         }
  558 |     }
  559 | 
  560 |     const priceText = bodyText
  561 |         .split('\n')
  562 |         .filter(line => !/co\.op chi|co\.op chỉ|don tu|đơn từ/i.test(line))
  563 |         .join('\n');
  564 |     const priceMatches = priceText.match(/([\d.,]+)\s*(?:d|đ|₫|vnd)/gi) || [];
  565 |     const totals = priceMatches
  566 |         .map(match => Number(match.replace(/[^\d]/g, '')))
  567 |         .filter(value => Number.isFinite(value));
  568 | 
  569 |     return totals.length > 0 ? Math.max(...totals) : undefined;
  570 | }
  571 | 
  572 | async function increaseCoopQuantityUntilSubtotal(
  573 |     page: Page,
  574 |     minSubtotal: number,
  575 |     maxQuantity = 20
  576 | ): Promise<void> {
  577 |     const root = coopFormRoot(page);
  578 | 
  579 |     for (let quantity = 1; quantity <= maxQuantity; quantity += 1) {
  580 |         const subtotal = await visibleCoopSubtotal(page);
  581 | 
  582 |         if (subtotal !== undefined && subtotal >= minSubtotal) {
  583 |             return;
  584 |         }
  585 | 
  586 |         const increaseButton = root
  587 |             .getByRole('button', { name: /^\+$/ })
  588 |             .or(root.locator('button').filter({ hasText: /^\+$/ }))
  589 |             .first();
  590 | 
  591 |         await expect(increaseButton).toBeVisible({ timeout: 30_000 });
  592 |         await increaseButton.click({ force: true });
  593 |         await expect
  594 |             .poll(
  595 |                 () => visibleCoopSubtotal(page),
  596 |                 { message: 'Expected Coop subtotal to update after increasing quantity' }
  597 |             )
  598 |             .toBeGreaterThan(subtotal || 0);
  599 |     }
  600 | 
  601 |     throw new Error(`Coop subtotal did not reach ${minSubtotal}`);
```