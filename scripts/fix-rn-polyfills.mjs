#!/usr/bin/env node
/**
 * Expo Web uchun moslik tuzatishi (postinstall).
 *
 * Muammo: Expo CLI (SDK 57) web bundler qurishda `react-native/rn-get-polyfills`
 * subpath'ini `require` qiladi, lekin React Native 0.86+ uni `exports` dan
 * olib tashlagan -> "ERR_PACKAGE_PATH_NOT_EXPORTED" xatosi.
 *
 * Yechim: react-native paketiga shim fayl qo'shib, `exports` ga yozib qo'yamiz.
 * Bu skript `npm install` dan keyin avtomatik ishlaydi (postinstall), shuning
 * uchun tuzatish har safar qayta tiklanadi.
 */
import fs from "node:fs";
import path from "node:path";

const CANDIDATES = [
  path.join(process.cwd(), "node_modules", "react-native"),
  path.join(process.cwd(), "apps", "mobile", "node_modules", "react-native")
];

const SHIM = `// Expo CLI (web) moslik shimi — "npm run fix:rn-polyfills" tomonidan yaratilgan.
module.exports = function getPolyfills() {
  return [];
};
`;

let patched = 0;

for (const dir of CANDIDATES) {
  const pkgPath = path.join(dir, "package.json");
  if (!fs.existsSync(pkgPath)) continue;

  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    const exportsField = pkg.exports;

    // React Native 0.87+ baribir o'zi eksport qilgan bo'lsa — tegilmaydi.
    if (!exportsField || exportsField["./rn-get-polyfills"]) continue;

    exportsField["./rn-get-polyfills"] = "./rn-get-polyfills.js";
    pkg.exports = exportsField;

    fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
    fs.writeFileSync(path.join(dir, "rn-get-polyfills.js"), SHIM, "utf8");
    patched += 1;
    console.log(`[fix:rn-polyfills] tuzatildi: ${path.relative(process.cwd(), dir)}`);
  } catch (error) {
    console.warn(`[fix:rn-polyfills] o'tkazib yuborildi (${dir}):`, error.message);
  }
}

if (patched === 0) {
  console.log("[fix:rn-polyfills] tuzatish kerak emas");
}
