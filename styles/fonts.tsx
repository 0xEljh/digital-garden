import { Global } from "@emotion/react";

const Fonts = () => (
  <Global
    styles={`
      @font-face {
        font-family: 'Aeion Mono';
        font-style: normal;
        src: url('/fonts/AeionMono-VariableVF.woff2') format('woff2-variations'),
             url('/fonts/AeionMono-VariableVF.woff') format('woff-variations'),
             url('/fonts/AeionMono-VariableVF.ttf') format('truetype-variations');
        font-weight: 100 900;
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
        src: url('/fonts/Topoline-VariableVF.woff2') format('woff2-variations'),
             url('/fonts/Topoline-VariableVF.woff') format('woff-variations'),
             url('/fonts/Topoline-VariableVF.ttf') format('truetype-variations');
        font-weight: 100 900;
      }
      
      @font-face {
        font-family: 'YE Display';
        font-style: normal;
        font-weight: 400;
        src: url('/fonts/YE-Display.woff2') format('woff2'),
             url('/fonts/YE-Display.woff') format('woff'),
             url('/fonts/YE-Display.otf') format('opentype');
      }
    `}
  />
);

export default Fonts;