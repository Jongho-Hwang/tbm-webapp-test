// File: src/components/NoticeForm.jsx
import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { currentUser } from '../services/localAuth';
import { saveNotice } from '../services/db';

export default function NoticeForm({ onSaved }) {
  const me = currentUser();
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [desc, setDesc] = useState('');

  const commonInput = "w-full bg-transparent border-b border-subtext placeholder-subtext py-2 focus:outline-none focus:border-primary transition";

  const handleSave = async () => {
    if (!name.trim() || !link.trim()) return;
    const level = me.role === 'head' ? 'head' : me.role === 'site' ? 'site' : 'partner';
    await saveNotice({
      id: uuid(),
      level,
      siteId: me.role !== 'head' ? me.uid : null,
      partnerId: me.role === 'partner' ? me.partnerId : null,
      author: me.name,
      title: name.trim(),
      url: link.trim(),
      body: desc.trim(),
      createdAt: Date.now(),
    });
    setName('');
    setLink('');
    setDesc('');
    onSaved();
  };

  return (
    <div className="space-y-4">
      <input
        className={commonInput}
        placeholder="공지 이름(표시될 텍스트)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className={commonInput}
        placeholder="링크(URL)"
        value={link}
        onChange={(e) => setLink(e.target.value)}
      />
      <textarea
        rows={3}
        className="w-full bg-transparent border-b border-subtext placeholder-subtext py-2 focus:outline-none focus:border-primary transition resize-none"
        placeholder="(선택) 설명"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />
      <button
        onClick={handleSave}
        className="bg-primary text-white py-3 px-6 rounded-xl shadow-soft font-semibold hover:bg-primary/90 transition focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        저장
      </button>
    </div>
  );
}