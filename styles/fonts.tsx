import { Global } from "@emotion/react";
import { IBM_Plex_Serif } from "next/font/google";

export const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-ibm-plex-serif",
});

const Fonts = () => (
  <Global
    styles={`
      :root {
        --font-body: ${ibmPlexSerif.style.fontFamily};
      }

      @font-face {
        font-family: 'Aeion Mono';
        font-style: normal;
        src: url('/fonts/AeionMono-VariableVF.woff2') format('woff2'),
             url('/fonts/AeionMono-VariableVF.woff') format('woff'),
             url('/fonts/AeionMono-VariableVF.ttf') format('truetype');
        font-weight: 0 100;
      }
      
      @font-face {
        font-family: 'Tickerbit';
        font-style: normal;
        font-weight: 400;
        src: url('/fonts/Tickerbit-regular.woff2') format('woff2'),
             url('/fonts/Tickerbit-regular.woff') format('woff'),
             url('/fonts/Tickerbit-regular.otf') format('opentype');
      }
      
      @font-face {
        font-family: 'Topoline';
        font-style: normal;
        src: url('/fonts/Topoline-VariableVF.woff2') format('woff2'),
             url('/fonts/Topoline-VariableVF.woff') format('woff'),
             url('/fonts/Topoline-VariableVF.ttf') format('truetype');
        font-weight: 0 100;
      }
    `}
  />
);

export default Fonts;
