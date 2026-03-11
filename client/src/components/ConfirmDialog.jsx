import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog";
export default function ConfirmDialog(_a) {
    var open = _a.open, title = _a.title, description = _a.description, _b = _a.confirmText, confirmText = _b === void 0 ? "Confirmar" : _b, _c = _a.cancelText, cancelText = _c === void 0 ? "Cancelar" : _c, _d = _a.isDangerous, isDangerous = _d === void 0 ? false : _d, onConfirm = _a.onConfirm, onCancel = _a.onCancel, _e = _a.isLoading, isLoading = _e === void 0 ? false : _e;
    return (<AlertDialog open={open} onOpenChange={function (isOpen) { return !isOpen && onCancel(); }}>
      <AlertDialogContent className="bg-slate-800 border-slate-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-3 justify-end">
          <AlertDialogCancel className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isLoading} className={isDangerous ? "bg-red-600 hover:bg-red-700" : "bg-cyan-600 hover:bg-cyan-700"}>
            {isLoading ? "Processando..." : confirmText}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>);
}
