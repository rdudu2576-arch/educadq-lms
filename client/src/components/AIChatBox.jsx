import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Loader2, Send, User, Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Streamdown } from "streamdown";
/**
 * A ready-to-use AI chat box component that integrates with the LLM system.
 *
 * Features:
 * - Matches server-side Message interface for seamless integration
 * - Markdown rendering with Streamdown
 * - Auto-scrolls to latest message
 * - Loading states
 * - Uses global theme colors from index.css
 *
 * @example
 * ```tsx
 * const ChatPage = () => {
 *   const [messages, setMessages] = useState<Message[]>([
 *     { role: "system", content: "You are a helpful assistant." }
 *   ]);
 *
 *   const chatMutation = trpc.ai.chat.useMutation({
 *     onSuccess: (response) => {
 *       // Assuming your tRPC endpoint returns the AI response as a string
 *       setMessages(prev => [...prev, {
 *         role: "assistant",
 *         content: response
 *       }]);
 *     },
 *     onError: (error) => {
 *       console.error("Chat error:", error);
 *       // Optionally show error message to user
 *     }
 *   });
 *
 *   const handleSend = (content: string) => {
 *     const newMessages = [...messages, { role: "user", content }];
 *     setMessages(newMessages);
 *     chatMutation.mutate({ messages: newMessages });
 *   };
 *
 *   return (
 *     <AIChatBox
 *       messages={messages}
 *       onSendMessage={handleSend}
 *       isLoading={chatMutation.isPending}
 *       suggestedPrompts={[
 *         "Explain quantum computing",
 *         "Write a hello world in Python"
 *       ]}
 *     />
 *   );
 * };
 * ```
 */
export function AIChatBox(_a) {
    var messages = _a.messages, onSendMessage = _a.onSendMessage, _b = _a.isLoading, isLoading = _b === void 0 ? false : _b, _c = _a.placeholder, placeholder = _c === void 0 ? "Type your message..." : _c, className = _a.className, _d = _a.height, height = _d === void 0 ? "600px" : _d, _e = _a.emptyStateMessage, emptyStateMessage = _e === void 0 ? "Start a conversation with AI" : _e, suggestedPrompts = _a.suggestedPrompts;
    var _f = useState(""), input = _f[0], setInput = _f[1];
    var scrollAreaRef = useRef(null);
    var containerRef = useRef(null);
    var inputAreaRef = useRef(null);
    var textareaRef = useRef(null);
    // Filter out system messages
    var displayMessages = messages.filter(function (msg) { return msg.role !== "system"; });
    // Calculate min-height for last assistant message to push user message to top
    var _g = useState(0), minHeightForLastMessage = _g[0], setMinHeightForLastMessage = _g[1];
    useEffect(function () {
        if (containerRef.current && inputAreaRef.current) {
            var containerHeight = containerRef.current.offsetHeight;
            var inputHeight = inputAreaRef.current.offsetHeight;
            var scrollAreaHeight = containerHeight - inputHeight;
            // Reserve space for:
            // - padding (p-4 = 32px top+bottom)
            // - user message: 40px (item height) + 16px (margin-top from space-y-4) = 56px
            // Note: margin-bottom is not counted because it naturally pushes the assistant message down
            var userMessageReservedHeight = 56;
            var calculatedHeight = scrollAreaHeight - 32 - userMessageReservedHeight;
            setMinHeightForLastMessage(Math.max(0, calculatedHeight));
        }
    }, []);
    // Scroll to bottom helper function with smooth animation
    var scrollToBottom = function () {
        var _a;
        var viewport = (_a = scrollAreaRef.current) === null || _a === void 0 ? void 0 : _a.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            requestAnimationFrame(function () {
                viewport.scrollTo({
                    top: viewport.scrollHeight,
                    behavior: 'smooth'
                });
            });
        }
    };
    var handleSubmit = function (e) {
        var _a;
        e.preventDefault();
        var trimmedInput = input.trim();
        if (!trimmedInput || isLoading)
            return;
        onSendMessage(trimmedInput);
        setInput("");
        // Scroll immediately after sending
        scrollToBottom();
        // Keep focus on input
        (_a = textareaRef.current) === null || _a === void 0 ? void 0 : _a.focus();
    };
    var handleKeyDown = function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };
    return (<div ref={containerRef} className={cn("flex flex-col bg-card text-card-foreground rounded-lg border shadow-sm", className)} style={{ height: height }}>
      {/* Messages Area */}
      <div ref={scrollAreaRef} className="flex-1 overflow-hidden">
        {displayMessages.length === 0 ? (<div className="flex h-full flex-col p-4">
            <div className="flex flex-1 flex-col items-center justify-center gap-6 text-muted-foreground">
              <div className="flex flex-col items-center gap-3">
                <Sparkles className="size-12 opacity-20"/>
                <p className="text-sm">{emptyStateMessage}</p>
              </div>

              {suggestedPrompts && suggestedPrompts.length > 0 && (<div className="flex max-w-2xl flex-wrap justify-center gap-2">
                  {suggestedPrompts.map(function (prompt, index) { return (<button key={index} onClick={function () { return onSendMessage(prompt); }} disabled={isLoading} className="rounded-lg border border-border bg-card px-4 py-2 text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50">
                      {prompt}
                    </button>); })}
                </div>)}
            </div>
          </div>) : (<ScrollArea className="h-full">
            <div className="flex flex-col space-y-4 p-4">
              {displayMessages.map(function (message, index) {
                // Apply min-height to last message only if NOT loading (when loading, the loading indicator gets it)
                var isLastMessage = index === displayMessages.length - 1;
                var shouldApplyMinHeight = isLastMessage && !isLoading && minHeightForLastMessage > 0;
                return (<div key={index} className={cn("flex gap-3", message.role === "user"
                        ? "justify-end items-start"
                        : "justify-start items-start")} style={shouldApplyMinHeight
                        ? { minHeight: "".concat(minHeightForLastMessage, "px") }
                        : undefined}>
                    {message.role === "assistant" && (<div className="size-8 shrink-0 mt-1 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="size-4 text-primary"/>
                      </div>)}

                    <div className={cn("max-w-[80%] rounded-lg px-4 py-2.5", message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground")}>
                      {message.role === "assistant" ? (<div className="prose prose-sm dark:prose-invert max-w-none">
                          <Streamdown>{message.content}</Streamdown>
                        </div>) : (<p className="whitespace-pre-wrap text-sm">
                          {message.content}
                        </p>)}
                    </div>

                    {message.role === "user" && (<div className="size-8 shrink-0 mt-1 rounded-full bg-secondary flex items-center justify-center">
                        <User className="size-4 text-secondary-foreground"/>
                      </div>)}
                  </div>);
            })}

              {isLoading && (<div className="flex items-start gap-3" style={minHeightForLastMessage > 0
                    ? { minHeight: "".concat(minHeightForLastMessage, "px") }
                    : undefined}>
                  <div className="size-8 shrink-0 mt-1 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="size-4 text-primary"/>
                  </div>
                  <div className="rounded-lg bg-muted px-4 py-2.5">
                    <Loader2 className="size-4 animate-spin text-muted-foreground"/>
                  </div>
                </div>)}
            </div>
          </ScrollArea>)}
      </div>

      {/* Input Area */}
      <form ref={inputAreaRef} onSubmit={handleSubmit} className="flex gap-2 p-4 border-t bg-background/50 items-end">
        <Textarea ref={textareaRef} value={input} onChange={function (e) { return setInput(e.target.value); }} onKeyDown={handleKeyDown} placeholder={placeholder} className="flex-1 max-h-32 resize-none min-h-9" rows={1}/>
        <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="shrink-0 h-[38px] w-[38px]">
          {isLoading ? (<Loader2 className="size-4 animate-spin"/>) : (<Send className="size-4"/>)}
        </Button>
      </form>
    </div>);
}
