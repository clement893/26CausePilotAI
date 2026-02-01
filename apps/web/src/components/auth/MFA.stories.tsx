import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import MFA from './MFA';

const meta: Meta<typeof MFA> = {
  title: 'Auth/MFA',
  component: MFA,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Multi-Factor Authentication component with TOTP support. Supports QR code setup and manual code entry.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onVerify: {
      action: 'verified',
      description: 'Callback fired when verification code is submitted',
    },
    onCancel: {
      action: 'cancelled',
      description: 'Callback fired when user cancels',
    },
    qrCodeUrl: {
      control: 'text',
      description: 'URL of QR code for MFA setup',
    },
    secret: {
      control: 'text',
      description: 'Manual entry secret key',
    },
    email: {
      control: 'text',
      description: 'User email for display',
    },
  },
};

export default meta;
type Story = StoryObj<typeof MFA>;

const InteractiveMFA = (args: any) => {
  const [verified, setVerified] = useState(false);

  const handleVerify = async (code: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    args.onVerify?.(code);
    if (code === '123456') {
      setVerified(true);
      alert('Verification successful!');
    } else {
      throw new Error('Invalid verification code');
    }
  };

  if (verified) {
    return (
      <div className="p-6 bg-[#1C1C26] rounded-lg border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-2">
          ✓ MFA Enabled
        </h3>
        <p className="text-sm text-gray-400">
          Two-factor authentication has been successfully enabled for your account.
        </p>
      </div>
    );
  }

  return <MFA {...args} onVerify={handleVerify} />;
};

export const Default: Story = {
  render: InteractiveMFA,
  args: {
    email: 'user@example.com',
  },
};

export const WithQRCode: Story = {
  render: InteractiveMFA,
  args: {
    qrCodeUrl:
      'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Example:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example',
    secret: 'JBSWY3DPEHPK3PXP',
    email: 'user@example.com',
  },
};

export const SetupMode: Story = {
  render: () => {
    const [step, setStep] = useState<'setup' | 'verify'>('setup');
    return (
      <MFA
        onVerify={async (code) => {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          alert(`Setup code: ${code}`);
        }}
        // NOTE: This is an example secret for Storybook demo only
        // In production, secrets should NEVER be hardcoded - use environment variables or API
        qrCodeUrl="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Example:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example"
        secret="JBSWY3DPEHPK3PXP"
        email="user@example.com"
      />
    );
  },
};

export const VerificationMode: Story = {
  render: InteractiveMFA,
  args: {
    email: 'user@example.com',
  },
};
