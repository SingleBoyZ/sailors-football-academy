/**
 * Dev-only stand-in for the Billplz hosted payment pages, enabled with
 * ENABLE_MOCK_GATEWAY=true. When on, bill creation is faked and the customer
 * is sent to the local /checkout/mock-gateway or /pay/mock-gateway page
 * instead of Billplz. Never enable outside development.
 */
export function isDevGatewayEnabled(): boolean {
  return process.env.ENABLE_MOCK_GATEWAY === "true";
}
