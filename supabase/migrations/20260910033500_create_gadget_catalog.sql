/*
# Smart Gadget Recommendation — Catalog Schema

## Overview
Creates the full data model for a smart gadget recommendation website:
categories, gadgets (with specs, pros/cons, use cases), and user-submitted
reviews. Single-tenant (no sign-in) — all data is intentionally public.

## New Tables

### categories
- `id` (uuid, PK)
- `name` (text, unique)
- `slug` (text, unique)
- `description` (text)
- `icon` (text) — lucide-react icon name

### gadgets
- `id` (uuid, PK)
- `name` (text)
- `slug` (text, unique)
- `category_id` (uuid, FK → categories)
- `brand` (text)
- `price` (numeric)
- `rating` (numeric, 0–5)
- `review_count` (int)
- `image_url` (text)
- `tagline` (text)
- `description` (text)
- `specs` (jsonb)
- `pros` (text[])
- `cons` (text[])
- `best_for` (text[])
- `featured` (bool)

### reviews
- `id` (uuid, PK)
- `gadget_id` (uuid, FK → gadgets, cascade delete)
- `author_name` (text)
- `rating` (int, 1–5)
- `title` (text)
- `comment` (text)
- `created_at` (timestamptz)

## Security
- RLS enabled on all three tables.
- All tables allow anon + authenticated full CRUD (single-tenant, public data).

## Notes
1. Indexes on gadgets.category_id and gadgets.slug.
2. Seed data includes 7 categories and 28 gadgets with real specs.
3. Reviews seeded for several gadgets.
*/

-- ── Categories ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text UNIQUE NOT NULL,
  slug        text UNIQUE NOT NULL,
  description text NOT NULL DEFAULT '',
  icon        text NOT NULL DEFAULT 'Cpu'
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_categories" ON categories;
CREATE POLICY "anon_select_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_categories" ON categories;
CREATE POLICY "anon_insert_categories" ON categories FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_categories" ON categories;
CREATE POLICY "anon_update_categories" ON categories FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_categories" ON categories;
CREATE POLICY "anon_delete_categories" ON categories FOR DELETE
  TO anon, authenticated USING (true);

-- ── Gadgets ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gadgets (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  slug         text UNIQUE NOT NULL,
  category_id  uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  brand        text NOT NULL DEFAULT '',
  price        numeric(10,2) NOT NULL DEFAULT 0,
  rating       numeric(2,1) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count int NOT NULL DEFAULT 0,
  image_url    text NOT NULL DEFAULT '',
  tagline      text NOT NULL DEFAULT '',
  description  text NOT NULL DEFAULT '',
  specs        jsonb NOT NULL DEFAULT '{}',
  pros         text[] NOT NULL DEFAULT '{}',
  cons         text[] NOT NULL DEFAULT '{}',
  best_for     text[] NOT NULL DEFAULT '{}',
  featured     boolean NOT NULL DEFAULT false
);

ALTER TABLE gadgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_gadgets" ON gadgets;
CREATE POLICY "anon_select_gadgets" ON gadgets FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_gadgets" ON gadgets;
CREATE POLICY "anon_insert_gadgets" ON gadgets FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_gadgets" ON gadgets;
CREATE POLICY "anon_update_gadgets" ON gadgets FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_gadgets" ON gadgets;
CREATE POLICY "anon_delete_gadgets" ON gadgets FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_gadgets_category_id ON gadgets(category_id);
CREATE INDEX IF NOT EXISTS idx_gadgets_slug ON gadgets(slug);

-- ── Reviews ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gadget_id   uuid NOT NULL REFERENCES gadgets(id) ON DELETE CASCADE,
  author_name text NOT NULL DEFAULT 'Anonymous',
  rating      int NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  title       text NOT NULL DEFAULT '',
  comment     text NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_reviews" ON reviews;
CREATE POLICY "anon_select_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_reviews" ON reviews;
CREATE POLICY "anon_insert_reviews" ON reviews FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_reviews" ON reviews;
CREATE POLICY "anon_update_reviews" ON reviews FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_reviews" ON reviews;
CREATE POLICY "anon_delete_reviews" ON reviews FOR DELETE
  TO anon, authenticated USING (true);

-- ── Seed: Categories ────────────────────────────────────────
INSERT INTO categories (name, slug, description, icon) VALUES
('Smartwatches',  'smartwatches',  'Wearables that track fitness, health, and notifications on your wrist.', 'Watch'),
('Smartphones',   'smartphones',   'Flagship and mid-range phones with cutting-edge cameras and AI features.',  'Smartphone'),
('Wireless Earbuds','wireless-earbuds','Compact audio companions with ANC and all-day battery life.',            'Ear'),
('Smart Home',    'smart-home',    'Connected devices that automate, secure, and simplify your living space.',  'House'),
('Laptops',       'laptops',       'Portable powerhouses for work, creativity, and gaming on the go.',           'Laptop'),
('Tablets',       'tablets',       'Versatile touchscreens for media, note-taking, and light productivity.',     'Tablet'),
('Drones',        'drones',        'Camera-equipped flyers for aerial photography and cinematic video.',         'Plane')
ON CONFLICT (name) DO NOTHING;

-- ── Seed: Gadgets ───────────────────────────────────────────
INSERT INTO gadgets (name, slug, category_id, brand, price, rating, review_count, image_url, tagline, description, specs, pros, cons, best_for, featured)
SELECT 'Apple Watch Ultra 2', 'apple-watch-ultra-2', c.id, 'Apple', 799.00, 4.8, 3120, '', 'The most rugged and capable Apple Watch yet.', 'Built for extreme adventure with a 49mm titanium case, precision dual-frequency GPS, and a 3000-nit display readable in the harshest sunlight. Up to 36 hours of battery life in normal use and 72 hours in low-power mode.', jsonb_build_object('Display', '49mm OLED 3000 nits', 'Case', 'Titanium', 'Battery', '36h normal / 72h low-power', 'Water Resistance', '100m EN13319', 'GPS', 'Dual-frequency L1/L5', 'Storage', '64GB'), ARRAY['Rugged titanium build','Brightest Apple display ever','Exceptional battery life','Precise dual-band GPS'], ARRAY['Expensive','Large on smaller wrists'], ARRAY['Fitness','Outdoor Adventure','Diving'], true FROM categories c WHERE c.slug = 'smartwatches'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gadgets (name, slug, category_id, brand, price, rating, review_count, image_url, tagline, description, specs, pros, cons, best_for, featured)
SELECT 'Samsung Galaxy Watch 6', 'samsung-galaxy-watch-6', c.id, 'Samsung', 299.99, 4.5, 2100, '', 'A refined Wear OS watch with health-first features.', 'A 1.5-inch Super AMOLED display with a slimmer bezel, improved sleep coaching, and BIA body composition analysis. Runs Wear OS with Samsung One UI Watch layer for a smooth, customizable experience.', jsonb_build_object('Display', '1.5in Super AMOLED', 'Case', 'Aluminum', 'Battery', '40h typical', 'Water Resistance', '5 ATM + IP68', 'OS', 'Wear OS 4', 'Health', 'BIA, ECG, SpO2'), ARRAY['Vibrant AMOLED display','Body composition tracking','Customizable bezel','Good app ecosystem'], ARRAY['Battery could be better','Limited to Android phones'], ARRAY['Fitness','Health Tracking','Everyday'], true FROM categories c WHERE c.slug = 'smartwatches'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gadgets (name, slug, category_id, brand, price, rating, review_count, image_url, tagline, description, specs, pros, cons, best_for, featured)
SELECT 'Garmin Fenix 7', 'garmin-fenix-7', c.id, 'Garmin', 699.99, 4.7, 1850, '', 'The ultimate multisport GPS watch for serious athletes.', 'A rugged multisport powerhouse with a built-in flashlight, solar charging option, and weeks of battery life. Advanced training metrics include VO2 max, training readiness, recovery time, and hill score.', jsonb_build_object('Display', '1.3in transflective MIP', 'Case', 'Stainless steel', 'Battery', '18 days / 57 days solar', 'Water Resistance', '10 ATM', 'GPS', 'Multi-band', 'Extras', 'LED flashlight'), ARRAY['Weeks of battery life','Solar charging option','Best-in-class GPS accuracy','Built-in flashlight'], ARRAY['Heavy and bulky','Expensive','MIP display less vivid than OLED'], ARRAY['Fitness','Outdoor Adventure','Trail Running'], false FROM categories c WHERE c.slug = 'smartwatches'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gadgets (name, slug, category_id, brand, price, rating, review_count, image_url, tagline, description, specs, pros, cons, best_for, featured)
SELECT 'Google Pixel Watch 2', 'google-pixel-watch-2', c.id, 'Google', 349.99, 4.3, 980, '', 'Clean Wear OS with deep Fitbit integration.', 'A polished, minimalist smartwatch powered by Wear OS 4 and Fitbit health engine. Continuous ECG, SpO2, and skin temperature tracking, plus all-day battery life and a smooth 60Hz AMOLED display.', jsonb_build_object('Display', '1.2in AMOLED 60Hz', 'Case', 'Recycled aluminum', 'Battery', '24h', 'Water Resistance', '5 ATM', 'OS', 'Wear OS 4', 'Health', 'ECG, SpO2, skin temp'), ARRAY['Sleek minimalist design','Deep Fitbit health integration','Smooth Wear OS experience'], ARRAY['Only one size','No third-party watch faces at launch','Battery life is just one day'], ARRAY['Health Tracking','Everyday','Android Users'], false FROM categories c WHERE c.slug = 'smartwatches'
ON CONFLICT (slug) DO NOTHING;

-- Smartphones
INSERT INTO gadgets (name, slug, category_id, brand, price, rating, review_count, image_url, tagline, description, specs, pros, cons, best_for, featured)
SELECT 'iPhone 15 Pro Max', 'iphone-15-pro-max', c.id, 'Apple', 1199.00, 4.8, 5400, '', 'Titanium design with the A17 Pro chip and 5x telephoto.', 'The first iPhone with a titanium frame and the A17 Pro chip with hardware ray tracing. The 5x tetraprism telephoto camera brings 120mm reach, and USB-C replaces Lightning for universal connectivity.', jsonb_build_object('Display', '6.7in OLED 120Hz', 'Chip', 'A17 Pro', 'Camera', '48MP + 12MP UW + 12MP 5x tele', 'Battery', '29+ hours video', 'Port', 'USB-C 3.0', 'Frame', 'Titanium'), ARRAY['Premium titanium build','Best-in-class A17 Pro chip','5x telephoto camera','USB-C'], ARRAY['Very expensive','Heavy at 221g','Slow USB-C speeds on non-Pro'], ARRAY['Photography','Gaming','Productivity','Premium'], true FROM categories c WHERE c.slug = 'smartphones'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gadgets (name, slug, category_id, brand, price, rating, review_count, image_url, tagline, description, specs, pros, cons, best_for, featured)
SELECT 'Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra', c.id, 'Samsung', 1299.99, 4.7, 4200, '', 'AI-powered flagship with built-in S Pen and 200MP camera.', 'Samsung AI flagship with Galaxy AI features like Live Translate, Circle to Search, and Note Assist. A titanium frame, 6.8-inch QHD+ display, 200MP main camera, and integrated S Pen make it the most versatile Android phone.', jsonb_build_object('Display', '6.8in QHD+ AMOLED 120Hz', 'Chip', 'Snapdragon 8 Gen 3', 'Camera', '200MP + 50MP 5x + 10MP 3x + 12MP UW', 'Battery', '5000mAh', 'S Pen', 'Built-in', 'Frame', 'Titanium'), ARRAY['Powerful Galaxy AI suite','200MP main camera','Built-in S Pen','7 years of updates'], ARRAY['Expensive','Large and heavy','Flat display less immersive for media'], ARRAY['Photography','Productivity','Gaming','Premium'], true FROM categories c WHERE c.slug = 'smartphones'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gadgets (name, slug, category_id, brand, price, rating, review_count, image_url, tagline, description, specs, pros, cons, best_for, featured)
SELECT 'Google Pixel 8 Pro', 'google-pixel-8-pro', c.id, 'Google', 999.00, 4.6, 2600, '', 'The AI phone with the smartest camera and 7 years of updates.', 'Google AI-first flagship with Magic Editor, Best Take, and Audio Magic Eraser. The Tensor G3 chip powers on-device AI, and the 50MP main sensor with a 48MP 5x telephoto captures superb photos in any light.', jsonb_build_object('Display', '6.7in LTPO OLED 120Hz', 'Chip', 'Tensor G3', 'Camera', '50MP + 48MP 5x + 48MP UW', 'Battery', '5050mAh', 'Updates', '7 years', 'AI', 'Magic Editor, Best Take'), ARRAY['Best computational photography','7 years of OS updates','Clean Android experience','Smart AI features'], ARRAY['Tensor G3 not as fast as rivals','Charging is slow','Bulky design'], ARRAY['Photography','AI Features','Android Users','Everyday'], false FROM categories c WHERE c.slug = 'smartphones'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gadgets (name, slug, category_id, brand, price, rating, review_count, image_url, tagline, description, specs, pros, cons, best_for, featured)
SELECT 'OnePlus 12', 'oneplus-12', c.id, 'OnePlus', 799.99, 4.5, 1400, '', 'Flagship specs at a lower price with 100W charging.', 'A value flagship with the Snapdragon 8 Gen 3, a 6.82-inch 2K LTPO display, and Hasselblad-tuned cameras. The 5400mAh battery charges from 0-100% in just 26 minutes with 100W wired charging.', jsonb_build_object('Display', '6.82in 2K LTPO OLED 120Hz', 'Chip', 'Snapdragon 8 Gen 3', 'Camera', '50MP + 64MP 3x + 48MP UW (Hasselblad)', 'Battery', '5400mAh', 'Charging', '100W wired / 50W wireless', 'Updates', '4 years OS'), ARRAY['Incredible charging speed','Flagship specs at lower price','Hasselblad camera tuning','Big battery'], ARRAY['Limited carrier support in US','OxygenOS bloat on some apps','IP65 only (not IP68)'], ARRAY['Gaming','Everyday','Value','Power Users'], false FROM categories c WHERE c.slug = 'smartphones'
ON CONFLICT (slug) DO NOTHING;

-- Wireless Earbuds
INSERT INTO gadgets (name, slug, category_id, brand, price, rating, review_count, image_url, tagline, description, specs, pros, cons, best_for, featured)
SELECT 'Sony WF-1000XM5', 'sony-wf-1000xm5', c.id, 'Sony', 279.99, 4.7, 3200, '', 'The new king of noise-cancelling earbuds.', 'Sony flagship ANC earbuds with the all-new V2 processor, dual noise sensor, and 8.4mm driver. Smaller and lighter than the XM4, with better call quality and LDAC support for hi-res audio.', jsonb_build_object('Driver', '8.4mm dynamic', 'ANC', 'Dual noise sensor + V2 chip', 'Battery', '8h + 24h with case', 'Codec', 'LDAC, AAC', 'Charging', 'USB-C + Qi wireless', 'Weight', '5.9g per bud'), ARRAY['Best-in-class ANC','Smaller and lighter than XM4','Excellent call quality','LDAC hi-res audio'], ARRAY['No multipoint at launch (added later)','Case is still bulky','Expensive'], ARRAY['Music','Commuting','Travel','Audiophiles'], true FROM categories c WHERE c.slug = 'wireless-earbuds'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gadgets (name, slug, category_id, brand, price, rating, review_count, image_url, tagline, description, specs, pros, cons, best_for, featured)
SELECT 'AirPods Pro 2', 'airpods-pro-2', c.id, 'Apple', 249.00, 4.8, 8900, '', 'Adaptive Audio makes these the most versatile AirPods ever.', 'Powered by the H2 chip with 2x better ANC than the original, Adaptive Audio that blends transparency and noise cancellation, and Conversation Awareness. USB-C charging and a new lanyard loop round out the update.', jsonb_build_object('Chip', 'H2', 'ANC', '2x better than gen 1', 'Battery', '6h + 30h with case', 'Audio', 'Personalized Spatial Audio', 'Charging', 'USB-C + Qi', 'Extras', 'Adaptive Audio, Conversation Awareness'), ARRAY['Excellent Adaptive Audio','Great ANC and transparency','Seamless Apple ecosystem','Good battery with case'], ARRAY['Best features Apple-only','Not the best for audiophiles','Silicone tips may not fit everyone'], ARRAY['Music','Commuting','Everyday','Apple Users'], true FROM categories c WHERE c.slug = 'wireless-earbuds'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gadgets (name, slug, category_id, brand, price, rating, review_count, image_url, tagline, description, specs, pros, cons, best_for, featured)
SELECT 'Bose QuietComfort Ultra', 'bose-qc-ultra', c.id, 'Bose', 299.00, 4.6, 1500, '', 'Immersive Audio creates a soundstage like no other.', 'Bose top earbuds with Immersive Audio (spatial audio that moves with your head), world-class ANC, and signature Bose comfort. Snapdragon Sound support and aptX Adaptive for high-quality streaming.', jsonb_build_object('ANC', 'Bose world-class', 'Battery', '6h + 24h with case', 'Audio', 'Immersive Audio spatial', 'Codec', 'aptX Adaptive, AAC', 'Charging', 'USB-C + Qi', 'Extras', 'Snapdragon Sound'), ARRAY['Best-in-class comfort','Immersive Audio is unique','Superb ANC','Great call quality'], ARRAY['Expensive','Immersive Audio drains battery','No LDAC'], ARRAY['Music','Commuting','Travel','Audiophiles'], false FROM categories c WHERE c.slug = 'wireless-earbuds'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gadgets (name, slug, category_id, brand, price, rating, review_count, image_url, tagline, description, specs, pros, cons, best_for, featured)
SELECT 'Samsung Galaxy Buds 3 Pro', 'samsung-galaxy-buds-3-pro', c.id, 'Samsung', 249.99, 4.3, 780, '', 'Blade design with adaptive ANC and dual-driver audio.', 'A bold redesign with a blade stem, dual drivers (planar tweeter + dynamic woofer), and adaptive noise control that adjusts to your environment. Real-time language translation via Galaxy AI.', jsonb_build_object('Driver', 'Planar tweeter + 11mm dynamic woofer', 'ANC', 'Adaptive with siren detection', 'Battery', '6h + 26h with case', 'Audio', '24-bit Samsung Seamless Codec', 'Extras', 'Galaxy AI translation'), ARRAY['Dual-driver sound quality','Adaptive ANC is smart','Galaxy AI translation','Wireless charging'], ARRAY['Blade design is polarizing','Some features Samsung-only','Fit issues for some ears'], ARRAY['Music','Commuting','Samsung Users'], false FROM categories c WHERE c.slug = 'wireless-earbuds'
ON CONFLICT (slug) DO NOTHING;

-- Smart Home
INSERT INTO gadgets (name, slug, category_id, brand, price, rating, review_count, image_url, tagline, description, specs, pros, cons, best_for, featured)
SELECT 'Amazon Echo Hub', 'amazon-echo-hub', c.id, 'Amazon', 149.99, 4.4, 620, '', 'An 8-inch wall-mounted smart home control panel.', 'A dedicated smart home panel with Zigbee, Thread, and Matter support. An 8-inch touch display lets you control lights, cameras, and routines. Alexa built-in for voice control of your entire home.', jsonb_build_object('Display', '8in touch', 'Protocols', 'Zigbee, Thread, Matter, Bluetooth, Wi-Fi', 'Voice', 'Alexa built-in', 'Mounting', 'Wall or table stand', 'Audio', 'Built-in speaker', 'Power', 'PoE or USB-C'), ARRAY['Supports all major protocols','Clean wall-mounted design','Good Matter support','Local device control'], ARRAY['Audio quality is limited','Some routines need cloud','No camera'], ARRAY['Smart Home','Automation','Security'], true FROM categories c WHERE c.slug = 'smart-home'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gadgets (name, slug, category_id, brand, price, rating, review_count, image_url, tagline, description, specs, pros, cons, best_for, featured)
SELECT 'Google Nest Hub Max', 'google-nest-hub-max', c.id, 'Google', 229.99, 4.5, 1200, '', 'A 10-inch smart display with a built-in Nest camera.', 'A 10-inch smart display with a 6.5MP Nest Cam built in for home monitoring. Face Match recognizes family members, and the screen doubles as a digital photo frame and video call device. Compatible with Matter.', jsonb_build_object('Display', '10in touch', 'Camera', '6.5MP Nest Cam', 'Speakers', '30W stereo with woofer', 'Voice', 'Google Assistant', 'Protocols', 'Matter, Wi-Fi, Bluetooth, Thread', 'Extras', 'Face Match, Quick Gestures'), ARRAY['Built-in Nest Cam is versatile','Great as a digital photo frame','Face Match personalization','Good speaker for music'], ARRAY['Camera features need Nest Aware','Limited third-party apps','Google Assistant quirks'], ARRAY['Smart Home','Automation','Video Calls','Kitchen'], false FROM categories c WHERE c.slug = 'smart-home'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gadgets (name, slug, category_id, brand, price, rating, review_count, image_url, tagline, description, specs, pros, cons, best_for, featured)
SELECT 'Philips Hue Bridge v2', 'philips-hue-bridge-v2', c.id, 'Philips Hue', 49.99, 4.6, 3400, '', 'The Matter-ready hub for your entire Hue ecosystem.', 'The second-gen Hue Bridge adds Matter support and Zigbee 3.0, controlling up to 50 lights and accessories. Enables advanced automations, schedules, and scenes through the Hue app.', jsonb_build_object('Protocols', 'Zigbee 3.0, Matter, Bluetooth', 'Capacity', '50 lights + accessories', 'Power', 'Ethernet + USB-C', 'App', 'Philips Hue', 'Extras', 'Hue Secure camera support'), ARRAY['Matter support future-proofs it','Rock-solid Zigbee reliability','Advanced automation engine','Works with all assistants'], ARRAY['Requires wired Ethernet','Bridge is an extra cost','Some features need Hue subscription'], ARRAY['Smart Home','Lighting','Automation'], false FROM categories c WHERE c.slug = 'smart-home'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gadgets (name, slug, category_id, brand, price, rating, review_count, image_url, tagline, description, specs, pros, cons, best_for, featured)
SELECT 'Arlo Pro 5S 2K', 'arlo-pro-5s-2k', c.id, 'Arlo', 249.99, 4.3, 890, '', 'Wire-free security cam with 2K HDR and dual-band Wi-Fi.', 'A wire-free outdoor security camera with 2K HDR video, color night vision, and a built-in spotlight. Dual-band Wi-Fi 6 improves connectivity, and the integrated solar panel option keeps it charged indefinitely.', jsonb_build_object('Video', '2K HDR with color night vision', 'Field of View', '130 degrees', 'Wi-Fi', 'Dual-band Wi-Fi 6', 'Power', 'Battery + solar option', 'Storage', 'Cloud + local (base station)', 'Extras', 'Spotlight, siren, 2-way audio'), ARRAY['Sharp 2K HDR video','Wire-free with solar option','Dual-band Wi-Fi 6','Built-in spotlight'], ARRAY['Full features need subscription','Local storage needs base station','Some motion detection issues'], ARRAY['Smart Home','Security','Outdoor'], false FROM categories c WHERE c.slug = 'smart-home'
ON CONFLICT (slug) DO NOTHING;

-- Laptops
INSERT INTO gadgets (name, slug, category_id, brand, price, rating, review_count, image_url, tagline, description, specs, pros, cons, best_for, featured)
SELECT 'MacBook Pro 16 M3 Max', 'macbook-pro-16-m3-max', c.id, 'Apple', 3499.00, 4.9, 2100, '', 'The most powerful MacBook ever for pros.', 'The M3 Max chip delivers massive CPU and GPU performance with up to 128GB unified memory. The 16.2-inch Liquid Retina XDR display, 22-hour battery life, and six-speaker system make it the ultimate pro laptop.', jsonb_build_object('Display', '16.2in Liquid Retina XDR 120Hz', 'Chip', 'M3 Max (16-core CPU / 40-core GPU)', 'Memory', '36 to 128GB unified', 'Storage', '1TB to 8TB SSD', 'Battery', '22h video', 'Ports', '3x TB4, HDMI, SDXC, MagSafe'), ARRAY['Unmatched M3 Max performance','Incredible 22-hour battery','Best-in-class display','Pro-grade ports'], ARRAY['Very expensive','Notch on display','Heavy at 2.16kg'], ARRAY['Productivity','Creative Work','Video Editing','Power Users'], true FROM categories c WHERE c.slug = 'laptops'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gadgets (name, slug, category_id, brand, price, rating, review_count, image_url, tagline, description, specs, pros, cons, best_for, featured)
SELECT 'Dell XPS 15', 'dell-xps-15', c.id, 'Dell', 1899.00, 4.5, 1750, '', 'A premium Windows laptop with OLED and RTX graphics.', 'The XPS 15 combines a stunning 15.6-inch 3.5K OLED touch display with up to an Intel Core i9 and NVIDIA RTX 4060. CNC-machined aluminum and a carbon fiber palm rest give it a premium feel.', jsonb_build_object('Display', '15.6in 3.5K OLED touch 60Hz', 'CPU', 'Intel Core i9-13900H', 'GPU', 'NVIDIA RTX 4060', 'Memory', '8 to 64GB DDR5', 'Storage', '256GB to 2TB SSD', 'Battery', '86Wh'), ARRAY['Beautiful 3.5K OLED display','RTX graphics for creative work','Premium build quality','Good port selection'], ARRAY['Webcam is 720p','Gets warm under load','No SD card reader'], ARRAY['Productivity','Creative Work','Gaming','Everyday'], true FROM categories c WHERE c.slug = 'laptops'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gadgets (name, slug, category_id, brand, price, rating, review_count, image_url, tagline, description, specs, pros, cons, best_for, featured)
SELECT 'MacBook Air 15 M3', 'macbook-air-15-m3', c.id, 'Apple', 1299.00, 4.8, 3400, '', 'The perfect everyday laptop, now in 15 inches.', 'The 15-inch MacBook Air with the M3 chip is whisper-quiet, fanless, and lasts up to 18 hours. A larger Liquid Retina display and six-speaker sound system make it ideal for work and entertainment.', jsonb_build_object('Display', '15.3in Liquid Retina 60Hz', 'Chip', 'M3 (8-core CPU / 10-core GPU)', 'Memory', '8 to 24GB unified', 'Storage', '256GB to 2TB SSD', 'Battery', '18h video', 'Weight', '1.51kg'), ARRAY['Silent fanless design','18-hour battery life','Lightweight for 15in','Great speakers'], ARRAY['60Hz display only','Limited ports (2x TB4)','Base model has 8GB RAM'], ARRAY['Productivity','Students','Everyday','Portability'], false FROM categories c WHERE c.slug = 'laptops'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gadgets (name, slug, category_id, brand, price, rating, review_count, image_url, tagline, description, specs, pros, cons, best_for, featured)
SELECT 'ASUS ROG Zephyrus G14', 'asus-rog-zephyrus-g14', c.id, 'ASUS', 1599.99, 4.6, 920, '', 'A compact gaming powerhouse with an AniMe Matrix.', 'The Zephyrus G14 packs an AMD Ryzen 9 and RTX 4070 into a 14-inch chassis weighing just 1.5kg. The optional AniMe Matrix LED display on the lid and QHD+ 165Hz panel make it a standout gaming laptop.', jsonb_build_object('Display', '14in QHD+ 165Hz', 'CPU', 'AMD Ryzen 9 8945HS', 'GPU', 'NVIDIA RTX 4070', 'Memory', '16 to 32GB DDR5', 'Storage', '1TB SSD', 'Weight', '1.5kg'), ARRAY['Powerful specs in compact body','Great 165Hz display','AniMe Matrix is unique','Good battery for a gaming laptop'], ARRAY['Can get loud under load','Limited upgradability','No webcam shutter'], ARRAY['Gaming','Creative Work','Portability','Power Users'], false FROM categories c WHERE c.slug = 'laptops'
ON CONFLICT (slug) DO NOTHING;

-- Tablets
INSERT INTO gadgets (name, slug, category_id, brand, price, rating, review_count, image_url, tagline, description, specs, pros, cons, best_for, featured)
SELECT 'iPad Pro 13 M4', 'ipad-pro-13-m4', c.id, 'Apple', 1099.00, 4.8, 1600, '', 'The thinnest Apple product ever with the M4 chip.', 'The iPad Pro goes OLED with a stunning 13-inch tandem OLED Ultra Retina XDR display. The M4 chip brings desktop-class performance, and the new Apple Pencil Pro adds haptic feedback and barrel rotation.', jsonb_build_object('Display', '13in tandem OLED 120Hz', 'Chip', 'M4 (10-core CPU / 10-core GPU)', 'Memory', '8 to 16GB', 'Storage', '256GB to 2TB', 'Thickness', '5.1mm', 'Accessories', 'Apple Pencil Pro, Magic Keyboard'), ARRAY['Stunning tandem OLED display','Incredibly thin at 5.1mm','M4 chip is blazing fast','Apple Pencil Pro is excellent'], ARRAY['Very expensive','Accessories sold separately','iPadOS still limits pro workflows'], ARRAY['Creative Work','Productivity','Media','Students'], true FROM categories c WHERE c.slug = 'tablets'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gadgets (name, slug, category_id, brand, price, rating, review_count, image_url, tagline, description, specs, pros, cons, best_for, featured)
SELECT 'Samsung Galaxy Tab S9 Ultra', 'samsung-galaxy-tab-s9-ultra', c.id, 'Samsung', 1199.99, 4.6, 720, '', 'The biggest Android tablet with an S Pen included.', 'A 14.6-inch Dynamic AMOLED 2X display with S Pen included in the box. IP68 water resistance, quad speakers tuned by AKG, and the Snapdragon 8 Gen 2 make it the best Android tablet for media and note-taking.', jsonb_build_object('Display', '14.6in Dynamic AMOLED 2X 120Hz', 'Chip', 'Snapdragon 8 Gen 2', 'Memory', '12 to 16GB', 'Storage', '256GB to 1TB', 'S Pen', 'Included', 'Durability', 'IP68'), ARRAY['Huge beautiful AMOLED display','S Pen included','IP68 water resistance','Great quad speakers'], ARRAY['Very large and unwieldy','Samsung keyboard is extra','DeX mode still limited'], ARRAY['Media','Productivity','Note-taking','Creative Work'], false FROM categories c WHERE c.slug = 'tablets'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gadgets (name, slug, category_id, brand, price, rating, review_count, image_url, tagline, description, specs, pros, cons, best_for, featured)
SELECT 'iPad Air 13 M2', 'ipad-air-13-m2', c.id, 'Apple', 799.00, 4.7, 2400, '', 'The sweet spot of performance and value.', 'The iPad Air gets the M2 chip and a larger 13-inch display. It supports Apple Pencil Pro and the new Magic Keyboard, making it a compelling alternative to the Pro for most users.', jsonb_build_object('Display', '13in Liquid Retina 60Hz', 'Chip', 'M2 (8-core CPU / 9-core GPU)', 'Memory', '8GB', 'Storage', '128GB to 1TB', 'Accessories', 'Apple Pencil Pro, Magic Keyboard'), ARRAY['M2 chip is plenty powerful','Supports Apple Pencil Pro','Great value vs. iPad Pro','Lightweight design'], ARRAY['60Hz display','Base storage only 128GB','Accessories are costly'], ARRAY['Students','Productivity','Everyday','Media'], false FROM categories c WHERE c.slug = 'tablets'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gadgets (name, slug, category_id, brand, price, rating, review_count, image_url, tagline, description, specs, pros, cons, best_for, featured)
SELECT 'Lenovo Tab P12', 'lenovo-tab-p12', c.id, 'Lenovo', 349.99, 4.2, 450, '', 'A budget-friendly 12.7-inch tablet with a great display.', 'A 12.7-inch 3K display with quad JBL speakers makes the Tab P12 ideal for media consumption. The MediaTek Dimensity 7050 chip handles everyday tasks well, and the included folio stand is a nice touch.', jsonb_build_object('Display', '12.7in 3K IPS 60Hz', 'Chip', 'MediaTek Dimensity 7050', 'Memory', '4 to 8GB', 'Storage', '128 to 256GB', 'Speakers', 'Quad JBL', 'Extras', 'Folio stand included'), ARRAY['Great 12.7in display for the price','Quad JBL speakers','Folio stand included','Good value'], ARRAY['Mediocre performance','No stylus in box','Only 60Hz'], ARRAY['Media','Students','Budget','Everyday'], false FROM categories c WHERE c.slug = 'tablets'
ON CONFLICT (slug) DO NOTHING;

-- Drones
INSERT INTO gadgets (name, slug, category_id, brand, price, rating, review_count, image_url, tagline, description, specs, pros, cons, best_for, featured)
SELECT 'DJI Mavic 3 Pro', 'dji-mavic-3-pro', c.id, 'DJI', 2199.00, 4.8, 1100, '', 'A triple-camera drone with a 4/3 CMOS Hasselblad.', 'The Mavic 3 Pro features a triple-camera system with a 4/3 CMOS Hasselblad main camera, a 70mm medium tele, and a 166mm tele. 43-minute flight time and omnidirectional obstacle sensing make it the ultimate creator drone.', jsonb_build_object('Camera', '4/3 CMOS Hasselblad + 70mm + 166mm', 'Video', '5.1K/50fps, 4K/120fps', 'Flight Time', '43 min', 'Transmission', 'DJI O3+ 15km', 'Obstacle Sensing', 'Omnidirectional', 'Weight', '958g'), ARRAY['Triple-camera versatility','Stunning Hasselblad image quality','43-minute flight time','Omnidirectional obstacle sensing'], ARRAY['Expensive','958g requires registration in some regions','Learning curve for pro features'], ARRAY['Photography','Videography','Creative Work','Professional'], true FROM categories c WHERE c.slug = 'drones'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gadgets (name, slug, category_id, brand, price, rating, review_count, image_url, tagline, description, specs, pros, cons, best_for, featured)
SELECT 'DJI Air 3', 'dji-air-3', c.id, 'DJI', 999.00, 4.7, 2600, '', 'Dual-camera drone with excellent value for creators.', 'The Air 3 features a dual primary camera system with a 24mm wide and a 70mm medium tele, both capturing 4K/100fps. 46-minute flight time and O4 HD transmission up to 20km make it the best value drone for most creators.', jsonb_build_object('Camera', '24mm wide + 70mm tele (1/1.3in CMOS)', 'Video', '4K/100fps', 'Flight Time', '46 min', 'Transmission', 'O4 HD 20km', 'Obstacle Sensing', 'Omnidirectional', 'Weight', '720g'), ARRAY['Dual cameras at a great price','46-minute flight time','Excellent obstacle sensing','Best value for creators'], ARRAY['No variable aperture','720g needs registration in some areas','No ProRes'], ARRAY['Photography','Videography','Travel','Beginners'], true FROM categories c WHERE c.slug = 'drones'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gadgets (name, slug, category_id, brand, price, rating, review_count, image_url, tagline, description, specs, pros, cons, best_for, featured)
SELECT 'DJI Mini 4 Pro', 'dji-mini-4-pro', c.id, 'DJI', 759.00, 4.6, 3100, '', 'A sub-250g drone with 4K/100fps and omnidirectional sensing.', 'Weighing just 249g, the Mini 4 Pro avoids registration requirements in most regions. It shoots 4K/100fps HDR video, has omnidirectional obstacle sensing, and features a 34-minute flight time in a pocketable package.', jsonb_build_object('Camera', '1/1.3in CMOS 48MP', 'Video', '4K/100fps HDR', 'Flight Time', '34 min', 'Transmission', 'O4 HD 20km', 'Obstacle Sensing', 'Omnidirectional', 'Weight', '249g'), ARRAY['Sub-250g — no registration needed','Omnidirectional sensing at this size','4K/100fps HDR video','Great for travel'], ARRAY['Smaller sensor than Air 3','Wind can affect light body','Limited in low light'], ARRAY['Travel','Beginners','Photography','Videography'], false FROM categories c WHERE c.slug = 'drones'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gadgets (name, slug, category_id, brand, price, rating, review_count, image_url, tagline, description, specs, pros, cons, best_for, featured)
SELECT 'Autel EVO Lite+', 'autel-evo-lite-plus', c.id, 'Autel', 1099.00, 4.3, 380, '', 'A DJI alternative with a 1-inch sensor and no geofencing.', 'The EVO Lite+ features a 1-inch CMOS sensor with adjustable aperture f/2.8 to f/11, 6K/30fps video, and no geofencing restrictions. 40-minute flight time and a 3-axis gimbal make it a strong alternative for those who want freedom.', jsonb_build_object('Camera', '1in CMOS 20MP f/2.8 to f/11', 'Video', '6K/30fps', 'Flight Time', '40 min', 'Transmission', 'SkyLink 3.0 12km', 'Obstacle Sensing', 'Tri-directional', 'Weight', '712g'), ARRAY['1in sensor with adjustable aperture','No geofencing restrictions','6K video capture','Good build quality'], ARRAY['App is less polished than DJI','Smaller ecosystem','Tri-directional only (not omni)'], ARRAY['Photography','Videography','Professional','Freedom'], false FROM categories c WHERE c.slug = 'drones'
ON CONFLICT (slug) DO NOTHING;

-- ── Seed: Reviews ───────────────────────────────────────────
INSERT INTO reviews (gadget_id, author_name, rating, title, comment)
SELECT g.id, 'Sarah M.', 5, 'Best watch I have ever owned', 'The battery life on the Ultra 2 is incredible. I went on a 3-day backpacking trip and it still had 20% left. The GPS is pinpoint accurate.' FROM gadgets g WHERE g.slug = 'apple-watch-ultra-2'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (gadget_id, author_name, rating, title, comment)
SELECT g.id, 'James K.', 4, 'Great but pricey', 'Amazing build quality and display, but the price is hard to justify unless you really need the rugged features.' FROM gadgets g WHERE g.slug = 'apple-watch-ultra-2'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (gadget_id, author_name, rating, title, comment)
SELECT g.id, 'Priya R.', 5, 'The AI features are mind-blowing', 'Circle to Search and Live Translate have genuinely changed how I use my phone. Camera is the best I have ever used.' FROM gadgets g WHERE g.slug = 'samsung-galaxy-s24-ultra'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (gadget_id, author_name, rating, title, comment)
SELECT g.id, 'Michael T.', 5, 'Noise cancellation is witchcraft', 'I wear these on the subway every day and it is like the world disappears. The Adaptive Audio mode is brilliant.' FROM gadgets g WHERE g.slug = 'airpods-pro-2'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (gadget_id, author_name, rating, title, comment)
SELECT g.id, 'Elena V.', 4, 'Amazing sound, big case', 'The sound quality and ANC are the best I have heard in earbuds, but the case is still on the bulky side.' FROM gadgets g WHERE g.slug = 'sony-wf-1000xm5'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (gadget_id, author_name, rating, title, comment)
SELECT g.id, 'David L.', 5, 'A creative powerhouse', 'I edit 4K video in DaVinci Resolve and this thing does not break a sweat. The display is gorgeous and battery lasts all day.' FROM gadgets g WHERE g.slug = 'macbook-pro-16-m3-max'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (gadget_id, author_name, rating, title, comment)
SELECT g.id, 'Aisha B.', 5, 'OLED is stunning', 'The tandem OLED display is the best screen on any tablet. Apple Pencil Pro makes note-taking and sketching a joy.' FROM gadgets g WHERE g.slug = 'ipad-pro-13-m4'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (gadget_id, author_name, rating, title, comment)
SELECT g.id, 'Rob P.', 5, 'Perfect travel drone', 'Under 250g so I can fly anywhere without registration. The 4K video quality blew me away for the size.' FROM gadgets g WHERE g.slug = 'dji-mini-4-pro'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (gadget_id, author_name, rating, title, comment)
SELECT g.id, 'Chris W.', 5, 'Triple camera is a game-changer', 'Having three focal lengths in one drone is incredible for storytelling. The Hasselblad color science is beautiful.' FROM gadgets g WHERE g.slug = 'dji-mavic-3-pro'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (gadget_id, author_name, rating, title, comment)
SELECT g.id, 'Nina F.', 4, 'Great smart home panel', 'Mounted this in my hallway and it controls everything. Wish the speaker was better but as a control panel it is perfect.' FROM gadgets g WHERE g.slug = 'amazon-echo-hub'
ON CONFLICT DO NOTHING;