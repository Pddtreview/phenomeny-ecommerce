import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

type InvoiceOrderItem = {
  name: string;
  sku: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  hsn_code?: string | null;
};

type InvoiceAddress = {
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
};

export type InvoiceOrder = {
  order_number: string;
  created_at: string;
  payment_method: string;
  subtotal: number;
  discount: number;
  shipping_charge: number;
  cod_charge: number;
  total: number;
  customer: {
    name: string;
    phone: string;
  } | null;
  address: InvoiceAddress | null;
  items: InvoiceOrderItem[];
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 32,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    borderBottomStyle: "solid",
    paddingBottom: 12,
    marginBottom: 12,
  },
  businessName: {
    fontSize: 20,
    fontWeight: 700,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  headerLeft: {
    flex: 2,
  },
  headerRight: {
    flex: 1,
    textAlign: "right",
  },
  label: {
    fontSize: 9,
    color: "#555555",
  },
  value: {
    fontSize: 10,
  },
  sectionRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 8,
  },
  box: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#dddddd",
    borderStyle: "solid",
    padding: 8,
  },
  boxTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 4,
  },
  table: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#dddddd",
    borderStyle: "solid",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
    borderBottomStyle: "solid",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    borderBottomStyle: "solid",
  },
  tableCell: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    fontSize: 9,
  },
  colIndex: {
    width: "6%",
  },
  colName: {
    width: "38%",
  },
  colSku: {
    width: "16%",
  },
  colQty: {
    width: "10%",
    textAlign: "right",
  },
  colUnit: {
    width: "15%",
    textAlign: "right",
  },
  colTotal: {
    width: "15%",
    textAlign: "right",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  summaryLabel: {
    width: "50%",
    textAlign: "right",
    fontSize: 9,
    paddingRight: 8,
  },
  summaryValue: {
    width: "20%",
    textAlign: "right",
    fontSize: 9,
    fontWeight: 500,
  },
  summaryValueBold: {
    width: "20%",
    textAlign: "right",
    fontSize: 10,
    fontWeight: 700,
  },
  footer: {
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: "#dddddd",
    borderTopStyle: "solid",
    paddingTop: 8,
  },
  footerText: {
    fontSize: 9,
    textAlign: "center",
    color: "#6b7280",
  },
});

function formatDate(dateValue: string) {
  try {
    const d = new Date(dateValue);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return dateValue;
  }
}

function formatCurrency(amount: number) {
  return "Rs. " + Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

type InvoicePdfProps = {
  order: InvoiceOrder;
};

export function InvoicePdf({ order }: InvoicePdfProps) {
  const businessAddress = process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || "";
  const gstNumber = process.env.NEXT_PUBLIC_GST_NUMBER || "";
  const supportPhone = process.env.NEXT_PUBLIC_SUPPORT_PHONE || "";
   const sellerGstin = process.env.NEXT_PUBLIC_GSTIN || gstNumber || "";
   const sellerStateCode = process.env.NEXT_PUBLIC_STATE_CODE || "";
   const sellerStateName = process.env.NEXT_PUBLIC_STATE_NAME || "";

  const subtotal = Number(order.subtotal || 0);
  const discount = Number(order.discount || 0);
  const shipping = Number(order.shipping_charge || 0);
  const cod = Number(order.cod_charge || 0);
  const total = subtotal - discount + shipping + cod;
  const estimatedGst =
    gstNumber && total > 0
      ? Math.round(((total * 18) / 118) * 100) / 100
      : 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.businessName}>Nauvarah</Text>
              <Text style={{ marginTop: 4, fontSize: 10, fontWeight: 700 }}>
                TAX INVOICE
              </Text>
              {businessAddress ? (
                <Text style={{ marginTop: 6, fontSize: 9 }}>
                  {businessAddress}
                </Text>
              ) : null}
              {sellerGstin ? (
                <Text style={{ marginTop: 2, fontSize: 9 }}>
                  GSTIN: {sellerGstin}
                </Text>
              ) : null}
              {supportPhone ? (
                <Text style={{ marginTop: 2, fontSize: 9 }}>
                  Phone: {supportPhone}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <View style={styles.box}>
            <Text style={styles.boxTitle}>Invoice details</Text>
            <Text style={styles.label}>Invoice number</Text>
            <Text style={styles.value}>{order.order_number}</Text>
            <Text style={[styles.label, { marginTop: 4 }]}>Invoice date</Text>
            <Text style={styles.value}>{formatDate(order.created_at)}</Text>
            <Text style={[styles.label, { marginTop: 4 }]}>Order number</Text>
            <Text style={styles.value}>{order.order_number}</Text>
            {sellerGstin ? (
              <>
                <Text style={[styles.label, { marginTop: 4 }]}>Seller GSTIN</Text>
                <Text style={styles.value}>{sellerGstin}</Text>
              </>
            ) : null}
            {sellerStateName ? (
              <>
                <Text style={[styles.label, { marginTop: 4 }]}>Seller state</Text>
                <Text style={styles.value}>
                  {sellerStateName}
                  {sellerStateCode ? ` (${sellerStateCode})` : ""}
                </Text>
              </>
            ) : null}
          </View>

          <View style={styles.box}>
            <Text style={styles.boxTitle}>Bill to</Text>
            {order.address ? (
              <>
                <Text style={styles.value}>
                  {order.address.name || order.customer?.name || ""}
                </Text>
                <Text style={styles.value}>{order.address.line1}</Text>
                {order.address.line2 ? (
                  <Text style={styles.value}>{order.address.line2}</Text>
                ) : null}
                <Text style={styles.value}>
                  {order.address.city}, {order.address.state}{" "}
                  {order.address.pincode}
                </Text>
                <Text style={[styles.value, { marginTop: 2 }]}>
                  Phone:{" "}
                  {order.address.phone || order.customer?.phone || "Not available"}
                </Text>
                <Text style={[styles.value, { marginTop: 2 }]}>
                  State: {order.address.state}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.value}>
                  {order.customer?.name || "Customer"}
                </Text>
                <Text style={styles.value}>
                  Phone: {order.customer?.phone || "Not available"}
                </Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.colIndex]}>#</Text>
            <Text style={[styles.tableCell, styles.colName]}>Item Name</Text>
            <Text style={[styles.tableCell, styles.colSku]}>SKU</Text>
            <Text style={[styles.tableCell, styles.colSku]}>HSN</Text>
            <Text style={[styles.tableCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableCell, styles.colUnit]}>Unit</Text>
            <Text style={[styles.tableCell, styles.colUnit]}>Unit Price</Text>
            <Text style={[styles.tableCell, styles.colTotal]}>Total</Text>
          </View>
          {order.items.map((it, index) => (
            <View key={it.id || index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colIndex]}>
                {index + 1}
              </Text>
              <Text style={[styles.tableCell, styles.colName]}>{it.name}</Text>
              <Text style={[styles.tableCell, styles.colSku]}>
                {it.sku || ""}
              </Text>
              <Text style={[styles.tableCell, styles.colSku]}>
                {it.hsn_code || "-"}
              </Text>
              <Text style={[styles.tableCell, styles.colQty]}>
                {Number(it.quantity || 0)}
              </Text>
              <Text style={[styles.tableCell, styles.colUnit]}>Pcs</Text>
              <Text style={[styles.tableCell, styles.colUnit]}>
                {formatCurrency(it.unit_price)}
              </Text>
              <Text style={[styles.tableCell, styles.colTotal]}>
                {formatCurrency(it.total_price)}
              </Text>
            </View>
          ))}
        </View>

        {/* GST breakdown */}
        {sellerStateName && order.address?.state && (
          <View style={{ marginTop: 8, borderWidth: 1, borderColor: "#dddddd", borderStyle: "solid" }}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.colName]}>HSN</Text>
              <Text style={[styles.tableCell, styles.colUnit]}>Taxable value</Text>
              <Text style={[styles.tableCell, styles.colUnit]}>GST rate</Text>
              <Text style={[styles.tableCell, styles.colUnit]}>Tax amount</Text>
              <Text style={[styles.tableCell, styles.colUnit]}>Total</Text>
            </View>
            {(() => {
              const taxableTotal = order.items.reduce((sum, it) => {
                const line = Number(it.total_price || 0);
                const taxable = line / 1.18;
                return sum + taxable;
              }, 0);
              const taxTotal = total - taxableTotal;
              const isIntra =
                sellerStateName.toLowerCase().trim() ===
                String(order.address?.state || "").toLowerCase().trim();
              const rateLabel = isIntra ? "9% CGST + 9% SGST" : "18% IGST";
              const displayTaxable = taxableTotal > 0 ? taxableTotal : total * (100 / 118);
              const displayTax = taxTotal > 0 ? taxTotal : total - displayTaxable;
              const displayTotal = displayTaxable + displayTax;
              return (
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.colName]}>
                    {(order.items[0] && order.items[0].hsn_code) || "-"}
                  </Text>
                  <Text style={[styles.tableCell, styles.colUnit]}>
                    {formatCurrency(displayTaxable)}
                  </Text>
                  <Text style={[styles.tableCell, styles.colUnit]}>{rateLabel}</Text>
                  <Text style={[styles.tableCell, styles.colUnit]}>
                    {formatCurrency(displayTax)}
                  </Text>
                  <Text style={[styles.tableCell, styles.colUnit]}>
                    {formatCurrency(displayTotal)}
                  </Text>
                </View>
              );
            })()}
          </View>
        )}

        <View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={styles.summaryValue}>
                -{formatCurrency(discount)}
              </Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping charges</Text>
            <Text style={styles.summaryValue}>{formatCurrency(shipping)}</Text>
          </View>
          {gstNumber && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>GST (18% incl.)</Text>
              <Text style={styles.summaryValue}>
                {estimatedGst > 0 ? `Approx. Rs. ${estimatedGst.toFixed(2)}` : "Included"}
              </Text>
            </View>
          )}
          {order.payment_method === "cod" && cod > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>COD charges</Text>
              <Text style={styles.summaryValue}>{formatCurrency(cod)}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { fontWeight: 700 }]}>
              Grand total
            </Text>
            <Text style={styles.summaryValueBold}>{formatCurrency(total)}</Text>
          </View>
          {gstNumber && (
            <View style={styles.summaryRow}>
              <Text
                style={{
                  width: "70%",
                  textAlign: "right",
                  fontSize: 8,
                  color: "#6b7280",
                  paddingRight: 8,
                }}
              >
                All prices are inclusive of GST.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for your order!</Text>
          <Text style={[styles.footerText, { marginTop: 2 }]}>
            This is a computer generated invoice and does not require a
            signature.
          </Text>
          <Text style={[styles.footerText, { marginTop: 8 }]}>
            For Nauvarah
          </Text>
          <Text style={[styles.footerText, { marginTop: 16 }]}>
            Authorised Signatory
          </Text>
        </View>
      </Page>
    </Document>
  );
}

