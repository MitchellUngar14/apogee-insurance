// HTTP Client for communicating with Customer Service
// Customer type - represents a customer from Customer Service
interface Customer {
  id: number;
  name: string;
  email: string;
}

const CUSTOMER_SERVICE_URL = process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3002';
const INTERNAL_SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY || 'dev-secret-key';

const headers = {
  'X-Service-Key': INTERNAL_SERVICE_KEY,
  'Content-Type': 'application/json',
};

// Fetch all customers from Customer Service
export async function fetchCustomers(): Promise<Customer[]> {
  const response = await fetch(`${CUSTOMER_SERVICE_URL}/api/customers`, { headers });
  if (!response.ok) {
    throw new Error(`Failed to fetch customers: ${response.statusText}`);
  }
  return response.json();
}
