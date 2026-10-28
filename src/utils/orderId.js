import { v4 } from "uuid";

export const generateOrderId = () => `ord-${v4()}`;
