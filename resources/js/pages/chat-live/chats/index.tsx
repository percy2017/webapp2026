import { Head, router, usePage } from '@inertiajs/react';
import { ImageIcon, Loader2, MessageCircle, Search, Send, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Input } from '@/components/ui/input';
import { useInitials } from '@/hooks/use-initials';
import { destroy as chatDestroy, poll as chatPoll, show as chatShow } from '@/routes/chat-live/chats';
import { store as messageStore } from '@/routes/chat-live/messages';
import { admin } from '@/routes';
import type { Paginated } from '@/types';
import type { BreadcrumbItem } from '@/types';
import { csrfJson } from '@/lib/csrf';

type ChatUser = {
    id: number;
    name: string;
    email: string;
    avatar_url: string | null;
};

type ChatItem = {
    id: number;
    user_id: number;
    status: string;
    last_message_at: string | null;
    unread_count: number;
    preview: string;
    user: { id: number; name: string; email: string };
    user_avatar_url: string | null;
};

type Attachment = {
    id: number;
    name: string;
    file_name: string;
    mime_type: string;
    size: number;
    url: string;
};

type ChatMessage = {
    id: number;
    sender_id: number | null;
    sender_type: 'agent' | 'visitor' | string;
    sender_name: string | null;
    sender_avatar_url: string | null;
    content: string | null;
    created_at: string;
    attachments: Attachment[];
};

type ActiveChat = {
    id: number;
    user: ChatUser;
    status: string;
    messages: ChatMessage[];
};

type Props = {
    chats: Paginated<ChatItem>;
    activeChat?: ActiveChat;
};

function formatTime(iso: string | null | undefined): string {
    if (!iso) return '';
    const date = new Date(iso);
    const now = new Date();
    const sameDay = date.toDateString() === now.toDateString();

    if (sameDay) {
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }

    const diffDays = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays < 7) {
        return ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'][date.getDay()];
    }

    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getFullYear()).slice(-2)}`;
}

function bytesToReadable(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ChatsIndex({ chats, activeChat }: Props) {
    const getInitials = useInitials();
    const { props } = usePage<{ auth?: { user?: { id: number } } }>();
    const me = props.auth?.user;

    const [selectedChatId, setSelectedChatId] = useState<number | null>(
        activeChat?.id ?? null,
    );
    const [messages, setMessages] = useState<ChatMessage[]>(
        activeChat?.messages ?? [],
    );
    const [text, setText] = useState('');
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [sending, setSending] = useState(false);
    const [search, setSearch] = useState('');
    const [deleteOpen, setDeleteOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (activeChat?.messages) {
            setMessages(activeChat.messages);
        }
    }, [activeChat?.id, activeChat?.messages?.length]);

    useEffect(() => {
        const echo = (window as any).Echo;
        if (!echo) return;

        const chatIds = new Set<number>();
        if (selectedChatId) chatIds.add(selectedChatId);
        for (const c of chats.data) chatIds.add(c.id);

        const channels: any[] = [];
        for (const id of chatIds) {
            const ch = echo.private(`chat.${id}`);
            ch.listen('.message.sent', () => {
                router.reload({ only: ['chats', 'activeChat'] });
            });
            channels.push(ch);
        }

        return () => {
            for (const ch of channels) {
                ch.stopListening('.message.sent');
            }
        };
    }, [selectedChatId, chats.data.length]);

    function selectChat(chat: ChatItem) {
        if (chat.id === selectedChatId) return;
        setSelectedChatId(chat.id);
        router.get(chatShow(chat.id), {}, { preserveState: false });
    }

    function addFiles(files: FileList | null) {
        if (!files) return;
        const incoming = Array.from(files).slice(0, 5 - pendingFiles.length);
        if (incoming.length === 0) return;
        setPendingFiles((prev) => [...prev, ...incoming]);
    }

    function removeFile(index: number) {
        setPendingFiles((prev) => prev.filter((_, i) => i !== index));
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    function confirmDelete() {
        if (!selectedChatId) return;
        router.delete(chatDestroy(selectedChatId), {
            onSuccess: () => {
                setSelectedChatId(null);
                setMessages([]);
                setDeleteOpen(false);
            },
        });
    }

    function send(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!selectedChatId || (!text.trim() && pendingFiles.length === 0)) return;

        setSending(true);

        const formData = new FormData();
        if (text.trim()) formData.append('content', text);
        pendingFiles.forEach((file, i) => {
            formData.append(`attachments[${i}]`, file);
        });

        router.post(messageStore(selectedChatId), formData, {
            preserveScroll: true,
            onSuccess: () => {
                setText('');
                setPendingFiles([]);
                if (fileInputRef.current) fileInputRef.current.value = '';
                setSending(false);
            },
            onError: () => setSending(false),
        });
    }

    const filtered = chats.data.filter((c) =>
        search
            ? c.user.name.toLowerCase().includes(search.toLowerCase()) ||
              c.user.email.toLowerCase().includes(search.toLowerCase())
            : true,
    );

    const selectedUser = activeChat?.user;
    const canSend = !!text.trim() || pendingFiles.length > 0;

    return (
        <>
            <Head title="Chats" />

            <div className="flex h-[calc(100vh-5rem)] flex-col pl-2 pt-2 sm:pl-3 sm:pt-3">
                <div className="flex flex-1 overflow-hidden rounded-lg border bg-card">
                    <aside className="flex w-full max-w-sm flex-col border-r md:w-80">
                        <div className="border-b p-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Buscar chat..."
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {filtered.length === 0 ? (
                                <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
                                    {chats.data.length === 0 ? (
                                        <div className="text-center">
                                            <MessageCircle className="mx-auto h-10 w-10 opacity-40" />
                                            <p className="mt-2">
                                                Aún no hay chats
                                            </p>
                                        </div>
                                    ) : (
                                        'Sin resultados'
                                    )}
                                </div>
                            ) : (
                                filtered.map((chat) => (
                                    <button
                                        key={chat.id}
                                        type="button"
                                        onClick={() => selectChat(chat)}
                                        className={`flex w-full items-start gap-3 border-b p-3 text-left transition-colors hover:bg-accent/50 ${
                                            selectedChatId === chat.id
                                                ? 'bg-accent'
                                                : ''
                                        }`}
                                    >
                                        <Avatar className="h-10 w-10 shrink-0">
                                            {chat.user_avatar_url ? (
                                                <AvatarImage
                                                    src={chat.user_avatar_url}
                                                    alt={chat.user.name}
                                                />
                                            ) : null}
                                            <AvatarFallback>
                                                {getInitials(chat.user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="truncate text-sm font-semibold">
                                                    {chat.user.name}
                                                </p>
                                                <span className="shrink-0 text-xs text-muted-foreground">
                                                    {formatTime(
                                                        chat.last_message_at,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="mt-0.5 flex items-center justify-between gap-2">
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {chat.preview}
                                                </p>
                                                {chat.unread_count > 0 && (
                                                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                                                        {chat.unread_count}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </aside>

                    <section className="flex flex-1 flex-col bg-muted/20">
                        {selectedChatId && activeChat && selectedUser ? (
                            <>
                                <header className="flex items-center gap-3 border-b bg-card px-4 py-3">
                                    <Avatar className="h-10 w-10">
                                        {selectedUser.avatar_url ? (
                                            <AvatarImage
                                                src={selectedUser.avatar_url}
                                                alt={selectedUser.name}
                                            />
                                        ) : null}
                                        <AvatarFallback>
                                            {getInitials(selectedUser.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-semibold">
                                            {selectedUser.name}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {selectedUser.email}
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setDeleteOpen(true)}
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        title="Eliminar chat"
                                        aria-label="Eliminar chat"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </header>

                                <div className="flex-1 overflow-y-auto px-4 py-3">
                                    <div className="space-y-2">
                                        {messages.map((message) => {
                                            const mine =
                                                message.sender_id === me?.id;

                                            return (
                                                <div
                                                    key={message.id}
                                                    className={`flex ${
                                                        mine
                                                            ? 'justify-end'
                                                            : 'justify-start'
                                                    }`}
                                                >
                                                    <div
                                                        className={`max-w-[75%] rounded-lg px-3 py-2 text-sm shadow-sm ${
                                                            mine
                                                                ? 'bg-primary text-primary-foreground'
                                                                : 'bg-card'
                                                        }`}
                                                    >
                                                        {message.content && (
                                                            <p className="whitespace-pre-wrap break-words">
                                                                {message.content}
                                                            </p>
                                                        )}
                                                        {message.attachments
                                                            .length > 0 && (
                                                            <div className="mt-1 space-y-1">
                                                                {message.attachments.map(
                                                                    (att) => (
                                                                        <a
                                                                            key={
                                                                                att.id
                                                                            }
                                                                            href={
                                                                                att.url
                                                                            }
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className={`flex items-center gap-2 rounded border px-2 py-1 text-xs ${
                                                                                mine
                                                                                    ? 'border-primary-foreground/30'
                                                                                    : 'border-border'
                                                                            }`}
                                                                        >
                                                                            <ImageIcon className="h-3 w-3 shrink-0" />
                                                                            <span className="truncate">
                                                                                {
                                                                                    att.file_name
                                                                                }
                                                                            </span>
                                                                        </a>
                                                                    ),
                                                                )}
                                                            </div>
                                                        )}
                                                        <p
                                                            className={`mt-1 text-[10px] ${
                                                                mine
                                                                    ? 'text-primary-foreground/70'
                                                                    : 'text-muted-foreground'
                                                            }`}
                                                        >
                                                            {formatTime(
                                                                message.created_at,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </div>

                                <form
                                    onSubmit={send}
                                    className="space-y-2 border-t bg-card p-3"
                                >
                                    {pendingFiles.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {pendingFiles.map((file, i) => (
                                                <div
                                                    key={`${file.name}-${i}`}
                                                    className="flex items-center gap-2 rounded-md border bg-muted/40 px-2 py-1 text-xs"
                                                >
                                                    <ImageIcon className="h-3 w-3 shrink-0 text-muted-foreground" />
                                                    <span className="max-w-[180px] truncate">
                                                        {file.name}
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        {bytesToReadable(file.size)}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeFile(i)
                                                        }
                                                        className="ml-1 rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                        aria-label="Quitar archivo"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.zip"
                                            onChange={(e) =>
                                                addFiles(e.target.files)
                                            }
                                            className="hidden"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                            disabled={
                                                sending ||
                                                pendingFiles.length >= 5
                                            }
                                            className="h-9 w-9 shrink-0"
                                            title="Adjuntar archivo"
                                            aria-label="Adjuntar archivo"
                                        >
                                            <ImageIcon className="h-4 w-4" />
                                        </Button>
                                        <Input
                                            value={text}
                                            onChange={(e) =>
                                                setText(e.target.value)
                                            }
                                            placeholder="Escribe un mensaje..."
                                            disabled={sending}
                                            autoComplete="off"
                                        />
                                        <Button
                                            type="submit"
                                            size="icon"
                                            disabled={sending || !canSend}
                                            className="h-9 w-9 shrink-0"
                                        >
                                            {sending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Send className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                                <div className="text-center">
                                    <MessageCircle className="mx-auto h-12 w-12 opacity-30" />
                                    <p className="mt-3">
                                        Selecciona un chat para empezar
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>

            <ConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Eliminar chat"
                description="¿Eliminar este chat y todos sus mensajes? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                variant="destructive"
                onConfirm={confirmDelete}
            />
        </>
    );
}

ChatsIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: admin() },
        { title: 'Chat-live', href: '/admin/chat-live/chats' },
        { title: 'Chats', href: '/admin/chat-live/chats' },
    ],
};