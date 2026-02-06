import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, CreditCard, Smartphone, Building } from 'lucide-react';
import { PAYMENT_CONFIG, MPESA_TEST_PHONES } from '@/lib/payment-config';
import { useToast } from '@/hooks/use-toast';

const PaymentTestInfo = () => {
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`,
    });
  };

  if (!PAYMENT_CONFIG.isTestMode) {
    return null;
  }

  return (
    <Card className="border-2 border-dashed border-orange-300 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          🧪 Test Mode - Payment Credentials
        </CardTitle>
        <CardDescription className="text-orange-700">
          Use these test credentials to test payment functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* PesaPal Test Info */}
        <div>
          <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            PesaPal Test Cards
          </h4>
          <div className="text-sm text-orange-700 space-y-2">
            <p>Use any valid Visa/Mastercard test card for PesaPal Sandbox.</p>
            <p className="text-xs italic">Note: PesaPal Sandbox accepts most international test cards.</p>
          </div>
        </div>

        {/* M-Pesa Test Phones */}
        <div>
          <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            M-Pesa Test Phone Numbers
          </h4>
          <div className="grid gap-2">
            {MPESA_TEST_PHONES.slice(0, 3).map((phone, index) => (
              <div key={phone} className="flex items-center justify-between p-2 bg-white rounded border">
                <div>
                  <span className="font-medium">Test {index + 1}:</span>
                  <span className="ml-2 font-mono text-sm">{phone}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(phone, `M-Pesa test phone ${index + 1}`)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <div className="text-xs text-orange-600 mt-2">
              <strong>Note:</strong> Use these numbers to test M-Pesa payments in sandbox mode
            </div>
          </div>
        </div>

        {/* Bank Transfer Info */}
        <div>
          <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
            <Building className="w-4 h-4" />
            Bank Transfer Details
          </h4>
          <div className="bg-white p-3 rounded border">
            <div className="space-y-1 text-sm">
              <div><strong>Bank:</strong> {PAYMENT_CONFIG.bankTransfer.bankName}</div>
              <div><strong>Account:</strong> {PAYMENT_CONFIG.bankTransfer.accountNumber}</div>
              <div><strong>Name:</strong> {PAYMENT_CONFIG.bankTransfer.accountName}</div>
              <div><strong>Swift:</strong> {PAYMENT_CONFIG.bankTransfer.swiftCode}</div>
            </div>
          </div>
        </div>

        {/* Test Mode Badge */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
            🧪 Test Mode Active
          </Badge>
          <span className="text-xs text-orange-600">
            All payments are processed in test/sandbox mode
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentTestInfo;
