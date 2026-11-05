import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, X } from "lucide-react";
import { ConfirmDialog, Logo } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";
import { chatTitle } from "@/shared/utils/chat.utils";
import type { Chat } from "@/shared/types";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { NAV_ITEMS } from "../constants/sidebar.constants";
import { useChatSearch } from "../hooks/UseChatSearch";
import { useNewChat } from "../hooks/UseNewChat";
import { useSearchShortcut } from "../hooks/UseSearchShortcut";
import ChatListItem from "./ChatListItem";
import CreditsMeter from "./CreditsMeter";
import NavItem from "./NavItem";
import UserFooter from "./UserFooter";

interface SidebarProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

/** Left column: logo, new chat, search, date-grouped chats, navigation, credits and account. */
export default function Sidebar({ isMenuOpen, setIsMenuOpen }: SidebarProps) {
  const navigate = useNavigate();
  const chats = useChatStore((s) => s.chats);
  const selectedChatId = useChatStore((s) => s.selectedChatId);
  const selectChat = useChatStore((s) => s.selectChat);
  const renameChat = useChatStore((s) => s.renameChat);
  const pinChat = useChatStore((s) => s.pinChat);
  const deleteChat = useChatStore((s) => s.deleteChat);
  const credits = useAuthStore((s) => s.user?.credits ?? 0);
  const newChat = useNewChat();

  const { search, setSearch, groups } = useChatSearch(chats);
  const [toDelete, setToDelete] = useState<Chat | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const close = () => setIsMenuOpen(false);
  useSearchShortcut(searchRef, () => setIsMenuOpen(true));

  return (
    <>
      {/* mobile overlay */}
      {isMenuOpen && <div onClick={close} className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden" />}

      <aside
        className={cn(
          "glass max-md:bg-surface fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 flex-col border-r border-line p-3 transition-transform duration-300 md:static md:translate-x-0",
          !isMenuOpen && "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-2 pb-3 pt-1">
          <Logo
            onClick={() => {
              navigate("/");
              close();
            }}
          />
          <button onClick={close} aria-label="Close menu" className="cursor-pointer rounded-lg p-1.5 text-muted hover:bg-surface-2 md:hidden">
            <X size={18} />
          </button>
        </div>

        <button
          onClick={async () => {
            await newChat();
            close();
          }}
          className="btn-gradient flex cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition active:scale-[0.98]"
        >
          <Plus size={17} /> New chat
        </button>

        <div className="relative mt-3">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats"
            className="w-full rounded-lg border border-line bg-surface-2/60 py-2 pl-9 pr-12 text-sm outline-none transition placeholder:text-muted focus:border-brand/60"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-line px-1.5 text-[10px] text-muted">⌘K</kbd>
        </div>

        {/* chat list */}
        <nav className="-mx-1 mt-3 flex-1 space-y-4 overflow-y-auto px-1" aria-label="Chats">
          {groups.length === 0 && <p className="px-2 pt-6 text-center text-sm text-muted">{search ? "No chats match your search" : "No chats yet"}</p>}
          {groups.map((group) => (
            <div key={group.label}>
              <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">{group.label}</p>
              <ul className="space-y-0.5">
                {group.items.map((chat) => (
                  <ChatListItem
                    key={chat._id}
                    chat={chat}
                    active={chat._id === selectedChatId}
                    onSelect={() => {
                      navigate("/");
                      selectChat(chat._id);
                      close();
                    }}
                    onRename={(name) => void renameChat(chat._id, name)}
                    onTogglePin={() => void pinChat(chat._id, !chat.pinned)}
                    onRequestDelete={() => setToDelete(chat)}
                  />
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* footer */}
        <div className="mt-3 space-y-1 border-t border-line pt-3">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} to={item.to} icon={item.icon} label={item.label} onClick={close} />
          ))}
          <CreditsMeter credits={credits} />
          <UserFooter />
        </div>
      </aside>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this chat?"
        message={`"${toDelete ? chatTitle(toDelete) : ""}" and all its messages will be permanently deleted.`}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          const id = toDelete._id;
          setToDelete(null);
          await deleteChat(id);
        }}
      />
    </>
  );
}
