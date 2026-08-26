import { renderToBuffer } from "@react-pdf/renderer";
import { ReceiptDocument, type ReceiptDocumentProps } from "./ReceiptDocument";

export async function renderReceiptPdf(props: ReceiptDocumentProps): Promise<Buffer> {
  return renderToBuffer(ReceiptDocument(props));
}
