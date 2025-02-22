import dynamic from "next/dynamic";

export const DynamicFlickeringAsciiImage = dynamic(
  () =>
    import("./AsciiImage").then((mod) => mod.FlickeringAsciiImage),
  {
    ssr: false, // Disable server-side rendering
    loading: () => null, // Optional loading component
  }
);
