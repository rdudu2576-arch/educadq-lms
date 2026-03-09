import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function PaymentPage() {
  const { user, loading } = useAuth();
  const [selectedPayment, setSelectedPayment] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Você precisa estar autenticado.</p>
      </div>
    );
  }

  // Fetch payments
  const { data: payments, isLoading: paymentsLoading } = trpc.payments.getStudentPayments.useQuery(
    undefined,
    { enabled: !!user }
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-600">Pago</Badge>;
      case "pending":
        return <Badge className="bg-yellow-600">Pendente</Badge>;
      case "partial":
        return <Badge className="bg-blue-600">Parcial</Badge>;
      case "overdue":
        return <Badge className="bg-red-600">Atrasado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {