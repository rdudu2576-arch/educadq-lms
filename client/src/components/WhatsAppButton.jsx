import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
var WHATSAPP_NUMBER = "41988913431"; // EducaDQ official number
var WHATSAPP_MESSAGE = "Olá! Gostaria de saber mais sobre os cursos da EducaDQ.";
export default function WhatsAppButton() {
    var _a = useState(false), isVisible = _a[0], setIsVisible = _a[1];
    useEffect(function () {
        // Show button after 2 seconds
        var timer = setTimeout(function () { return setIsVisible(true); }, 2000);
        return function () { return clearTimeout(timer); };
    }, []);
    var handleWhatsAppClick = function () {
        var encodedMessage = encodeURIComponent(WHATSAPP_MESSAGE);
        var whatsappUrl = "https://wa.me/".concat(WHATSAPP_NUMBER, "?text=").concat(encodedMessage);
        window.open(whatsappUrl, "_blank");
    };
    if (!isVisible)
        return null;
    return (<button onClick={handleWhatsAppClick} className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 animate-bounce" title="Fale conosco no WhatsApp" aria-label="Abrir WhatsApp">
      <MessageCircle size={24}/>
    </button>);
}
