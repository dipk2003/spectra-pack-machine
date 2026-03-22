'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import styles from './ChatWidget.module.css';
import { PRODUCTS, COMPANY_INFO, FAQS } from '@/lib/data';
import type { ProductData } from '@/lib/data';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

const HAS_PUBLIC_SUPABASE_CONFIG = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
);

const GREETING = `Hi! I'm the Spectra Pack assistant.\n\nYou can ask me about:\n• Packaging machines from the catalog\n• Services and support\n• Pricing and quotations\n• Scheduling a meeting or factory discussion`;

function getResponse(input: string, products: ProductData[]): string {
  const lower = input.toLowerCase();

  // Product matching
  for (const p of products) {
    const keywords = [p.slug.replace(/-/g, ' '), p.title.toLowerCase(), p.category.toLowerCase()];
    if (keywords.some(k => lower.includes(k) || lower.includes(k.split(' ')[0]))) {
      return `**${p.title}**\n\n${p.shortDesc}\n\n✅ Key Features:\n${p.features.slice(0, 4).map(f => `• ${f}`).join('\n')}\n\n👉 [View Details](/products/${p.slug})\n\nWould you like a quotation or to schedule a demo?`;
    }
  }

  // Category matching
  if (lower.includes('seal')) return `We offer multiple sealing machine formats:\n\n• Band Sealer Machines\n• Foot Sealer Machine\n• Pneumatic Sealing Machine\n• Tube Sealing Machine\n• L-Sealer with Shrink Tunnel\n\nTell me your pack type and I can point you to the right machine family.`;
  if (lower.includes('shrink')) return `Our shrink wrapping range includes:\n\n• Automatic Web Sealer with Shrink Tunnel\n• Semi-Automatic Web Sealer with Shrink Tunnel\n• Chamber Shrink Tunnel Machine\n• Portable Shrink Tunnel\n• Sleeve Shrink Wrapping Machine\n\nWhat product do you need to shrink wrap?`;
  if (lower.includes('fill') || lower.includes('liquid')) return `The current website catalog highlights wrapping, sealing, vacuum packaging, conveyors, and pallet handling solutions.\n\nIf your requirement involves filling along with packaging, call us at ${COMPANY_INFO.phone[0]} and the team can review your line requirement directly.`;
  if (lower.includes('conveyor')) return `We build conveyor systems for packaging lines:\n\n• Belt conveyors\n• Roller conveyors\n• Flexible roller conveyors\n• PVC and modular belt conveyors\n• Slate chain conveyors\n\n👉 [View Conveyor Systems](/products/conveyor-systems)`;

  // FAQ matching
  for (const faq of FAQS) {
    const faqWords = faq.q.toLowerCase().split(' ').filter(w => w.length > 3);
    const matchCount = faqWords.filter(w => lower.includes(w)).length;
    if (matchCount >= 2) return faq.a;
  }

  // General topics
  if (lower.includes('price') || lower.includes('cost') || lower.includes('quot') || lower.includes('rate')) {
    return `Pricing depends on the machine model, output requirement, and configuration.\n\n1. **Call us**: ${COMPANY_INFO.phone[0]}\n2. **Email**: ${COMPANY_INFO.email[1]}\n3. **Schedule a meeting**: [Book Now](/schedule-meeting)\n\nYou can also review the catalog and share the machine title you are interested in.`;
  }
  if (lower.includes('contact') || lower.includes('call') || lower.includes('phone') || lower.includes('reach')) {
    return `📞 **Phone**: ${COMPANY_INFO.phone[0]}\n📧 **Email**: ${COMPANY_INFO.email[0]}\n📍 **Office**: ${COMPANY_INFO.headOffice}\n\nOr [fill out our contact form](/contact) and we'll get back to you!`;
  }
  if (lower.includes('meeting') || lower.includes('visit') || lower.includes('demo') || lower.includes('appointment') || lower.includes('schedule')) {
    return `Great! You can schedule a meeting with our team:\n\n👉 [Schedule Meeting](/schedule-meeting)\n\nOr call us directly at ${COMPANY_INFO.phone[0]}`;
  }
  if (lower.includes('service') || lower.includes('support') || lower.includes('maintenance') || lower.includes('repair') || lower.includes('amc')) {
    return `We provide support across:\n\n🔧 Machine manufacturing\n✏️ Machine selection and custom design\n🛠️ Installation and commissioning\n📞 After-sales support and spares\n\n👉 [View All Services](/services)`;
  }
  if (lower.includes('about') || lower.includes('company') || lower.includes('who')) {
    return `Spectra Pack Machines is a **Made in India** packaging machine manufacturer based in the Mumbai region, with office operations in Vasai West and a manufacturing facility in Chinchoti.\n\nWith more than two decades of experience, the company serves FMCG, pharma, food, logistics, retail, and manufacturing lines with wrapping, sealing, vacuum packaging, conveyor, and pallet handling solutions.\n\n👉 [Learn More About Us](/about)`;
  }
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('good')) {
    return `Hello! Welcome to Spectra Pack Machines.\n\nI can help with:\n• Product information\n• Catalog guidance\n• Quotations\n• Scheduling a meeting`;
  }
  if (lower.includes('thank')) {
    return `You're welcome. If you want, I can also help you find the right machine family from the Spectra Pack catalog.\n\nFor immediate assistance, call us at ${COMPANY_INFO.phone[0]}.`;
  }

  return `I'd love to help! Could you tell me more about what you're looking for?\n\nI can assist with:\n• Specific machine information\n• Pricing & quotations\n• Scheduling a meeting or demo\n• Service & support\n\nOr call us at ${COMPANY_INFO.phone[0]} for immediate help!`;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<ProductData[]>(
    HAS_PUBLIC_SUPABASE_CONFIG ? [] : PRODUCTS,
  );
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: GREETING }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data);
        }
      } catch {
        // Static catalog fallback is fine here.
      }
    };

    void loadProducts();
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);

    // Simulate typing delay
    setTimeout(() => {
      const response = getResponse(userMsg, products);
      setMessages(prev => [...prev, { role: 'bot', text: response }]);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat toggle button */}
      <button
        className={`${styles.toggle} ${open ? styles.toggleHidden : ''}`}
        onClick={() => setOpen(true)}
        aria-label="Open chat"
        id="chat-toggle"
      >
        <MessageCircle size={24} />
        <span className={styles.toggleLabel}>Chat with us</span>
      </button>

      {/* Chat window */}
      {open && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderLeft}>
              <div className={styles.chatAvatar}>
                <Bot size={20} />
              </div>
              <div>
                <h4 className={styles.chatTitle}>Spectra Pack Assistant</h4>
                <span className={styles.chatStatus}>● Online</span>
              </div>
            </div>
            <button className={styles.chatClose} onClick={() => setOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className={styles.chatMessages}>
            {messages.map((msg, i) => (
              <div key={i} className={`${styles.message} ${msg.role === 'user' ? styles.messageUser : styles.messageBot}`}>
                <div className={styles.messageAvatar}>
                  {msg.role === 'bot' ? <Bot size={14} /> : <User size={14} />}
                </div>
                <div className={styles.messageBubble}>
                  {msg.text.split('\n').map((line, j) => (
                    <span key={j}>
                      {line.replace(/\*\*(.*?)\*\*/g, '«$1»').split('«').map((part, k) => {
                        if (part.includes('»')) {
                          const [bold, rest] = part.split('»');
                          return <span key={k}><strong>{bold}</strong>{rest}</span>;
                        }
                        return part;
                      })}
                      {j < msg.text.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.chatInputArea}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className={styles.chatInput}
              id="chat-input"
            />
            <button className={styles.chatSend} onClick={sendMessage} disabled={!input.trim()}>
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
