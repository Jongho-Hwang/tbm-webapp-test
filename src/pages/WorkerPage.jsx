/* File: src/pages/WorkerPage.jsx – 근로자 전용 */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  doc, getDoc, collection, query, where, getDocs,
} from 'firebase/firestore/lite';
import { db } from '../services/firebase';

export default function WorkerPage() {
  const { partnerId } = useParams();

  const [siteManager,setSiteManager] = useState(null);
  const [partnerUser,setPartnerUser] = useState(null);
  const [notices,setNotices]         = useState([]);
  const [educations,setEducations]   = useState([]);

  /* ── Firestore 읽기 ── */
  useEffect(()=>{(async()=>{
    try{
      const snapPartner = await getDoc(doc(db,'users',partnerId));
      if(!snapPartner.exists()) return;
      const partnerData=snapPartner.data(); setPartnerUser(partnerData);

      const qSite=query(collection(db,'users'),
        where('role','==','site'),where('siteId','==',partnerData.siteId));
      const siteSnap=await getDocs(qSite);
      if(siteSnap.docs.length) setSiteManager(siteSnap.docs[0].data());

      const allSnap=await getDocs(collection(db,'notices'));
      const list=allSnap.docs.map(d=>d.data()).filter(n=>{
        if(n.level==='head') return true;
        if(n.level==='site') return n.siteId===partnerData.siteId;
        if(n.level==='partner') return n.partnerId===partnerId;
        return false;
      });

      const ntcs=[],edus=[];
      list.forEach(n=>(n.category==='edu'?edus:ntcs).push(n));

      const order={head:0,site:1,partner:2};
      ntcs.sort((a,b)=>order[a.level]-order[b.level]);
      edus.sort((a,b)=>b.createdAt-a.createdAt);

      setNotices(ntcs);
      setEducations(edus.slice(0,3));
    }catch(err){console.error('[WorkerPage] error',err);}
  })();},[partnerId]);

  /* ── 스타일 ── */
  const boardBox={border:'2px solid #D1D1D6',borderRadius:16,padding:12};
  const buttonStyle={
    width:'100%',padding:12,borderRadius:8,background:'#002F3D',
    color:'#FFF',fontWeight:500,border:'none',cursor:'pointer',
  };

  if(!partnerUser) return <p style={{padding:24}}>로딩 중...</p>;

  const siteName=(siteManager?.uid||partnerUser.siteId||'현장')+' 현장';

  return(
    <div style={{padding:24,background:'#F5F5F7',minHeight:'100vh'}}>
      <h1 style={{fontSize:22,fontWeight:600,marginBottom:8}}>{siteName}</h1>
      <h2 style={{fontSize:18,fontWeight:500,marginBottom:24}}>
        {partnerUser.uid} TBM 페이지
      </h2>

      {/* 공지사항 */}
      <section style={{marginBottom:32}}>
        <h3 style={{fontSize:18,fontWeight:500,marginBottom:12}}>공지사항</h3>
        <div style={boardBox}>
          {notices.length?(
            <ul style={{listStyle:'none',padding:0,margin:0}}>
              {notices.map(n=>(
                <li key={n.id} style={{marginBottom:4}}>
                  <span style={{fontWeight:500,color:'#002F3D'}}>
                    {n.level==='head'?'[본사]':n.level==='site'?'[현장]':'[협력사]'}{' '}
                    {n.url?(
                      <a href={n.url} target="_blank" rel="noopener noreferrer"
                         style={{color:'#007AFF',textDecoration:'underline'}}>{n.title}</a>
                    ):n.title}
                  </span>
                </li>
              ))}
            </ul>
          ):<p style={{color:'#3C3C4399',margin:0}}>등록된 공지가 없습니다.</p>}
        </div>
      </section>

      {/* 위험성 평가 교육 */}
      <section style={{marginBottom:32}}>
        <h3 style={{fontSize:18,fontWeight:500,marginBottom:12}}>위험성 평가 교육</h3>
        <div style={boardBox}>
          {educations.length?(
            <ul style={{listStyle:'none',padding:0,margin:0}}>
              {educations.map(e=>(
                <li key={e.id} style={{marginBottom:4}}>
                  {e.url?(
                    <a href={e.url} target="_blank" rel="noopener noreferrer"
                       style={{color:'#007AFF',textDecoration:'underline'}}>{e.title}</a>
                  ):e.title}
                </li>
              ))}
            </ul>
          ):<p style={{color:'#3C3C4399',margin:0}}>등록된 교육이 없습니다.</p>}
        </div>
      </section>

      {/* TBM 확인(추후) */}
      <button style={{...buttonStyle,marginBottom:32}}>TBM 내용 확인완료</button>

      {/* 로고 */}
      <div style={{textAlign:'center'}}>
        <img src="/logo.png" alt="Company Logo" style={{width:120,opacity:0.8}} />
      </div>
    </div>
  );
}
