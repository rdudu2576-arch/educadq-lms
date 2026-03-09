import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Save, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      toast.success("Perfil atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar perfil");
    },
  });

  const [form, setForm] = useState({
    name: "",
    cpf: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: (user as any).name || "",
        cpf: (user as any).cpf || "",
        phone: (user as any).phone || "",
        address: (user as any).address || "",
        city: (user as any).city || "",
        state: (user as any).state || "",
        zip: (user as any).zip || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(form);
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-to-r from-teal-800 to-teal-600 text-white py-12">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8" />
            <h1 className="text-2xl md:text-3xl font-bold">Meu Perfil</h1>
          </div>
          <p className="text-teal-100 mt-2">Gerencie suas informações pessoais</p>
        </div>
      </section>

      <div className="container max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dados Pessoais */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Dados Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    value={(user as any).email || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={form.cpf}
                    onChange={(e) => handleChange("cpf", e.target.value)}
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone / WhatsApp</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Endereço */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Endereço</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={form.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="Rua, número, complemento"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    placeholder="Sua cidade"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={form.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">CEP</Label>
                  <Input
                    id="zip"
                    value={form.zip}
                    onChange={(e) => handleChange("zip", e.target.value)}
                    placeholder="00000-000"
                    maxLength={9}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end mt-6">
            <Button type="submit" disabled={updateProfile.isPending} className="bg-teal-600 hover:bg-teal-700">
              {updateProfile.isPending ? (
                <>Salvando...</>
              ) : updateProfile.isSuccess ? (
                <><CheckCircle className="w-4 h-4 mr-2" /> Salvo</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> Salvar Alterações</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
