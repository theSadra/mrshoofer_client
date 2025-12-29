-- Database Backup SQL
-- Generated: 2025-12-29T09:58:14.928Z

-- Passengers
INSERT INTO "Passenger" ("Firstname", "Lastname", "NumberPhone", "NaCode") VALUES ('ت*ست ', 'احمدی', '09123036963', '12378902') ON CONFLICT ("NumberPhone") DO NOTHING;
INSERT INTO "Passenger" ("Firstname", "Lastname", "NumberPhone", "NaCode") VALUES ('محمد', 'وفاداری', '09192330969', '1373599863') ON CONFLICT ("NumberPhone") DO NOTHING;
INSERT INTO "Passenger" ("Firstname", "Lastname", "NumberPhone", "NaCode") VALUES ('لیلا', 'عباس زاده', '09021003527', '0061637610') ON CONFLICT ("NumberPhone") DO NOTHING;
INSERT INTO "Passenger" ("Firstname", "Lastname", "NumberPhone", "NaCode") VALUES ('ابوالفضل', 'دهقان منشادی', '09130999039', '4420433345') ON CONFLICT ("NumberPhone") DO NOTHING;
INSERT INTO "Passenger" ("Firstname", "Lastname", "NumberPhone", "NaCode") VALUES ('سید علی محمد', 'نورانی', '09933822397', '1284956611') ON CONFLICT ("NumberPhone") DO NOTHING;

-- Drivers
INSERT INTO "Driver" ("Firstname", "Lastname", "PhoneNumber", "CarName") VALUES (' تست', 'تست', '09123036963', 'سمند');

