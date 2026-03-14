import { Geist, Geist_Mono, Nunito } from "next/font/google";
// TODO: Replace Nunito with Milker once font files are downloaded from Fontshare.
// See app/fonts/milker/README.md for instructions.
// import localFont from "next/font/local";
// const milker = localFont({
//   src: [
//     { path: "./milker/Milker-Regular.woff2", weight: "400", style: "normal" },
//     { path: "./milker/Milker-Bold.woff2", weight: "700", style: "normal" },
//   ],
//   variable: "--font-milker",
//   display: "swap",
// });

export const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

// Placeholder for Milker — replace with next/font/local once font files are in place.
export const milker = Nunito({
  subsets: ["latin"],
  variable: "--font-milker",
  display: "swap",
});
