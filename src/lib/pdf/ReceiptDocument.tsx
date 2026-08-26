import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { formatSenCompact } from "@/lib/money";

const RED = "#e8232a";
const INK = "#0f0f10";
const MUTED = "#5b5b60";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: INK, fontFamily: "Helvetica" },
  brand: { fontSize: 18, fontWeight: 700, color: RED, marginBottom: 2 },
  tagline: { fontSize: 8, color: MUTED, marginBottom: 24, letterSpacing: 1 },
  title: { fontSize: 14, fontWeight: 700, marginBottom: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  label: { color: MUTED },
  section: { marginTop: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 10, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 },
  tableHeader: { flexDirection: "row", borderBottom: `1pt solid ${INK}`, paddingBottom: 4, marginBottom: 4 },
  tableRow: { flexDirection: "row", paddingVertical: 3, borderBottom: "0.5pt solid #e5e5e5" },
  colDesc: { flex: 3 },
  colAmount: { flex: 1, textAlign: "right" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12, paddingTop: 8, borderTop: `1pt solid ${INK}` },
  totalLabel: { fontSize: 12, fontWeight: 700 },
  totalValue: { fontSize: 12, fontWeight: 700 },
  balanceBox: { marginTop: 16, padding: 10, backgroundColor: "#fdf2f2" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 8, color: MUTED, textAlign: "center" },
});

export type ReceiptAllocationLine = {
  description: string;
  amountSen: number;
};

export type ReceiptDocumentProps = {
  receiptNo: string;
  paidAt: Date;
  memberName: string;
  memberCode: string;
  guardianName: string;
  guardianEmail: string;
  allocations: ReceiptAllocationLine[];
  amountPaidSen: number;
  pendingBalanceSen: number;
  billplzBillId: string;
};

export function ReceiptDocument({
  receiptNo,
  paidAt,
  memberName,
  memberCode,
  guardianName,
  guardianEmail,
  allocations,
  amountPaidSen,
  pendingBalanceSen,
  billplzBillId,
}: ReceiptDocumentProps) {
  return (
    <Document title={`Receipt ${receiptNo}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>SAILORS FOOTBALL ACADEMY</Text>
        <Text style={styles.tagline}>#KASITEMPUR — TOGETHER WE SAIL</Text>

        <Text style={styles.title}>Payment Receipt</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Receipt No.</Text>
          <Text>{receiptNo}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date</Text>
          <Text>{paidAt.toLocaleDateString("en-MY", { year: "numeric", month: "long", day: "numeric" })}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Member</Text>
          <Text>
            {memberName} ({memberCode})
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Guardian</Text>
          <Text>
            {guardianName} — {guardianEmail}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Billplz Bill ID</Text>
          <Text>{billplzBillId}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Breakdown</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.colDesc, { fontWeight: 700 }]}>Applied To</Text>
            <Text style={[styles.colAmount, { fontWeight: 700 }]}>Amount</Text>
          </View>
          {allocations.map((line, i) => (
            <View style={styles.tableRow} key={i}>
              <Text style={styles.colDesc}>{line.description}</Text>
              <Text style={styles.colAmount}>{formatSenCompact(line.amountSen)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Paid</Text>
          <Text style={styles.totalValue}>{formatSenCompact(amountPaidSen)}</Text>
        </View>

        {pendingBalanceSen > 0 && (
          <View style={styles.balanceBox}>
            <Text style={{ color: RED, fontWeight: 700 }}>
              Outstanding balance after this payment: {formatSenCompact(pendingBalanceSen)}
            </Text>
          </View>
        )}

        <Text style={styles.footer}>
          Royal Klang Sailors — FootballHub Rimbayu, Bandar Rimbayu, Klang, Selangor · WhatsApp 017-568 1830
        </Text>
      </Page>
    </Document>
  );
}
