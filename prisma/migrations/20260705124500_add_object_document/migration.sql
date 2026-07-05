CREATE TABLE "kratom_finance_db"."object_document" (
    "id" SERIAL NOT NULL,
    "etag" VARCHAR(255) NOT NULL,
    "bucket" VARCHAR(100),
    "folder1" VARCHAR(100),
    "full_path" VARCHAR(300),
    "file_name" VARCHAR(255) NOT NULL,
    "content_type" VARCHAR(100),
    "content_size" DECIMAL(18, 2),
    "file_extention" VARCHAR(255),
    "object_name" VARCHAR(255),
    "table_name" VARCHAR(200),
    "table_id" INTEGER,
    "table_id2" UUID,
    "created_date" TIMESTAMPTZ(6) DEFAULT NOW() NOT NULL,
    "updated_by" UUID,
    CONSTRAINT "object_document_pkey" PRIMARY KEY ("id")
);

COMMENT ON TABLE "kratom_finance_db"."object_document" IS 'ตารางเก็บข้อมูลของไฟล์เอกสาร';
COMMENT ON COLUMN "kratom_finance_db"."object_document"."etag" IS 'สำหรับระบุที่อยู่ของ object ใน object storage server';
COMMENT ON COLUMN "kratom_finance_db"."object_document"."bucket" IS 'ที่เก็บข้อมูล';
COMMENT ON COLUMN "kratom_finance_db"."object_document"."folder1" IS 'โฟร์เดอร์ไฟล์';
COMMENT ON COLUMN "kratom_finance_db"."object_document"."full_path" IS 'ที่อยู่ของไฟล์';
COMMENT ON COLUMN "kratom_finance_db"."object_document"."file_name" IS 'ชื่อไฟล์.นามสกุลไฟล์';
COMMENT ON COLUMN "kratom_finance_db"."object_document"."content_type" IS 'รุปแบบเนื้อหา';
COMMENT ON COLUMN "kratom_finance_db"."object_document"."content_size" IS 'ขนาดของเนื่อหา';
COMMENT ON COLUMN "kratom_finance_db"."object_document"."file_extention" IS 'นามสกุลไฟล์';
COMMENT ON COLUMN "kratom_finance_db"."object_document"."object_name" IS 'ชื่อ object';
COMMENT ON COLUMN "kratom_finance_db"."object_document"."table_name" IS 'ตารางอ้างอิงการแนบไฟล์';
COMMENT ON COLUMN "kratom_finance_db"."object_document"."table_id" IS 'คีย์ตารางอ้างอิงการแนบไฟล์';
