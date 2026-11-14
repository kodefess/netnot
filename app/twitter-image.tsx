import OpengraphImage from "./opengraph-image";

import { SITE } from "@/lib/site";

// Konfigurasi ditulis ulang (bukan re-export) supaya terbaca statis oleh Next.
export const alt = SITE.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default OpengraphImage;
