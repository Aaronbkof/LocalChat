import { createSignal, createEffect } from "solid-js";
import { useLocation, useParams, useNavigate, A } from "@solidjs/router";

import { ChatHistoriesContext } from "./LayoutChatHistoriesContext";
import styles from './Layout.module.css';
import { getChatHistories, deleteChatHistories, deleteChatHistory, renameChat } from "../utils/ChatHistory";


function Layout(props) {
  // TODO polish deletion of entire chat history
  //    - ui button is ugly, and needs to be clearer that the button is dangerous

  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();

  const [chatHistories, setChatHistories] = createSignal(getChatHistories());
  const [renamingId, setRenamingId] = createSignal(null);
  const [newTitle, setNewTitle]  = createSignal("");

  // hover state for mouse navigation of chats
  const [hoveredChatId, setHoveredChatId] = createSignal(null);
  
  // state for dropdown menu
  const [openMenuId, setOpenMenuId] = createSignal(null);
  
  // updates the chat history
  createEffect(() => {
    let chatList = getChatHistories();
    
    chatList.sort((c1, c2) => c2.latestMessageDate - c1.latestMessageDate);
    setChatHistories(chatList);

    chatHistories();  // whenever chatHistories is set, re-order it
    location.pathname;  // whenever the URL changes, re-fetch the chat history
  });
  
  const deleteChat = (chatId) => {
    if (!confirm("are you sure you want to remove this history?")) return;

    deleteChatHistory(chatId);
    setChatHistories(getChatHistories());

    if (location.pathname.includes(chatId)) {
      navigate('/');
    }
    setOpenMenuId(null); // Close menu after action
  };

  const deleteAllChats = () => {
    if (!confirm("Are you sure you want to remove all chat histories.")) return;
    if (!confirm("This is a confirmation check to ensure that this is really what you want to do.")) return;

    deleteChatHistories();
    navigate('/');
    setChatHistories([]);
  };
  
  // start renaming mode for a given chat
  const startRenaming = (chatId) => {
    setRenamingId(chatId);
    const chat = chatHistories().find(c => c.chatId === chatId);
    setNewTitle(chat?.title || chat.chatId);
    setOpenMenuId(null); // Close menu when starting rename
  };

  // apply and save new title
  const applyRename = () => {
    renameChat(renamingId(), newTitle());
    setChatHistories(getChatHistories());
    setRenamingId(null);
  };

  // toggle dropdown menu
  const toggleMenu = (chatId) => {
    setOpenMenuId(openMenuId() === chatId ? null : chatId);
  };

  // close menu when clicking outside
  const handleClickOutside = (e) => {
    if (!e.target.closest(`.${styles.menuContainer}`)) {
      setOpenMenuId(null);
    }
  };

  // Add click listener to close menu when clicking outside
  createEffect(() => {
    if (openMenuId()) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }
    
    // Cleanup
    return () => document.removeEventListener('click', handleClickOutside);
  });

  return (
    <>
      <div class="container">
        <div class="sidebarContainer">

          <h1>Local Chat</h1>
          <A href="models">Model Testing</A>
          <br/><br/>
          <A href="/">Create New Chat</A>
          <br/><br/>

          <h2>Chat History</h2>
          <For each={chatHistories()}>{(chat) =>
            <div class={`${styles.chatHistoryContainer} ${hoveredChatId() === chat.chatId ? styles.highlighted : ''} ${params.id === chat.chatId ? styles.active : ''}`}
              onMouseEnter={() => setHoveredChatId(chat.chatId)}
              onMouseLeave={() => setHoveredChatId(null)}
            >
              <Show
                when={renamingId() === chat.chatId}
                fallback={
                  <div class={styles.chatHistoryEntry}>
                    <A 
                      href={`/chat/${chat.chatId}`}
                      title={`Created: ${new Date(chat.creationDate).toUTCString()} | Latest: ${new Date(chat.latestMessageDate).toUTCString()}`}
                    >
                      {chat.chatName}
                    </A>
                    <div class={styles.menuContainer}>
                      <button 
                        class={styles.menuButton}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleMenu(chat.chatId);
                        }}
                      >
                        ⋯
                      </button>
                      <Show when={openMenuId() === chat.chatId}>
                        <div class={styles.dropdown}>
                          <button 
                            class={styles.dropdownItem}
                            onClick={(e) => {
                              e.stopPropagation();
                              startRenaming(chat.chatId);
                            }}
                          >
                            Rename
                          </button>
                          <button 
                            class={styles.dropdownItem}
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteChat(chat.chatId);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </Show>
                    </div>
                  </div>
                }
              >
                {/* section handling renaming UI */}
                <input type="text" value={newTitle()}
                  onInput={e => setNewTitle(e.currentTarget.value)}
                  onKeyDown={e => e.key === 'Enter' && applyRename()}
                  style="margin-right:0.5em; width: 200px;"
                />
                <button onClick={applyRename}>Save</button>
                <button onClick={() => setRenamingId(null)}>Cancel</button>
              </Show>
            </div>
          }</For>
          <br/>

          <button onClick={deleteAllChats}>Delete Chat History</button>
          <br />
        </div>
        <div class="pageContainer">
          <ChatHistoriesContext.Provider value={{ setChatHistories }}>
            {props.children} {/* nested components are passed in here */}
          </ChatHistoriesContext.Provider>
        </div>
      </div>
    </>
  );
}

export default Layout;