import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
export default function Forbidden403Page() {
    var _a = useLocation(), setLocation = _a[1];
    return (<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Ícone */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-500"/>
          </div>
        </div>

        {/* Título */}
        <h1 className="text-6xl font-bold text-white mb-2">403</h1>
        <h2 className="text-2xl font-semibold text-slate-300 mb-4">Acesso Negado</h2>

        {/* Descrição */}
        <p className="text-slate-400 mb-8">
          Desculpe, você não tem permissão para acessar este recurso. Verifique suas credenciais ou entre em contato com o administrador.
        </p>

        {/* Detalhes */}
        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 mb-8 text-left">
          <p className="text-sm text-slate-300">
            <span className="font-semibold text-slate-200">Motivo:</span> Você não possui as permissões necessárias para acessar esta página.
          </p>
          <p className="text-sm text-slate-400 mt-2">
            Se você acredita que isso é um erro, por favor entre em contato com o suporte.
          </p>
        </div>

        {/* Botões */}
        <div className="flex flex-col gap-3">
          <Button onClick={function () { return setLocation("/"); }} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 flex items-center justify-center gap-2">
            <Home className="w-4 h-4"/>
            Ir para Home
          </Button>

          <Button onClick={function () { return window.history.back(); }} variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 font-semibold py-2 flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4"/>
            Voltar
          </Button>
        </div>

        {/* Links adicionais */}
        <div className="mt-8 pt-8 border-t border-slate-700">
          <p className="text-slate-400 text-sm mb-4">Precisa de ajuda?</p>
          <div className="flex flex-col gap-2">
            <a href="mailto:support@educadq.com" className="text-teal-400 hover:text-teal-300 text-sm font-medium">
              Enviar email para suporte
            </a>
            <a href="https://wa.me/5541988913431" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 text-sm font-medium">
              Contatar via WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>);
}
