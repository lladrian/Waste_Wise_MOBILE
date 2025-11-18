// // gluestack-ui.config.ts
// import { config } from "@gluestack-ui/config";
// import { createConfig } from "@gluestack-ui/themed";


// export const customConfig = createConfig({
//   ...config,
//   tokens: {
//     ...config.tokens,
//     colors: {
//       ...config.tokens.colors,
//       primary: { 500: "#007BFF", 600: "#0056B3" },
//       gradient: { start: "#0072CE", end: "#00AEEF" },
//       lightBlue: { 500: "#E6F4FF" },
//       darkText: { 500: "#1E1E1E" },
//       grayText: { 500: "#6C757D" },
//       borderGray: { 500: "#DEE2E6" },
//     },
//     fonts: {
//       heading: "Inter-Bold",
//       body: "Inter-Regular",
//     },
//   },
// });


// export type CustomConfig = typeof customConfig;


import { createConfig } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";

export const customConfig = createConfig({
  ...config,
  tokens: {
    ...config.tokens,
    colors: {
      ...config.tokens.colors,
      primary: { 500: "#007BFF", 600: "#0056B3" },
      gradient: { start: "#0072CE", end: "#00AEEF" },
      lightBlue: { 500: "#E6F4FF" },
      darkText: { 500: "#1E1E1E" },
      grayText: { 500: "#6C757D" },
      borderGray: { 500: "#DEE2E6" },
    },
    fonts: {
      heading: "Inter-Bold",
      body: "Inter-Regular",
    },
  },
});

export type CustomConfig = typeof customConfig;