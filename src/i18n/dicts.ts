import common from "./common";
import home from "./pages/home";
import work from "./pages/work";
import shop from "./pages/shop";
import product from "./pages/product";
import custom from "./pages/custom";
import about from "./pages/about";
import notfound from "./pages/notfound";
import faq from "./pages/faq";

/** Every dictionary, in code. They are the defaults: text edited in the CMS replaces them field by field. */
export const DICTS = { common, home, work, shop, product, custom, about, faq, notfound };
export type CopyKey = keyof typeof DICTS;
export type Copy<K extends CopyKey> = (typeof DICTS)[K]["en"];

/** Studio labels for each dictionary. */
export const COPY_TITLES: Record<CopyKey, string> = {
  common: "Teks bersama (menu, footer, layanan, proses)",
  home: "Beranda",
  work: "Karya",
  shop: "Toko",
  product: "Halaman produk",
  custom: "Pesan custom",
  about: "Tentang",
  faq: "FAQ",
  notfound: "Halaman 404",
};
