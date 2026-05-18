import { Metadata } from 'next';
import AdminDashboardClient from './AdminDashboardClient';

export const metadata: Metadata = {
  title: 'Admin Portal | Seematra',
};

export default function AdminPage() {
  return <AdminDashboardClient />;
}
