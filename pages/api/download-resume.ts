import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const pdfPath = path.resolve("./public", "Resume-Elijah.pdf");
  const pdfStream = fs.createReadStream(pdfPath);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="resume-elijah-0xeljh.pdf"'
  );

  pdfStream.pipe(res);

  pdfStream.on("error", (error) => {
    res.status(500).end("Error downloading the PDF");
  });
}
