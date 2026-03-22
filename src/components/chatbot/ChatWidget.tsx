'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  Bot,
  Building2,
  CalendarDays,
  ChevronRight,
  Loader2,
  Mail,
  MessageCircle,
  Package2,
  Phone,
  Send,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PRODUCTS, type ProductData } from '@/lib/data';
import {
  buildFallbackChatReply,
  type ChatMessageInput,
  type ChatProductMatch,
  type ChatReplyPayload,
} from '@/lib/chatbot';
import styles from './ChatWidget.module.css';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  source?: 'gemini' | 'fallback' | 'system';
  products?: ChatProductMatch[];
  quickReplies?: string[];
  allowLeadCapture?: boolean;
  allowMeetingCapture?: boolean;
  machineInterest?: string;
  link?: { label: string; href: string };
};

type Contact = { name: string; email: string; phone: string; company: string };
type LeadForm = Contact & { message: string; machineInterest: string };
type MeetingForm = Contact & { date: string; time: string; message: string; machineInterest: string };

const STARTERS = ['I need a pouch sealing machine', 'Show shrink wrapping machines', 'Schedule a meeting'];
const SLOTS = ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'];
const EMPTY_CONTACT: Contact = { name: '', email: '', phone: '', company: '' };
const EMPTY_LEAD: LeadForm = { ...EMPTY_CONTACT, message: '', machineInterest: '' };
const EMPTY_MEETING: MeetingForm = { ...EMPTY_CONTACT, date: '', time: '', message: '', machineInterest: '' };
const GREETING: Message = {
  id: 'greeting',
  role: 'assistant',
  source: 'system',
  text: 'Hi, I am the Spectra Pack AI sales assistant. Ask for a machine, quote, or meeting and I will guide you from the live catalog. I can also collect your enquiry directly in chat.',
  quickReplies: STARTERS,
  allowLeadCapture: true,
  allowMeetingCapture: true,
};

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const validPhone = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 6 && digits.length <= 15;
};
const historyOf = (messages: Message[]): ChatMessageInput[] => messages.map((message) => ({ role: message.role === 'assistant' ? 'assistant' : 'user', text: message.text }));
const toAssistantMessage = (payload: ChatReplyPayload): Message => ({
  id: createId(),
  role: 'assistant',
  text: payload.reply,
  source: payload.source,
  products: payload.matchedProducts,
  quickReplies: payload.quickReplies,
  allowLeadCapture: payload.allowLeadCapture,
  allowMeetingCapture: payload.allowMeetingCapture,
  machineInterest: payload.machineInterest,
});

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [products, setProducts] = useState<ProductData[]>(PRODUCTS);
  const [sending, setSending] = useState(false);
  const [panel, setPanel] = useState<'none' | 'lead' | 'meeting'>('none');
  const [saving, setSaving] = useState(false);
  const [contact, setContact] = useState<Contact>(EMPTY_CONTACT);
  const [lead, setLead] = useState<LeadForm>(EMPTY_LEAD);
  const [meeting, setMeeting] = useState<MeetingForm>(EMPTY_MEETING);
  const endRef = useRef<HTMLDivElement>(null);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending, panel]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) setProducts(data as ProductData[]);
      } catch {
        // Local fallback stays active.
      }
    };
    void loadProducts();
  }, []);

  const latestMachine = () =>
    lead.machineInterest.trim() ||
    meeting.machineInterest.trim() ||
    [...messages].reverse().find((message) => message.machineInterest?.trim())?.machineInterest?.trim() ||
    '';

  const syncMachine = (payload: ChatReplyPayload) => {
    const machineInterest = payload.machineInterest.trim();
    if (!machineInterest) return;
    setLead((prev) => ({ ...prev, machineInterest, message: prev.message.trim() || `I need details and pricing for ${machineInterest}.` }));
    setMeeting((prev) => ({ ...prev, machineInterest, message: prev.message.trim() || `I want to discuss ${machineInterest} in the meeting.` }));
  };

  const askAssistant = async (history: ChatMessageInput[]) => {
    const fallback = buildFallbackChatReply(history, products);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json().catch(() => null);
      return !res.ok || !data || typeof data.reply !== 'string' ? fallback : (data as ChatReplyPayload);
    } catch {
      return fallback;
    }
  };

  const sendMessage = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || sending) return;
    const nextMessages = [...messages, { id: createId(), role: 'user' as const, text }];
    setMessages(nextMessages);
    setInput('');
    setSending(true);
    try {
      const payload = await askAssistant(historyOf(nextMessages));
      setMessages((prev) => [...prev, toAssistantMessage(payload)]);
      syncMachine(payload);
    } finally {
      setSending(false);
    }
  };

  const openLead = (machineInterest?: string) => {
    const interest = machineInterest?.trim() || latestMachine();
    setLead((prev) => ({ ...prev, ...contact, machineInterest: interest, message: prev.message.trim() || (interest ? `I need details and pricing for ${interest}.` : 'I need a machine recommendation and quotation.') }));
    setPanel('lead');
  };

  const openMeeting = (machineInterest?: string) => {
    const interest = machineInterest?.trim() || latestMachine();
    setMeeting((prev) => ({ ...prev, ...contact, machineInterest: interest, message: prev.message.trim() || (interest ? `I want to discuss ${interest} in the meeting.` : 'I want to discuss my packaging requirement.') }));
    setPanel('meeting');
  };

  const submitLead = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!lead.name.trim()) return toast.error('Please enter your name.');
    if (!validEmail(lead.email)) return toast.error('Please enter a valid email address.');
    if (!validPhone(lead.phone)) return toast.error('Please enter a valid phone number.');
    setSaving(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: lead.name.trim(),
          email: lead.email.trim(),
          phone: lead.phone.trim(),
          company: lead.company.trim(),
          message: lead.machineInterest.trim() ? `Machine interest: ${lead.machineInterest}\n\n${lead.message.trim() || `I need details and pricing for ${lead.machineInterest}.`}` : lead.message.trim(),
          source: 'chatbot',
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) return toast.error(typeof data?.error === 'string' ? data.error : 'Failed to submit enquiry.');
      setContact({ name: lead.name.trim(), email: lead.email.trim(), phone: lead.phone.trim(), company: lead.company.trim() });
      setLead((prev) => ({ ...prev, name: '', email: '', phone: '', company: '', message: '' }));
      setPanel('none');
      toast.success('Enquiry sent to the sales team.');
      setMessages((prev) => [...prev, { id: createId(), role: 'assistant', source: 'system', text: 'Thanks. Your enquiry has been shared with the sales team. If you want, I can also schedule a meeting here in chat.', quickReplies: ['Schedule a meeting', 'Show sealing machines'], allowMeetingCapture: true, machineInterest: lead.machineInterest }]);
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const submitMeeting = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!meeting.name.trim()) return toast.error('Please enter your name.');
    if (!validEmail(meeting.email)) return toast.error('Please enter a valid email address.');
    if (!validPhone(meeting.phone)) return toast.error('Please enter a valid phone number.');
    if (!meeting.date || !meeting.time) return toast.error('Please choose a date and time.');
    setSaving(true);
    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: meeting.name.trim(),
          email: meeting.email.trim(),
          phone: meeting.phone.trim(),
          company: meeting.company.trim(),
          date: meeting.date,
          time: meeting.time,
          message: meeting.machineInterest.trim() ? `Machine interest: ${meeting.machineInterest}\n\n${meeting.message.trim() || `I want to discuss ${meeting.machineInterest} in the meeting.`}` : meeting.message.trim(),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) return toast.error(typeof data?.error === 'string' ? data.error : 'Failed to schedule meeting.');
      const href = typeof data?.meetingLink === 'string' ? data.meetingLink.trim() : '';
      setContact({ name: meeting.name.trim(), email: meeting.email.trim(), phone: meeting.phone.trim(), company: meeting.company.trim() });
      setMeeting((prev) => ({ ...prev, date: '', time: '', message: '' }));
      setPanel('none');
      toast.success('Meeting scheduled successfully.');
      setMessages((prev) => [...prev, { id: createId(), role: 'assistant', source: 'system', text: `Your meeting request is booked for ${meeting.date} at ${meeting.time}. The team will also email the meeting details.`, quickReplies: ['I need a quote', 'Show shrink wrapping machines'], machineInterest: meeting.machineInterest, link: href ? { label: 'Open meeting link', href } : undefined }]);
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button className={`${styles.toggle} ${open ? styles.toggleHidden : ''}`} onClick={() => setOpen(true)} aria-label="Open chat">
        <span className={styles.toggleIcon}>
          <MessageCircle size={26} />
          <span className={styles.toggleBadge}><Sparkles size={10} /></span>
        </span>
        <span className={styles.toggleLabel}>Open Spectra Pack AI Sales Chat</span>
      </button>
      {open ? (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderTop}>
              <div className={styles.chatHeaderLeft}>
                <div className={styles.chatAvatar}><Sparkles size={18} /></div>
                <div>
                  <h4 className={styles.chatTitle}>Spectra Pack AI Assistant</h4>
                  <div className={styles.chatStatus}>Live catalog and lead capture</div>
                </div>
              </div>
              <button className={styles.chatClose} onClick={() => setOpen(false)} aria-label="Close chat"><X size={18} /></button>
            </div>
            <div className={styles.chatHeaderMeta}>
              <span className={styles.metaPill}><Package2 size={13} /> Machine finder</span>
              <span className={styles.metaPill}><CalendarDays size={13} /> Meeting scheduler</span>
            </div>
          </div>
          <div className={styles.chatMessages}>
            {messages.map((message) => (
              <div key={message.id} className={`${styles.messageRow} ${message.role === 'user' ? styles.messageRowUser : styles.messageRowAssistant}`}>
                <div className={styles.messageAvatar}>{message.role === 'assistant' ? <Bot size={15} /> : <User size={15} />}</div>
                <div className={`${styles.messageBubble} ${message.role === 'user' ? styles.messageBubbleUser : styles.messageBubbleAssistant}`}>
                  {message.text.split('\n').map((line, index) => <p key={`${message.id}-${index}`}>{line}</p>)}
                  {message.products?.length ? (
                    <div className={styles.productGrid}>
                      {message.products.map((product) => (
                        <article key={product.slug} className={styles.productCard}>
                          <div className={styles.productThumb}>
                            <Image src={product.image} alt={product.imageAlt} fill sizes="120px" className={styles.productImage} />
                          </div>
                          <div className={styles.productBody}>
                            <span className={styles.productCategory}>{product.category}</span>
                            <h5 className={styles.productTitle}>{product.title}</h5>
                            <p className={styles.productDesc}>{product.shortDesc}</p>
                            <div className={styles.productActions}>
                              <Link href={`/products/${product.slug}`} className={styles.productLink}>View Details <ChevronRight size={13} /></Link>
                              <button type="button" className={styles.productQuote} onClick={() => openLead(product.title)}>Get Quote</button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : null}
                  {message.link ? (
                    <a href={message.link.href} target="_blank" rel="noopener noreferrer" className={styles.inlineLink}>{message.link.label}</a>
                  ) : null}
                  {message.role === 'assistant' ? (
                    <div className={styles.replyActions}>
                      {message.allowLeadCapture ? <button type="button" className={styles.primaryAction} onClick={() => openLead(message.machineInterest)}>Share enquiry</button> : null}
                      {message.allowMeetingCapture ? <button type="button" className={styles.secondaryAction} onClick={() => openMeeting(message.machineInterest)}>Schedule meeting</button> : null}
                      {message.quickReplies?.length ? <div className={styles.quickReplyRow}>{message.quickReplies.map((reply) => <button key={reply} type="button" className={styles.quickReply} onClick={() => void sendMessage(reply)} disabled={sending}>{reply}</button>)}</div> : null}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
            {sending ? (
              <div className={`${styles.messageRow} ${styles.messageRowAssistant}`}>
                <div className={styles.messageAvatar}><Bot size={15} /></div>
                <div className={`${styles.messageBubble} ${styles.messageBubbleAssistant} ${styles.typingBubble}`}>
                  <Loader2 size={16} className={styles.spin} /> Thinking
                </div>
              </div>
            ) : null}
            <div ref={endRef} />
          </div>
          {panel !== 'none' ? (
            <div className={styles.panelArea}>
              <div className={styles.panelHeader}>
                <div>
                  <h5>{panel === 'lead' ? 'Send enquiry in chat' : 'Schedule meeting in chat'}</h5>
                  <p>{panel === 'lead' ? 'Share your details and requirement.' : 'Choose date, time, and discussion context.'}</p>
                </div>
                <button type="button" className={styles.panelClose} onClick={() => setPanel('none')} aria-label="Close panel"><X size={16} /></button>
              </div>
              {panel === 'lead' ? (
                <form className={styles.panelForm} onSubmit={submitLead}>
                  {lead.machineInterest ? <div className={styles.machineBadge}><Package2 size={13} /> {lead.machineInterest}</div> : null}
                  <div className={styles.formGrid}>
                    <label className={styles.field}><span><User size={13} /> Name</span><input className="form-input" value={lead.name} onChange={(event) => setLead((prev) => ({ ...prev, name: event.target.value }))} placeholder="Your full name" /></label>
                    <label className={styles.field}><span><Mail size={13} /> Email</span><input type="email" className="form-input" value={lead.email} onChange={(event) => setLead((prev) => ({ ...prev, email: event.target.value }))} placeholder="you@company.com" /></label>
                  </div>
                  <div className={styles.formGrid}>
                    <label className={styles.field}><span><Phone size={13} /> Phone</span><input type="tel" className="form-input" value={lead.phone} onChange={(event) => setLead((prev) => ({ ...prev, phone: event.target.value }))} placeholder="+91 9876543210" /></label>
                    <label className={styles.field}><span><Building2 size={13} /> Company</span><input className="form-input" value={lead.company} onChange={(event) => setLead((prev) => ({ ...prev, company: event.target.value }))} placeholder="Company name" /></label>
                  </div>
                  <label className={styles.field}><span>Requirement</span><textarea className="form-input form-textarea" value={lead.message} onChange={(event) => setLead((prev) => ({ ...prev, message: event.target.value }))} placeholder="Pack type, output, machine preference" /></label>
                  <div className={styles.panelActions}>
                    <button type="submit" className={styles.submitButton} disabled={saving}>{saving ? <><Loader2 size={15} className={styles.spin} /> Sending</> : 'Send enquiry'}</button>
                    <button type="button" className={styles.linkLikeButton} onClick={() => openMeeting(lead.machineInterest)}>Schedule meeting instead</button>
                  </div>
                </form>
              ) : (
                <form className={styles.panelForm} onSubmit={submitMeeting}>
                  {meeting.machineInterest ? <div className={styles.machineBadge}><Package2 size={13} /> {meeting.machineInterest}</div> : null}
                  <div className={styles.formGrid}>
                    <label className={styles.field}><span><User size={13} /> Name</span><input className="form-input" value={meeting.name} onChange={(event) => setMeeting((prev) => ({ ...prev, name: event.target.value }))} placeholder="Your full name" /></label>
                    <label className={styles.field}><span><Mail size={13} /> Email</span><input type="email" className="form-input" value={meeting.email} onChange={(event) => setMeeting((prev) => ({ ...prev, email: event.target.value }))} placeholder="you@company.com" /></label>
                  </div>
                  <div className={styles.formGrid}>
                    <label className={styles.field}><span><Phone size={13} /> Phone</span><input type="tel" className="form-input" value={meeting.phone} onChange={(event) => setMeeting((prev) => ({ ...prev, phone: event.target.value }))} placeholder="+91 9876543210" /></label>
                    <label className={styles.field}><span><Building2 size={13} /> Company</span><input className="form-input" value={meeting.company} onChange={(event) => setMeeting((prev) => ({ ...prev, company: event.target.value }))} placeholder="Company name" /></label>
                  </div>
                  <div className={styles.formGrid}>
                    <label className={styles.field}><span><CalendarDays size={13} /> Date</span><input type="date" min={today} className="form-input" value={meeting.date} onChange={(event) => setMeeting((prev) => ({ ...prev, date: event.target.value }))} /></label>
                    <label className={styles.field}><span>Discussion</span><input className="form-input" value={meeting.message} onChange={(event) => setMeeting((prev) => ({ ...prev, message: event.target.value }))} placeholder="Demo, quote, factory visit" /></label>
                  </div>
                  <div className={styles.slotGrid}>{SLOTS.map((slot) => <button key={slot} type="button" className={`${styles.slotButton} ${meeting.time === slot ? styles.slotButtonActive : ''}`} onClick={() => setMeeting((prev) => ({ ...prev, time: slot }))}>{slot}</button>)}</div>
                  <div className={styles.panelActions}>
                    <button type="submit" className={styles.submitButton} disabled={saving}>{saving ? <><Loader2 size={15} className={styles.spin} /> Booking</> : 'Confirm meeting'}</button>
                  </div>
                </form>
              )}
            </div>
          ) : null}
          <div className={styles.chatComposer}>
            <div className={styles.composerWrap}>
              <textarea rows={1} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} placeholder="Ask for a machine, quote, or meeting..." className={styles.chatInput} />
              <button className={styles.chatSend} onClick={() => void sendMessage()} disabled={!input.trim() || sending} aria-label="Send message">{sending ? <Loader2 size={17} className={styles.spin} /> : <Send size={17} />}</button>
            </div>
            <p className={styles.composerMeta}>Gemini-powered when configured, with catalog fallback if the AI API is unavailable.</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
