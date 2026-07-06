Folder structure phải giữ nguyên.

Mọi crawler đều kế thừa BaseCrawler.

Mọi parser đều kế thừa BaseParser.

Mọi Product phải trả về ProductDTO.

Không trả Prisma Model.

Repository phải là Interface trước.

Implementation sau.

Config phải lấy từ config layer.

Không đọc env trực tiếp trong crawler.

Logger phải dùng logger chung.

Không dùng console.log.