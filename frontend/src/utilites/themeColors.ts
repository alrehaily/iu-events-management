import {generateColors} from "@mantine/colors-generator";
import {MantineColorsTuple} from "@mantine/core";
import {getConfig} from "./config.ts";
import {IU_COLORS} from "../constants/iuTheme.ts";

export * from "../constants/iuTheme.ts";

export type ThemeColors = Record<"primary" | "secondary", MantineColorsTuple>;

export const generateThemeColors = (): ThemeColors => ({
    primary: generateColors(getConfig("VITE_APP_PRIMARY_COLOR", IU_COLORS.green900) as string),
    secondary: generateColors(getConfig("VITE_APP_SECONDARY_COLOR", IU_COLORS.green700) as string),
});
