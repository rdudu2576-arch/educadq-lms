var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
    var _this = this;
    var user = useAuth().user;
    var utils = trpc.useUtils();
    var updateProfile = trpc.auth.updateProfile.useMutation({
        onSuccess: function () {
            utils.auth.me.invalidate();
            toast.success("Perfil atualizado com sucesso!");
        },
        onError: function () {
            toast.error("Erro ao atualizar perfil");
        },
    });
    var _a = useState({
        name: "",
        cpf: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zip: "",
    }), form = _a[0], setForm = _a[1];
    useEffect(function () {
        if (user) {
            setForm({
                name: user.name || "",
                cpf: user.cpf || "",
                phone: user.phone || "",
                address: user.address || "",
                city: user.city || "",
                state: user.state || "",
                zip: user.zip || "",
            });
        }
    }, [user]);
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            e.preventDefault();
            updateProfile.mutate(form);
            return [2 /*return*/];
        });
    }); };
    var handleChange = function (field, value) {
        setForm(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[field] = value, _a)));
        });
    };
    if (!user) {
        return (<div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>);
    }
    return (<div className="min-h-screen bg-background">
      <section className="bg-gradient-to-r from-teal-800 to-teal-600 text-white py-12">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8"/>
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
                  <Input id="name" value={form.name} onChange={function (e) { return handleChange("name", e.target.value); }} placeholder="Seu nome completo"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" value={user.email || ""} disabled className="bg-muted"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input id="cpf" value={form.cpf} onChange={function (e) { return handleChange("cpf", e.target.value); }} placeholder="000.000.000-00" maxLength={14}/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone / WhatsApp</Label>
                  <Input id="phone" value={form.phone} onChange={function (e) { return handleChange("phone", e.target.value); }} placeholder="(00) 00000-0000" maxLength={15}/>
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
                  <Input id="address" value={form.address} onChange={function (e) { return handleChange("address", e.target.value); }} placeholder="Rua, número, complemento"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input id="city" value={form.city} onChange={function (e) { return handleChange("city", e.target.value); }} placeholder="Sua cidade"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input id="state" value={form.state} onChange={function (e) { return handleChange("state", e.target.value); }} placeholder="UF" maxLength={2}/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">CEP</Label>
                  <Input id="zip" value={form.zip} onChange={function (e) { return handleChange("zip", e.target.value); }} placeholder="00000-000" maxLength={9}/>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end mt-6">
            <Button type="submit" disabled={updateProfile.isPending} className="bg-teal-600 hover:bg-teal-700">
              {updateProfile.isPending ? (<>Salvando...</>) : updateProfile.isSuccess ? (<><CheckCircle className="w-4 h-4 mr-2"/> Salvo</>) : (<><Save className="w-4 h-4 mr-2"/> Salvar Alterações</>)}
            </Button>
          </div>
        </form>
      </div>
    </div>);
}
