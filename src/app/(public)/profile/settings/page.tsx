import { Metadata } from 'next';
import { AccountSettings } from '@/components/public/profile/account-settings';

export const metadata: Metadata = {
  title: 'Account Settings | MerchTrack',
  description: 'Manage your account settings and preferences',
};

export default function AccountSettingsPage() {
  return <AccountSettings />;
}