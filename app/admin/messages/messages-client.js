"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteMessage, updateMessageStatus } from "./actions";

const statusLabels = {
  new: "New",
  read: "Read",
  replied: "Replied",
};

function formatMessageDate(value) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "Date unavailable";

  return `${new Date(timestamp).toISOString().replace("T", " ").slice(0, 16)} UTC`;
}

function MessageStatus({ status }) {
  return (
    <span className={`admin-message-status is-${status}`}>
      {statusLabels[status] || "New"}
    </span>
  );
}

function MessageActions({
  message,
  updating,
  onStatusChange,
  onDelete,
  onView,
  showView = true,
}) {
  return (
    <div className="admin-message-actions">
      {showView && (
        <button
          type="button"
          className="admin-project-secondary-button"
          onClick={() => onView(message)}
        >
          View details
        </button>
      )}
      {message.status !== "read" && (
        <button
          type="button"
          className="admin-project-secondary-button"
          onClick={() => onStatusChange(message, "read")}
          disabled={updating}
        >
          {updating ? "Updating…" : "Mark as Read"}
        </button>
      )}
      {message.status !== "replied" && (
        <button
          type="button"
          className="admin-project-secondary-button"
          onClick={() => onStatusChange(message, "replied")}
          disabled={updating}
        >
          {updating ? "Updating…" : "Mark as Replied"}
        </button>
      )}
      <button
        type="button"
        className="admin-project-delete-button"
        onClick={() => onDelete(message)}
        disabled={updating}
      >
        Delete
      </button>
    </div>
  );
}

function MessageDetails({ message, onClose, onStatusChange, onDelete, updating }) {
  return (
    <div
      className="admin-project-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !updating) onClose();
      }}
    >
      <section
        className="admin-project-modal admin-message-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="message-details-title"
      >
        <header className="admin-project-modal-header">
          <div>
            <span className="admin-section-kicker">CONTACT MESSAGE</span>
            <h2 id="message-details-title">{message.subject}</h2>
          </div>
          <button
            type="button"
            className="admin-project-close"
            onClick={onClose}
            disabled={updating}
            aria-label="Close message details"
          >
            ×
          </button>
        </header>

        <div className="admin-message-detail-content">
          <dl className="admin-message-detail-meta">
            <div>
              <dt>Name</dt>
              <dd>{message.name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${message.email}`}>{message.email}</a>
              </dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <MessageStatus status={message.status} />
              </dd>
            </div>
            <div>
              <dt>Date</dt>
              <dd>
                <time dateTime={message.createdAt}>
                  {formatMessageDate(message.createdAt)}
                </time>
              </dd>
            </div>
          </dl>
          <div className="admin-message-detail-body">
            <span className="admin-section-kicker">MESSAGE</span>
            <p>{message.message}</p>
          </div>
          <MessageActions
            message={message}
            updating={updating}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
            showView={false}
          />
        </div>
      </section>
    </div>
  );
}

function MessageCard({ message, updating, onStatusChange, onDelete, onView }) {
  return (
    <article className={`admin-message-card is-${message.status}`}>
      <div className="admin-message-card-heading">
        <div>
          <MessageStatus status={message.status} />
          <h2>{message.subject}</h2>
        </div>
        <time dateTime={message.createdAt}>
          {formatMessageDate(message.createdAt)}
        </time>
      </div>
      <div className="admin-message-sender">
        <strong>{message.name}</strong>
        <a href={`mailto:${message.email}`}>{message.email}</a>
      </div>
      <p className="admin-message-preview">{message.message}</p>
      <MessageActions
        message={message}
        updating={updating}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
        onView={onView}
      />
    </article>
  );
}

export default function MessagesClient({ messages: initialMessages, initialError }) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [loadError, setLoadError] = useState(initialError);
  const [notice, setNotice] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [updatingId, setUpdatingId] = useState("");
  const [isRefreshing, startRefresh] = useTransition();

  const filteredMessages = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return messages.filter((message) => {
      const matchesStatus =
        statusFilter === "all" || message.status === statusFilter;
      const searchableText = [
        message.name,
        message.email,
        message.subject,
        message.message,
      ]
        .join(" ")
        .toLowerCase();

      return (
        matchesStatus &&
        (!normalizedSearch || searchableText.includes(normalizedSearch))
      );
    });
  }, [messages, search, statusFilter]);

  async function handleStatusChange(message, status) {
    setNotice(null);
    setUpdatingId(message._id);

    try {
      const response = await updateMessageStatus(message._id, status);
      setMessages((current) =>
        current.map((item) =>
          item._id === message._id ? response.contact : item
        )
      );
      setSelectedMessage((current) =>
        current?._id === message._id ? response.contact : current
      );
      setNotice({
        type: "success",
        message: response.message || `Message marked as ${statusLabels[status]}.`,
      });
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error.message === "BACKEND_UNAVAILABLE"
            ? "The backend is unavailable. Please try again."
            : error.message || "Unable to update the message status.",
      });
    } finally {
      setUpdatingId("");
    }
  }

  async function handleDelete(message) {
    if (
      !window.confirm(
        `Delete the message from "${message.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setNotice(null);
    setUpdatingId(message._id);

    try {
      const response = await deleteMessage(message._id);
      setMessages((current) =>
        current.filter((item) => item._id !== message._id)
      );
      setSelectedMessage((current) =>
        current?._id === message._id ? null : current
      );
      setNotice({
        type: "success",
        message: response.message || "Contact message deleted successfully.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error.message === "BACKEND_UNAVAILABLE"
            ? "The backend is unavailable. Please try again."
            : error.message || "Unable to delete the message.",
      });
    } finally {
      setUpdatingId("");
    }
  }

  return (
    <section className="admin-messages" aria-labelledby="messages-title">
      <header className="admin-projects-heading">
        <div>
          <span className="admin-eyebrow">INBOX</span>
          <h1 id="messages-title">
            Contact Messages<span>.</span>
          </h1>
          <p>Review and manage messages sent through your portfolio.</p>
        </div>
      </header>

      {notice && (
        <div
          className={`admin-project-notice is-${notice.type}`}
          role={notice.type === "error" ? "alert" : "status"}
        >
          <span aria-hidden="true">{notice.type === "error" ? "!" : "✓"}</span>
          {notice.message}
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      )}

      {loadError ? (
        <div className="admin-project-empty">
          <span className="admin-section-kicker">UNABLE TO LOAD</span>
          <h2>Messages aren&apos;t available right now.</h2>
          <p>{loadError}</p>
          <button
            type="button"
            className="admin-project-secondary-button"
            disabled={isRefreshing}
            onClick={() => startRefresh(() => router.refresh())}
          >
            {isRefreshing ? "Refreshing…" : "Try again"}
          </button>
        </div>
      ) : (
        <>
          <div className="admin-message-toolbar">
            <label className="admin-message-search">
              <span className="admin-sr-only">Search messages</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email, subject or message"
              />
            </label>
            <label className="admin-message-filter">
              <span>Status</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">All messages</option>
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
              </select>
            </label>
            <span className="admin-message-count">
              {filteredMessages.length}{" "}
              {filteredMessages.length === 1 ? "message" : "messages"}
            </span>
          </div>

          {messages.length === 0 ? (
            <div className="admin-project-empty">
              <span className="admin-project-empty-mark" aria-hidden="true">
                N.
              </span>
              <span className="admin-section-kicker">YOUR INBOX</span>
              <h2>No contact messages yet</h2>
              <p>Messages submitted through the public contact API will appear here.</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="admin-project-empty admin-message-filter-empty">
              <h2>No messages match this search</h2>
              <p>Try a different search term or status filter.</p>
            </div>
          ) : (
            <div className="admin-message-list">
              {filteredMessages.map((message) => (
                <MessageCard
                  key={message._id}
                  message={message}
                  updating={updatingId === message._id}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                  onView={setSelectedMessage}
                />
              ))}
            </div>
          )}
        </>
      )}

      {selectedMessage && (
        <MessageDetails
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          updating={updatingId === selectedMessage._id}
        />
      )}
    </section>
  );
}
