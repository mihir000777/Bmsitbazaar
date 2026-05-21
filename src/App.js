import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from './firebase';
import {
  collection, addDoc, doc, getDoc, updateDoc,
  getDocs, Timestamp, arrayUnion, increment
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup,
  sendEmailVerification
} from 'firebase/auth';

const ADMIN_EMAIL      = 'admin@bmsitbazaar.com';
const ALLOWED_DOMAIN   = 'bmsit.in';
const UPI_ID           = '9900115056@kotakbank';
const UPI_NAME         = 'BMSIT Bazaar';
const UNLOCK_FEE       = 10;
const CLOUDINARY_CLOUD = 'dd8mkgqng';
const CLOUDINARY_PRESET= 'bmsitbazzar';

const injectCSS = () => {
  if (document.getElementById('bz-css')) return;
  const el = document.createElement('style');
  el.id = 'bz-css';
  el.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html,body,#root{background:#09090b;color:#fafafa;font-family:'DM Sans',sans-serif;min-height:100vh;width:100%;max-width:100%;overflow-x:hidden}
    input,textarea,select,button{font-family:'DM Sans',sans-serif}
    input::placeholder,textarea::placeholder{color:#3f3f46}
    input:focus,textarea:focus,select:focus{outline:none;border-color:#facc15!important;box-shadow:0 0 0 3px rgba(250,204,21,0.08)!important}
    ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#27272a;border-radius:2px}
    @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    .fadeUp{animation:fadeUp .3s ease both}
    .blink{animation:blink 1.8s ease infinite}
    .spin{animation:spin .8s linear infinite}
    button:disabled{opacity:.5;cursor:not-allowed!important}
    .hov{transition:opacity .15s,transform .15s}
    .hov:hover{opacity:.88;transform:translateY(-1px)}
    .card-hov{transition:border-color .2s,transform .15s,box-shadow .2s}
    .card-hov:hover{border-color:#52525b!important;transform:translateY(-3px);box-shadow:0 12px 40px rgba(0,0,0,.5)}
    .upload-zone{border:2px dashed #3f3f46;border-radius:12px;padding:32px;text-align:center;cursor:pointer;transition:all .2s}
    .upload-zone:hover,.upload-zone.drag{border-color:#facc15;background:rgba(250,204,21,.04)}
    .img-thumb{position:relative;border-radius:10px;overflow:hidden;aspect-ratio:1;background:#18181b;border:1px solid #27272a}
    .img-thumb img{width:100%;height:100%;object-fit:cover;display:block}
    .img-remove{position:absolute;top:5px;right:5px;background:rgba(0,0,0,.8);border:none;color:#ef4444;border-radius:50%;width:22px;height:22px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;line-height:1}
    @media(max-width:1100px){.g5r{grid-template-columns:repeat(3,1fr)!important}}
    @media(max-width:900px){.g2r{grid-template-columns:1fr!important}.g3r{grid-template-columns:1fr 1fr!important}.g4r{grid-template-columns:1fr 1fr!important}.g5r{grid-template-columns:1fr 1fr!important}.sm-hide{display:none!important}}
    @media(max-width:600px){.g3r{grid-template-columns:1fr!important}.g4r{grid-template-columns:1fr 1fr!important}.g5r{grid-template-columns:1fr!important}}
  `;
  document.head.appendChild(el);
};

const T = {
  bg:'#09090b', s:'#111113', s2:'#18181b', b:'#27272a', b2:'#3f3f46',
  y:'#facc15', yBg:'#1c1800', yBr:'#713f12',
  g:'#22c55e', gBg:'#052e16', gBr:'#166534',
  r:'#ef4444', rBg:'#1c0808', rBr:'#7f1d1d',
  o:'#f97316', oBg:'#1c0e00', oBr:'#7c2d12',
  bl:'#60a5fa', blBg:'#0c1a2e', blBr:'#1e3a5f',
  t:'#fafafa', t2:'#e4e4e4', t3:'#aaaaaa',
};

const CATS = [
  {v:'food',    l:'🍱 Food & drinks'},
  {v:'merch',   l:'👕 Merch & fashion'},
  {v:'notes',   l:'📚 Notes & study'},
  {v:'digital', l:'💻 Digital products'},
  {v:'services',l:'🛠️ Services'},
  {v:'art',     l:'🎨 Art & crafts'},
  {v:'other',   l:'📦 Other'},
];
const ICON = {food:'🍱',merch:'👕',notes:'📚',digital:'💻',services:'🛠️',art:'🎨',other:'📦'};

const Logo = ({size=22,onClick}) => (
  <span onClick={onClick} style={{fontFamily:"'Syne',sans-serif",fontSize:size,fontWeight:800,letterSpacing:'-0.5px',color:T.t,userSelect:'none',cursor:'pointer'}}>
    BMSIT<span style={{color:T.y}}>Bazaar</span>
  </span>
);

const Pill = ({children,type='default',sm}) => {
  const m={live:{bg:T.gBg,br:T.gBr,c:T.g},frozen:{bg:T.rBg,br:T.rBr,c:T.r},warn:{bg:T.oBg,br:T.oBr,c:T.o},yellow:{bg:T.yBg,br:T.yBr,c:T.y},blue:{bg:T.blBg,br:T.blBr,c:T.bl},default:{bg:T.s2,br:T.b2,c:T.t2}}[type]||{bg:T.s2,br:T.b2,c:T.t2};
  return <span style={{display:'inline-flex',alignItems:'center',gap:4,background:m.bg,border:`1px solid ${m.br}`,borderRadius:20,padding:sm?'2px 9px':'4px 12px',fontSize:sm?10:11,color:m.c,fontWeight:600,whiteSpace:'nowrap'}}>{children}</span>;
};

const StatBox = ({n,label,color}) => (
  <div style={{background:T.s2,border:`1px solid ${T.b2}`,borderRadius:14,padding:'16px 12px',textAlign:'center',flex:1,minWidth:80}}>
    <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,color:color||T.y,letterSpacing:'-1px',lineHeight:1}}>{n}</div>
    <div style={{fontSize:10,color:T.t3,marginTop:5,textTransform:'uppercase',letterSpacing:'0.07em'}}>{label}</div>
  </div>
);

const Inp = ({placeholder,value,onChange,type='text',min,autoFocus,disabled}) => (
  <input autoFocus={autoFocus} type={type} placeholder={placeholder} value={value} onChange={onChange} min={min} disabled={disabled}
    style={{width:'100%',background:'#0c0c0f',border:`1px solid ${T.b}`,borderRadius:10,padding:'13px 16px',fontSize:14,color:T.t,display:'block',marginBottom:12,transition:'border-color .15s'}}/>
);

const Tex = ({placeholder,value,onChange,rows=4}) => (
  <textarea placeholder={placeholder} value={value} onChange={onChange} rows={rows}
    style={{width:'100%',background:'#0c0c0f',border:`1px solid ${T.b}`,borderRadius:10,padding:'13px 16px',fontSize:14,color:T.t,display:'block',marginBottom:12,resize:'vertical'}}/>
);

const Sel = ({value,onChange,options}) => (
  <select value={value} onChange={onChange}
    style={{width:'100%',background:'#0c0c0f',border:`1px solid ${T.b}`,borderRadius:10,padding:'13px 16px',fontSize:14,color:T.t,display:'block',marginBottom:12}}>
    {options.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
  </select>
);

const Btn = ({children,onClick,disabled,v='yellow',block=true}) => {
  const s={yellow:{bg:T.y,c:'#000',br:'none'},dark:{bg:T.s2,c:T.t2,br:`1px solid ${T.b2}`},green:{bg:T.gBg,c:T.g,br:`1px solid ${T.gBr}`},red:{bg:T.rBg,c:T.r,br:`1px solid ${T.rBr}`},blue:{bg:T.blBg,c:T.bl,br:`1px solid ${T.blBr}`},white:{bg:'#fff',c:'#09090b',br:'none'}}[v]||{bg:T.y,c:'#000',br:'none'};
  return (
    <button onClick={onClick} disabled={disabled} className="hov"
      style={{width:block?'100%':'auto',background:s.bg,color:s.c,border:s.br,borderRadius:10,padding:'13px 20px',fontSize:14,fontWeight:700,cursor:'pointer',marginBottom:10,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
      {children}
    </button>
  );
};

const Div  = ({my=16})=><div style={{height:1,background:T.b,margin:`${my}px 0`}}/>;
const Lbl  = ({children})=><div style={{fontSize:11,color:T.t3,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8}}>{children}</div>;
const EBox = ({msg})=>msg?<div style={{background:T.rBg,border:`1px solid ${T.rBr}`,borderRadius:10,padding:'10px 16px',marginBottom:14,color:T.r,fontSize:13}}>{msg}</div>:null;
const Card = ({children,style={}})=><div style={{background:T.s,border:`1px solid ${T.b2}`,borderRadius:18,padding:28,...style}}>{children}</div>;
const Spin = ()=><div className="spin" style={{width:16,height:16,border:`2px solid ${T.b2}`,borderTopColor:T.y,borderRadius:'50%',flexShrink:0}}/>;

const ImageUploader = ({images,setImages}) => {
  const fileRef = useRef();
  const [uploading,setUploading] = useState(false);
  const uploadFiles = async files => {
    const arr = [...files].filter(f=>f.type.startsWith('image/')).slice(0,6-images.length);
    if(!arr.length) return;
    setUploading(true);
    const urls = [];
    for(const file of arr){
      try{
        const fd = new FormData();
        fd.append('file',file);
        fd.append('upload_preset',CLOUDINARY_PRESET);
        fd.append('folder','bmsitbazaar');
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,{method:'POST',body:fd});
        const data = await res.json();
        if(data.secure_url) urls.push(data.secure_url);
      }catch(e){console.error(e);}
    }
    setImages(prev=>[...prev,...urls]);
    setUploading(false);
  };
  const onDrop = e=>{e.preventDefault();e.currentTarget.classList.remove('drag');uploadFiles(e.dataTransfer.files);};
  const onDragOver = e=>{e.preventDefault();e.currentTarget.classList.add('drag');};
  const onDragLeave = e=>e.currentTarget.classList.remove('drag');
  return(
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:12}}>
        {images.map((url,i)=>(
          <div key={i} className="img-thumb">
            <img src={url} alt={`p${i}`}/>
            <button className="img-remove" onClick={()=>setImages(p=>p.filter((_,j)=>j!==i))}>×</button>
            {i===0&&<div style={{position:'absolute',bottom:6,left:6,background:'rgba(0,0,0,.8)',borderRadius:6,padding:'2px 8px',fontSize:9,color:T.y,fontWeight:700}}>MAIN</div>}
          </div>
        ))}
        {images.length<6&&(
          <div className="upload-zone" onClick={()=>fileRef.current?.click()} onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
            style={{aspectRatio:'1',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8}}>
            {uploading?<><Spin/><div style={{fontSize:12,color:T.t3}}>Uploading...</div></>:<><div style={{fontSize:28}}>📷</div><div style={{fontSize:12,color:T.t3}}>Add photo</div></>}
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" multiple accept="image/*" style={{display:'none'}} onChange={e=>uploadFiles(e.target.files)}/>
      <div style={{fontSize:12,color:images.length<3?T.o:T.g}}>
        {images.length<3?`⚠️ Need ${3-images.length} more photo${3-images.length!==1?'s':''} (min 3 required)`:`✓ ${images.length} photo${images.length!==1?'s':''} ready`}
      </div>
    </div>
  );
};

const Nav = ({user,onLogout,onPost,onMyAds,onMarket}) => (
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 32px',background:T.s,borderBottom:`1px solid ${T.b}`,position:'sticky',top:0,zIndex:200,gap:12,flexWrap:'wrap'}}>
    <Logo size={20} onClick={onMarket}/>
    <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
      {user?.photoURL&&<img src={user.photoURL} alt="" style={{width:28,height:28,borderRadius:'50%',border:`1px solid ${T.b2}`}}/>}
      <span style={{fontSize:12,color:T.t3}} className="sm-hide">{user?.email}</span>
      <button className="hov" onClick={onPost} style={{background:T.y,color:'#000',border:'none',borderRadius:8,padding:'8px 20px',cursor:'pointer',fontSize:13,fontWeight:800}}>+ Post ad</button>
      <button className="hov" onClick={onMyAds} style={{background:T.s2,color:T.t2,border:`1px solid ${T.b2}`,borderRadius:8,padding:'8px 16px',cursor:'pointer',fontSize:13}}>My ads</button>
      <button className="hov" onClick={onLogout} style={{background:T.s2,color:T.t3,border:`1px solid ${T.b}`,borderRadius:8,padding:'8px 12px',cursor:'pointer',fontSize:13}}>Logout</button>
    </div>
  </div>
);

export default function App() {
  const [page,     setPage]     = useState('home');
  const [user,     setUser]     = useState(null);
  const [busy,     setBusy]     = useState(false);
  const [ads,      setAds]      = useState([]);
  const [myAds,    setMyAds]    = useState([]);
  const [allAds,   setAllAds]   = useState([]);
  const [selAd,    setSelAd]    = useState(null);
  const [imgIdx,   setImgIdx]   = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const [catF,     setCatF]     = useState('all');
  const [search,   setSearch]   = useState('');
  const [unlocked, setUnlocked] = useState({});
  const [txns,     setTxns]     = useState([]);

  const [email,  setEmail]  = useState('');
  const [pass,   setPass]   = useState('');
  const [mode,   setMode]   = useState('login');
  const [aErr,   setAErr]   = useState('');
  const [aOk,    setAOk]    = useState('');

  const [sf,     setSf]     = useState({name:'',usn:'',phone:'',title:'',desc:'',price:'',cat:'food',deadline:''});
  const upd = (k,v) => setSf(p=>({...p,[k]:v}));
  const [images, setImages] = useState([]);
  const [editId, setEditId] = useState(null);

  const [unlockStep, setUnlockStep] = useState('idle');
  const [txnId,      setTxnId]      = useState('');
  const [txnErr,     setTxnErr]     = useState('');
  const [copied,     setCopied]     = useState('');

  useEffect(()=>{
    injectCSS();
    const unsub = onAuthStateChanged(auth, u=>{
      setUser(u);
      if(u){
        if(u.email===ADMIN_EMAIL){ setPage('admin'); loadAdmin(); }
        else if(!u.emailVerified && u.email!==ADMIN_EMAIL){ setPage('verify'); }
        else{ loadAds(); loadMine(u.uid); setPage('market'); }
      } else setPage('home');
    });
    return()=>unsub();
  },[]);

  const loadAds = async()=>{
    try{
      const snap = await getDocs(collection(db,'ads'));
      setAds(snap.docs.filter(d=>d.data().status==='approved').map(d=>({id:d.id,...d.data()})));
    }catch(e){console.error(e);}
  };

  const loadMine = async uid=>{
    try{
      const snap = await getDocs(collection(db,'ads'));
      setMyAds(snap.docs.filter(d=>d.data().sellerId===uid).map(d=>({id:d.id,...d.data()})));
    }catch(e){console.error(e);}
  };

  const loadAdmin = async()=>{
    setBusy(true);
    try{
      const [aSnap,tSnap] = await Promise.all([getDocs(collection(db,'ads')),getDocs(collection(db,'transactions'))]);
      setAllAds(aSnap.docs.map(d=>({id:d.id,...d.data()})));
      setTxns(tSnap.docs.map(d=>({id:d.id,...d.data()})));
    }catch(e){console.error(e);}
    setBusy(false);
  };

  const isAllowed = em => em===ADMIN_EMAIL || em.toLowerCase().endsWith('@'+ALLOWED_DOMAIN);

  const doAuth = async()=>{
    setAErr(''); setAOk('');
    if(!isAllowed(email)){ setAErr(`Only @${ALLOWED_DOMAIN} college email addresses are allowed.`); return; }
    setBusy(true);
    try{
      if(mode==='signup'){
        const cred = await createUserWithEmailAndPassword(auth,email,pass);
        await sendEmailVerification(cred.user, {
          url: window.location.origin,
          handleCodeInApp: false,
        });
        await signOut(auth);
        setAOk('✓ Account created! Check your BMSIT email inbox and click the verification link before logging in.');
        setMode('login');
        setPage('verify');
      } else {
        const cred = await signInWithEmailAndPassword(auth,email,pass);
        if(!cred.user.emailVerified !== ADMIN_EMAIL){
          await signOut(auth);
          setAErr('Please verify your BMSIT email first. Check your inbox for the verification link.');
        }
      }
    }catch(e){
      const m={'auth/invalid-credential':'Wrong email or password.','auth/email-already-in-use':'Email already registered. Please login.','auth/weak-password':'Password needs 6+ characters.','auth/invalid-email':'Invalid email address.'};
      setAErr(m[e.code]||'Authentication failed. Please try again.');
    }
    setBusy(false);
  };

  const doGoogle = async()=>{
    setAErr(''); setBusy(true);
    try{
      const res = await signInWithPopup(auth,new GoogleAuthProvider());
      if(!isAllowed(res.user.email)){ await signOut(auth); setAErr(`Only @${ALLOWED_DOMAIN} Google accounts allowed. Use your BMSIT college Google account.`); }
    }catch(e){ setAErr('Google sign-in failed. Allow popups and use your BMSIT account.'); }
    setBusy(false);
  };

  const resendVerification = async()=>{
    setBusy(true);
    try{
      const cred = await signInWithEmailAndPassword(auth,email,pass);
      await sendEmailVerification(cred.user);
      await signOut(auth);
      setAOk('Verification email resent! Check your BMSIT inbox.');
    }catch(e){ setAErr('Could not resend. Please login again.'); }
    setBusy(false);
  };

  const doLogout = async()=>{
    await signOut(auth);
    setUser(null); setAds([]); setMyAds([]); setAllAds([]); setTxns([]); setPage('home');
  };

  const doPost = async()=>{
    if(!sf.name||!sf.phone||!sf.title||!sf.price){ alert('Fill name, phone, title and price!'); return; }
    if(images.length<3){ alert('Please upload at least 3 photos!'); return; }
    if(isNaN(+sf.price)||+sf.price<=0){ alert('Enter a valid price!'); return; }
    setBusy(true);
    try{
      const data={
        sellerId:user.uid, sellerEmail:user.email,
        sellerName:sf.name, sellerPhone:sf.phone, sellerUSN:sf.usn,
        title:sf.title, description:sf.desc, price:+sf.price,
        category:sf.cat, deadline:sf.deadline, images,
        unlocks:0, views:0, status:'pending',
        flagged:false, flags:[], updatedAt:Timestamp.now(),
      };
      if(editId) await updateDoc(doc(db,'ads',editId),data);
      else{ data.createdAt=Timestamp.now(); await addDoc(collection(db,'ads'),data); }
      await loadMine(user.uid);
      setSf({name:'',usn:'',phone:'',title:'',desc:'',price:'',cat:'food',deadline:''});
      setImages([]); setEditId(null); setPage('posted');
    }catch(e){ alert('Failed to post. Check connection.'); }
    setBusy(false);
  };

  const submitUnlock = async()=>{
    setTxnErr('');
    const adSnap = await getDoc(doc(db,'ads',selAd.id));
    const unlockedBuyers = adSnap.data()?.unlockedBuyers||[];
    if(unlockedBuyers.includes(user.email)){
      setUnlocked(p=>({...p,[selAd.id]:true}));
      setUnlockStep('unlocked');
      return;
    }
    if(!txnId.trim()||txnId.trim().length<8){ setTxnErr('Please enter a valid UPI transaction ID.'); return; }
    setBusy(true);
    try{
      await updateDoc(doc(db,'ads',selAd.id),{unlocks:increment(1)});
      await addDoc(collection(db,'transactions'),{
        buyerEmail:user.email, sellerEmail:selAd.sellerEmail,
        adId:selAd.id, adTitle:selAd.title,
        amount:UNLOCK_FEE, txnId:txnId.trim(),
        status:'pending_verification', createdAt:Timestamp.now(),
      });
      await fetch('https://formsubmit.co/ajax/mihirmm0455@gmail.com',{
        method:'POST',
        headers:{'Content-Type':'application/json','Accept':'application/json'},
        body:JSON.stringify({
          _subject:'New payment pending - BMSIT Bazaar',
          message:`Buyer: ${user.email} | Ad: ${selAd.title} | TXN ID: ${txnId} | Amount: Rs.${UNLOCK_FEE}. Login to admin panel to verify.`,
        })
      });
      setUnlockStep('pending_admin');
      setTxnId('');
    }catch(e){ setTxnErr('Error submitting. Please try again.'); }
    setBusy(false);
  };

  const adminUpdate = async(id,data)=>{ await updateDoc(doc(db,'ads',id),data); loadAdmin(); };

  const verifyTxn = async(t)=>{
    await updateDoc(doc(db,'transactions',t.id),{status:'verified'});
    await updateDoc(doc(db,'ads',t.adId),{unlockedBuyers:arrayUnion(t.buyerEmail)});
    loadAdmin();
    alert('Payment verified! Buyer can now see seller contact.');
  };

  const doFlag = async id=>{
    if(!window.confirm('Flag this ad for admin review?')) return;
    await updateDoc(doc(db,'ads',id),{flagged:true,flags:arrayUnion({by:user.email,at:new Date().toISOString()})});
    alert('Flagged. Admin will review within 2 hours.'); loadAds();
  };

  const copy = t=>{ navigator.clipboard.writeText(t).then(()=>{ setCopied(t); setTimeout(()=>setCopied(''),2000); }); };

  const filtered = ads.filter(p=>{
    if(catF!=='all'&&p.category!==catF) return false;
    if(search&&!p.title?.toLowerCase().includes(search.toLowerCase())&&!p.description?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalRev     = txns.reduce((a,t)=>a+t.amount,0);
  const pendingTxns  = txns.filter(t=>t.status==='pending_verification');
  const uniqueSellers= [...new Set(allAds.map(a=>a.sellerId))].length;
  const pendingAds   = allAds.filter(a=>a.status==='pending');
  const liveAds      = allAds.filter(a=>a.status==='approved');

  /* HOME */
  if(page==='home') return(
    <div style={{minHeight:'100vh',background:T.bg}}>
      <nav style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 48px',borderBottom:`1px solid ${T.b}`,position:'sticky',top:0,background:'rgba(9,9,11,0.97)',backdropFilter:'blur(16px)',zIndex:200}}>
        <Logo size={24}/>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <Pill type="yellow"><span className="blink" style={{display:'inline-block',width:6,height:6,borderRadius:'50%',background:T.y,marginRight:4}}/>Live · BMSIT 2026</Pill>
          <button className="hov" onClick={()=>{setMode('login');setPage('auth');}} style={{background:T.s2,color:T.t2,border:`1px solid ${T.b2}`,borderRadius:8,padding:'9px 22px',cursor:'pointer',fontSize:14}}>Login</button>
          <button className="hov" onClick={()=>{setMode('signup');setPage('auth');}} style={{background:T.y,color:'#000',border:'none',borderRadius:8,padding:'9px 24px',cursor:'pointer',fontSize:14,fontWeight:800}}>Join free →</button>
        </div>
      </nav>
      <div className="fadeUp" style={{padding:'88px 48px 72px',textAlign:'center'}}>
        <div style={{marginBottom:20}}><Pill type="yellow">🎓 @bmsit.in only · Campus marketplace · Bengaluru</Pill></div>
        <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:'clamp(48px,7vw,96px)',fontWeight:800,color:T.t,lineHeight:1.0,letterSpacing:'-4px',marginBottom:24}}>
          Buy and sell within<br/><span style={{color:T.y}}>BMSIT. No outsiders.</span>
        </h1>
        <p style={{fontSize:18,color:T.t2,maxWidth:580,margin:'0 auto 40px',lineHeight:1.8}}>
          The campus marketplace that eliminates fake buyers and spam DMs —<br/>pay ₹{UNLOCK_FEE} to contact a seller. Only @bmsit.in emails.
        </p>
        <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap',marginBottom:14}}>
          <button className="hov" onClick={()=>{setMode('signup');setPage('auth');}} style={{background:T.y,color:'#000',border:'none',borderRadius:14,padding:'16px 52px',fontSize:17,fontWeight:800,cursor:'pointer'}}>Join with BMSIT email →</button>
          <button className="hov" onClick={()=>{setMode('login');setPage('auth');}} style={{background:T.s,color:T.t2,border:`1px solid ${T.b2}`,borderRadius:14,padding:'16px 32px',fontSize:17,cursor:'pointer'}}>Login</button>
        </div>
        <p style={{fontSize:12,color:T.t3}}>Free to join · Free to list · ₹{UNLOCK_FEE} UPI to contact any seller · Email verified</p>
      </div>
      <div style={{padding:'56px 48px',background:T.s,borderTop:`1px solid ${T.b}`,borderBottom:`1px solid ${T.b}`}}>
        <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:30,fontWeight:800,color:T.t,letterSpacing:'-1px',marginBottom:6,textAlign:'center'}}>How it works</h2>
        <p style={{color:T.t3,fontSize:13,textAlign:'center',marginBottom:36}}>Simple. Trusted. BMSIT-only.</p>
        <div className="g4r" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
          {[
            {n:'01',icon:'🎓',t:'Sign up with BMSIT email',d:'Only @bmsit.in email addresses. Verify your email before access.'},
            {n:'02',icon:'📸',t:'Post ad with 3+ photos',d:'Upload product photos. Admin reviews and approves within hours.'},
            {n:'03',icon:'🔒',t:'Buyer pays ₹10 via UPI',d:'Serious buyers pay ₹10. Admin verifies payment then unlocks contact.'},
            {n:'04',icon:'🤝',t:'Connect and close the deal',d:'Seller gets only paid, verified leads. Real campus commerce.'},
          ].map((s,i)=>(
            <div key={i} style={{background:T.bg,border:`1px solid ${T.b2}`,borderRadius:14,padding:24}}>
              <div style={{fontSize:11,color:T.t3,letterSpacing:'0.1em',marginBottom:10,fontWeight:600}}>STEP {s.n}</div>
              <div style={{fontSize:28,marginBottom:12}}>{s.icon}</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:T.t,marginBottom:8}}>{s.t}</div>
              <div style={{fontSize:13,color:T.t2,lineHeight:1.7}}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{padding:'72px 48px'}}>
        <div className="g2r" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:48,alignItems:'center'}}>
          <div>
            <Pill type="yellow">💡 The ₹10 filter</Pill>
            <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:38,fontWeight:800,color:T.t,letterSpacing:'-1.5px',margin:'16px 0 20px',lineHeight:1.1}}>
              We don't just connect.<br/><span style={{color:T.y}}>We filter out the fakers.</span>
            </h2>
            <p style={{fontSize:15,color:T.t2,lineHeight:1.9,marginBottom:16}}>Every campus seller knows the pain — 20 "interested bro" DMs, nobody shows up. We fix this with one rule.</p>
            <p style={{fontSize:15,color:T.t2,lineHeight:1.9}}>Buyers pay ₹{UNLOCK_FEE} via UPI. Admin verifies the payment. Then contact unlocks. No fake leads ever.</p>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {[
              {icon:'❌',t:'Fake "interested bro" DMs',s:'Eliminated completely'},
              {icon:'✅',t:'Only verified paid buyers',s:'Admin checks every payment'},
              {icon:'🎓',t:'Email verified BMSIT only',s:'Real students, real campus'},
              {icon:'👑',t:'Admin-approved listings',s:'Every ad reviewed before live'},
              {icon:'📸',t:'Minimum 3 product photos',s:'Serious sellers only'},
            ].map((f,i)=>(
              <div key={i} style={{background:T.s,border:`1px solid ${T.b2}`,borderRadius:12,padding:'14px 18px',display:'flex',alignItems:'center',gap:14}}>
                <div style={{fontSize:22,flexShrink:0}}>{f.icon}</div>
                <div><div style={{fontSize:14,fontWeight:700,color:T.t}}>{f.t}</div><div style={{fontSize:12,color:T.t3,marginTop:2}}>{f.s}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{padding:'56px 48px',background:T.s,borderTop:`1px solid ${T.b}`,borderBottom:`1px solid ${T.b}`}}>
        <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,color:T.t,letterSpacing:'-1px',marginBottom:6,textAlign:'center'}}>What you can sell</h2>
        <p style={{color:T.t3,fontSize:13,textAlign:'center',marginBottom:28}}>Anything a BMSIT student wants.</p>
        <div className="g4r" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
          {CATS.map(c=>(
            <div key={c.v} style={{background:T.bg,border:`1px solid ${T.b2}`,borderRadius:12,padding:18,display:'flex',alignItems:'center',gap:12}}>
              <div style={{fontSize:26,flexShrink:0}}>{ICON[c.v]}</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:T.t}}>{c.l.replace(/^.{2}\s*/,'')}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{padding:'88px 48px',textAlign:'center'}}>
        <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:44,fontWeight:800,color:T.t,letterSpacing:'-2px',marginBottom:14,lineHeight:1.05}}>Ready to join?</h2>
        <p style={{color:T.t2,marginBottom:36,fontSize:16,lineHeight:1.8}}>Free to join. Free to list. Only ₹{UNLOCK_FEE} UPI to contact any seller.</p>
        <button className="hov" onClick={()=>{setMode('signup');setPage('auth');}} style={{background:T.y,color:'#000',border:'none',borderRadius:14,padding:'16px 60px',fontSize:18,fontWeight:800,cursor:'pointer'}}>
          Join BMSIT Bazaar →
        </button>
      </div>
      <div style={{borderTop:`1px solid ${T.b}`,padding:'20px 48px',textAlign:'center'}}>
        <span style={{fontSize:12,color:T.t3}}>BMSIT Bazaar · Campus marketplace · BMS Institute of Technology & Management, Bengaluru</span>
      </div>
    </div>
  );

  /* AUTH */
  if(page==='auth') return(
    <div style={{minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:'16px'}}>
      <div className="fadeUp" style={{width:'100%',maxWidth:480}}>
        <button onClick={()=>setPage('home')} style={{background:'none',border:'none',color:T.t3,cursor:'pointer',fontSize:13,marginBottom:24,display:'flex',alignItems:'center',gap:6}}>← Back to home</button>
        <div style={{background:T.s,border:`1px solid ${T.b2}`,borderRadius:20,padding:'32px 28px'}}>
          <div style={{textAlign:'center',marginBottom:24}}>
            <Logo size={28}/>
            <div style={{marginTop:10}}><Pill type="yellow">🎓 @bmsit.in email only</Pill></div>
          </div>
          <div style={{display:'flex',gap:6,marginBottom:24}}>
            {['login','signup'].map(m=>(
              <button key={m} onClick={()=>{setMode(m);setAErr('');setAOk('');}}
                style={{flex:1,background:mode===m?T.y:'#1a1a1c',color:mode===m?'#000':T.t3,border:mode===m?'none':`1px solid ${T.b2}`,borderRadius:10,padding:'13px',cursor:'pointer',fontWeight:700,fontSize:14,transition:'all .15s'}}>
                {m==='login'?'Login':'Sign up'}
              </button>
            ))}
          </div>
          <EBox msg={aErr}/>
          {aOk && <div style={{background:T.gBg,border:`1px solid ${T.gBr}`,borderRadius:10,padding:'12px 16px',marginBottom:14,color:T.g,fontSize:13,lineHeight:1.6}}>{aOk}</div>}
          <Btn v="white" onClick={doGoogle} disabled={busy}>
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.7-.4-3.9z"/></svg>
            {busy?'Please wait...':'Continue with Google (@bmsit.in)'}
          </Btn>
          <div style={{display:'flex',alignItems:'center',gap:12,margin:'4px 0 16px'}}>
            <div style={{flex:1,height:1,background:T.b2}}/><span style={{fontSize:12,color:T.t3}}>or use email</span><div style={{flex:1,height:1,background:T.b2}}/>
          </div>
          <Lbl>BMSIT Email Address</Lbl>
          <Inp placeholder="yourname@bmsit.in" type="email" value={email} onChange={e=>setEmail(e.target.value)} autoFocus/>
          <Lbl>Password</Lbl>
          <Inp placeholder="Minimum 6 characters" type="password" value={pass} onChange={e=>setPass(e.target.value)}/>
          <Btn onClick={doAuth} disabled={busy}>
            {busy?<><Spin/>Please wait...</>:mode==='login'?'Login →':'Create account →'}
          </Btn>
          {mode==='login' && (
            <div style={{textAlign:'center',fontSize:12,color:T.t3,marginTop:4}}>
              Didn't get verification email?{' '}
              <span onClick={resendVerification} style={{color:T.y,cursor:'pointer',fontWeight:600}}>Resend</span>
            </div>
          )}
          <div style={{marginTop:20,padding:'14px',background:T.s2,borderRadius:12,border:`1px solid ${T.b}`}}>
            <div style={{fontSize:12,color:T.t3,lineHeight:1.8}}>
              {'🎓 @bmsit.in only · 📧 Email verified · 🔒 Seller privacy · 👑 Admin approved'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* EMAIL VERIFY PAGE */
  if(page==='verify') return(
    <div style={{minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div className="fadeUp" style={{maxWidth:480,width:'100%',textAlign:'center'}}>
        <Card>
          <div style={{fontSize:56,marginBottom:16}}>📧</div>
          <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,color:T.t,marginBottom:12}}>Check your BMSIT email</h2>
          <div style={{background:T.yBg,border:`1px solid ${T.yBr}`,borderRadius:12,padding:18,marginBottom:20}}>
            <div style={{fontSize:13,color:'#a16207',lineHeight:1.8}}>
              We sent a verification link to your BMSIT email inbox.<br/>
              <strong style={{color:T.y}}>Click the link</strong>, then come back and login.
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20,textAlign:'left'}}>
            {['1. Open your BMSIT email inbox','2. Find email from BMSIT Bazaar','3. Click the verification link','4. Come back here and login'].map((s,i)=>(
              <div key={i} style={{fontSize:13,color:T.t2,padding:'10px 14px',background:T.s2,borderRadius:10}}>{s}</div>
            ))}
          </div>
          <Btn onClick={()=>setPage('auth')}>← Back to login</Btn>
        </Card>
      </div>
    </div>
  );

  /* MARKETPLACE */
  if(page==='market') return(
    <div style={{minHeight:'100vh',background:T.bg}}>
      <Nav user={user} onLogout={doLogout} onPost={()=>{setEditId(null);setImages([]);setSf({name:'',usn:'',phone:'',title:'',desc:'',price:'',cat:'food',deadline:''});setPage('post');}} onMyAds={()=>setPage('myads')} onMarket={()=>setPage('market')}/>
      <div style={{padding:'20px 32px',background:T.s,borderBottom:`1px solid ${T.b}`}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16}}>
          <div>
            <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:T.t,letterSpacing:'-0.5px',marginBottom:4}}>BMSIT Bazaar 🎓</h1>
            <p style={{fontSize:13,color:T.t2}}>Browse listings from fellow BMSIT students · Pay ₹{UNLOCK_FEE} UPI to contact any seller</p>
          </div>
          <div style={{display:'flex',gap:10}}>
            <StatBox n={ads.length} label="Live ads" color={T.g}/>
            <StatBox n={[...new Set(ads.map(p=>p.sellerId))].length} label="Sellers"/>
            <StatBox n={ads.reduce((a,p)=>a+(p.unlocks||0),0)} label="Unlocks" color={T.bl}/>
          </div>
        </div>
      </div>
      <div style={{padding:'14px 32px',background:T.s,borderBottom:`1px solid ${T.b}`,display:'flex',gap:10,flexWrap:'wrap',alignItems:'center',position:'sticky',top:57,zIndex:100}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search listings..."
          style={{flex:1,minWidth:200,background:'#0c0c0f',border:`1px solid ${T.b}`,borderRadius:10,padding:'10px 16px',fontSize:13,color:T.t,outline:'none'}}/>
        {[{v:'all',l:'All'},...CATS.map(c=>({v:c.v,l:c.l.split(' ').slice(0,2).join(' ')}))].map(c=>(
          <button key={c.v} onClick={()=>setCatF(c.v)}
            style={{background:catF===c.v?T.y:'#1a1a1c',color:catF===c.v?'#000':T.t2,border:catF===c.v?'none':`1px solid ${T.b2}`,borderRadius:20,padding:'8px 16px',cursor:'pointer',fontSize:12,fontWeight:catF===c.v?700:400,whiteSpace:'nowrap'}}>
            {c.l}
          </button>
        ))}
      </div>
      <div style={{padding:'24px 32px'}}>
        {filtered.length===0?(
          <div style={{textAlign:'center',padding:'80px 0',color:T.t3}}>
            <div style={{fontSize:48,marginBottom:16}}>🔍</div>
            <div style={{fontSize:16,color:T.t2,marginBottom:8}}>No listings found</div>
            <div style={{fontSize:13}}>Try a different category or be the first to post!</div>
          </div>
        ):(
          <div className="g5r fadeUp" style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:16}}>
            {filtered.map(p=>(
              <div key={p.id} className="card-hov" onClick={()=>{setSelAd(p);setImgIdx(0);setUnlockStep('idle');setPage('product');}}
                style={{background:T.s,border:`1px solid ${T.b2}`,borderRadius:16,overflow:'hidden',cursor:'pointer'}}>
                <div style={{height:160,background:T.s2,position:'relative',overflow:'hidden'}}>
                  {p.images?.[0]?<img src={p.images[0]} alt={p.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:48}}>{ICON[p.category]}</div>}
                  {p.images?.length>1&&<div style={{position:'absolute',bottom:6,right:6,background:'rgba(0,0,0,.75)',borderRadius:6,padding:'2px 8px',fontSize:10,color:'#fff'}}>+{p.images.length-1}</div>}
                </div>
                <div style={{padding:14}}>
                  <div style={{display:'flex',gap:6,marginBottom:8}}>
                    <Pill type="live" sm>● Live</Pill>
                    <Pill type="default" sm>{ICON[p.category]}</Pill>
                  </div>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:T.t,marginBottom:4,lineHeight:1.3}}>{p.title}</div>
                  <div style={{fontSize:12,color:T.t2,marginBottom:10,lineHeight:1.5,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{p.description||'No description.'}</div>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:T.y}}>₹{p.price}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  /* PRODUCT DETAIL */
  if(page==='product'&&selAd){
    const isMine     = selAd.sellerId===user?.uid;
    const isUnlocked = !!unlocked[selAd.id]||isMine||(selAd.unlockedBuyers||[]).includes(user?.email);
    const imgs       = selAd.images||[];
    return(
      <div style={{minHeight:'100vh',background:T.bg}}>
        <Nav user={user} onLogout={doLogout} onPost={()=>{setEditId(null);setImages([]);setSf({name:'',usn:'',phone:'',title:'',desc:'',price:'',cat:'food',deadline:''});setPage('post');}} onMyAds={()=>setPage('myads')} onMarket={()=>setPage('market')}/>
        {lightbox!==null&&(
          <div onClick={()=>setLightbox(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.96)',zIndex:999,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <img src={imgs[lightbox]} alt="" style={{maxWidth:'90vw',maxHeight:'90vh',objectFit:'contain',borderRadius:12}}/>
            <button onClick={()=>setLightbox(null)} style={{position:'absolute',top:24,right:24,background:'rgba(255,255,255,.1)',border:'none',color:'#fff',borderRadius:'50%',width:44,height:44,cursor:'pointer',fontSize:22,display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
            {lightbox>0&&<button onClick={e=>{e.stopPropagation();setLightbox(lightbox-1);}} style={{position:'absolute',left:24,background:'rgba(255,255,255,.1)',border:'none',color:'#fff',borderRadius:'50%',width:52,height:52,cursor:'pointer',fontSize:26,display:'flex',alignItems:'center',justifyContent:'center'}}>‹</button>}
            {lightbox<imgs.length-1&&<button onClick={e=>{e.stopPropagation();setLightbox(lightbox+1);}} style={{position:'absolute',right:24,background:'rgba(255,255,255,.1)',border:'none',color:'#fff',borderRadius:'50%',width:52,height:52,cursor:'pointer',fontSize:26,display:'flex',alignItems:'center',justifyContent:'center'}}>›</button>}
          </div>
        )}
        <div style={{padding:'24px 32px'}}>
          <button onClick={()=>setPage('market')} style={{background:'none',border:'none',color:T.t3,cursor:'pointer',fontSize:13,marginBottom:24}}>← Back to marketplace</button>
          <div className="g2r fadeUp" style={{display:'grid',gridTemplateColumns:'1fr 400px',gap:28,alignItems:'start'}}>
            <div>
              {imgs.length>0?(
                <div style={{marginBottom:20}}>
                  <div style={{borderRadius:16,overflow:'hidden',background:T.s2,marginBottom:10,cursor:'zoom-in',aspectRatio:'16/9'}} onClick={()=>setLightbox(imgIdx)}>
                    <img src={imgs[imgIdx]} alt={selAd.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  </div>
                  {imgs.length>1&&(
                    <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:4}}>
                      {imgs.map((url,i)=>(
                        <div key={i} onClick={()=>setImgIdx(i)} style={{width:72,height:72,borderRadius:8,overflow:'hidden',flexShrink:0,cursor:'pointer',border:`2px solid ${i===imgIdx?T.y:T.b}`}}>
                          <img src={url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ):(
                <div style={{height:280,background:T.s2,borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',fontSize:72,marginBottom:20}}>{ICON[selAd.category]}</div>
              )}
              <Card>
                <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:14}}>
                  <Pill type="live">● Live</Pill>
                  <Pill type="default">{ICON[selAd.category]} {selAd.category}</Pill>
                </div>
                <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,color:T.t,letterSpacing:'-0.5px',marginBottom:10,lineHeight:1.2}}>{selAd.title}</h1>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:36,fontWeight:800,color:T.y,marginBottom:16,letterSpacing:'-1px'}}>₹{selAd.price}</div>
                <p style={{fontSize:14,color:T.t2,lineHeight:1.8,marginBottom:16}}>{selAd.description||'No description provided.'}</p>
                {selAd.deadline&&<div style={{background:T.s2,border:`1px solid ${T.b2}`,borderRadius:10,padding:12,fontSize:13,color:T.t2}}>📅 Available until: <strong style={{color:T.t}}>{selAd.deadline}</strong></div>}
              </Card>
              {!isMine&&<div style={{marginTop:14}}><Btn v="dark" onClick={()=>doFlag(selAd.id)}>🚨 Flag this listing</Btn></div>}
            </div>
            <div style={{position:'sticky',top:80}}>
              <Card style={{marginBottom:14}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:800,color:T.t,marginBottom:16,textTransform:'uppercase',letterSpacing:'0.06em'}}>Contact seller</div>
                {isMine?(
                  <div style={{background:T.gBg,border:`1px solid ${T.gBr}`,borderRadius:12,padding:18,textAlign:'center'}}>
                    <div style={{color:T.g,fontWeight:700,fontSize:15,marginBottom:4}}>✓ Your listing</div>
                    <div style={{fontSize:13,color:T.t2}}>Students pay ₹{UNLOCK_FEE} to see your contact details</div>
                  </div>
                ):isUnlocked?(
                  <div style={{background:T.gBg,border:`1px solid ${T.gBr}`,borderRadius:12,padding:18}}>
                    <div style={{color:T.g,fontWeight:700,fontSize:12,marginBottom:14,textTransform:'uppercase',letterSpacing:'0.06em'}}>✓ Contact unlocked</div>
                    {[{l:'Name',v:selAd.sellerName},{l:'Phone',v:selAd.sellerPhone},{l:'Email',v:selAd.sellerEmail},{l:'USN',v:selAd.sellerUSN}].filter(f=>f.v).map((f,i)=>(
                      <div key={i} style={{marginBottom:12}}>
                        <div style={{fontSize:10,color:T.t3,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:3}}>{f.l}</div>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <div style={{fontSize:14,fontWeight:600,color:T.t,flex:1,wordBreak:'break-all'}}>{f.v}</div>
                          <button onClick={()=>copy(f.v)} style={{background:T.s2,border:`1px solid ${T.b2}`,color:T.t2,borderRadius:6,padding:'3px 10px',cursor:'pointer',fontSize:11,flexShrink:0}}>{copied===f.v?'✓':'Copy'}</button>
                        </div>
                      </div>
                    ))}
                    {selAd.sellerPhone&&<Btn v="green" onClick={()=>window.open(`https://wa.me/91${selAd.sellerPhone.replace(/\D/g,'')}?text=Hi! I saw your listing "${selAd.title}" on BMSIT Bazaar. Is it still available?`)}>💬 WhatsApp seller</Btn>}
                  </div>
                ):unlockStep==='pay'?(
                  <div>
                    <div style={{background:T.yBg,border:`1px solid ${T.yBr}`,borderRadius:12,padding:18,marginBottom:14,textAlign:'center'}}>
                      <div style={{fontSize:11,color:'#a16207',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6}}>Unlock fee</div>
                      <div style={{fontFamily:"'Syne',sans-serif",fontSize:48,fontWeight:800,color:T.y,letterSpacing:'-2px',lineHeight:1}}>₹{UNLOCK_FEE}</div>
                      <div style={{fontSize:12,color:'#a16207',marginTop:6}}>One-time · UPI · Admin verified</div>
                    </div>
                    <div style={{background:T.s2,border:`1px solid ${T.b2}`,borderRadius:12,padding:18,marginBottom:14}}>
                      <div style={{fontSize:12,color:T.t2,fontWeight:700,marginBottom:12}}>Pay ₹{UNLOCK_FEE} to:</div>
                      <div style={{display:'flex',alignItems:'center',gap:10,background:'#0c0c0f',border:`1px solid ${T.b}`,borderRadius:10,padding:'12px 14px',marginBottom:12}}>
                        <div style={{fontSize:20}}>💳</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:11,color:T.t3,marginBottom:2}}>UPI ID</div>
                          <div style={{fontSize:14,fontWeight:700,color:T.y,fontFamily:'monospace'}}>{UPI_ID}</div>
                          <div style={{fontSize:11,color:T.t3,marginTop:1}}>{UPI_NAME}</div>
                        </div>
                        <button onClick={()=>copy(UPI_ID)} style={{background:T.s,border:`1px solid ${T.b2}`,color:T.t2,borderRadius:8,padding:'6px 12px',cursor:'pointer',fontSize:11,fontWeight:600,flexShrink:0}}>{copied===UPI_ID?'✓':'Copy'}</button>
                      </div>
                      <Btn onClick={()=>window.open(`upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${UNLOCK_FEE}&cu=INR&tn=${encodeURIComponent('Unlock: '+selAd.title)}`)}>
                        💰 Open UPI app to pay
                      </Btn>
                      <div style={{fontSize:11,color:T.t3,textAlign:'center',marginTop:-4,marginBottom:14}}>Opens GPay / PhonePe / Paytm</div>
                      <Div my={14}/>
                      <div style={{fontSize:12,color:T.t2,fontWeight:700,marginBottom:8}}>After paying, enter your UPI transaction ID:</div>
                      <Inp placeholder="e.g. 426789012345" value={txnId} onChange={e=>setTxnId(e.target.value)}/>
                      <EBox msg={txnErr}/>
                      <Btn onClick={submitUnlock} disabled={busy||!txnId.trim()}>
                        {busy?<><Spin/>Submitting...</>:'✓ I have paid — submit for verification'}
                      </Btn>
                      <div style={{fontSize:11,color:T.t3,textAlign:'center',marginTop:-4}}>Admin verifies all payments · Usually within 2 hours</div>
                    </div>
                    <Btn v="dark" onClick={()=>setUnlockStep('idle')}>← Cancel</Btn>
                  </div>
                ):unlockStep==='pending_admin'?(
                  <div style={{background:T.yBg,border:`1px solid ${T.yBr}`,borderRadius:12,padding:24,textAlign:'center'}}>
                    <div style={{fontSize:40,marginBottom:12}}>⏳</div>
                    <div style={{fontSize:15,fontWeight:700,color:T.y,marginBottom:8}}>Payment under review</div>
                    <div style={{fontSize:13,color:'#a16207',lineHeight:1.7}}>Admin is verifying your payment of ₹{UNLOCK_FEE}. Contact details will unlock within 2 hours once confirmed.</div>
                  </div>
                ):(
                  <div>
                    <div style={{background:T.s2,border:`1px solid ${T.b2}`,borderRadius:12,padding:24,marginBottom:16,textAlign:'center'}}>
                      <div style={{fontSize:40,marginBottom:12}}>🔒</div>
                      <div style={{fontSize:16,fontWeight:700,color:T.t,marginBottom:8}}>Seller info is private</div>
                      <div style={{fontSize:13,color:T.t2,lineHeight:1.7}}>Pay ₹{UNLOCK_FEE} via UPI to see seller's name, phone, email and USN.</div>
                    </div>
                    <Btn onClick={()=>setUnlockStep('pay')}>🔓 Unlock for ₹{UNLOCK_FEE}</Btn>
                    <div style={{fontSize:11,color:T.t3,textAlign:'center',marginTop:-4}}>Serious buyers only · Admin verified</div>
                  </div>
                )}
              </Card>
              <Card>
                <div style={{fontSize:11,color:T.t3,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:12}}>Listing stats</div>
                <div style={{display:'flex',gap:8}}>
                  <StatBox n={selAd.unlocks||0} label="Unlocks" color={T.g}/>
                  <StatBox n={imgs.length} label="Photos" color={T.bl}/>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* POST AD */
  if(page==='post') return(
    <div style={{minHeight:'100vh',background:T.bg}}>
      <Nav user={user} onLogout={doLogout} onPost={()=>{}} onMyAds={()=>setPage('myads')} onMarket={()=>setPage('market')}/>
      <div style={{padding:'24px 32px'}}>
        <button onClick={()=>setPage('myads')} style={{background:'none',border:'none',color:T.t3,cursor:'pointer',fontSize:13,marginBottom:24}}>← Back to my ads</button>
        <Card className="fadeUp">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:28,flexWrap:'wrap',gap:12}}>
            <div>
              <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,color:T.t,letterSpacing:'-0.5px',marginBottom:6}}>{editId?'Edit listing':'Post an ad 📦'}</h2>
              <p style={{fontSize:13,color:T.t3}}>Your phone number is hidden until a buyer pays ₹{UNLOCK_FEE}. Admin reviews before going live.</p>
            </div>
            <Pill type="yellow">{editId?'✏️ Editing':'⚡ New ad'}</Pill>
          </div>
          <div style={{background:T.yBg,border:`1px solid ${T.yBr}`,borderRadius:12,padding:16,marginBottom:28}}>
            <div style={{fontSize:13,color:T.y,fontWeight:700,marginBottom:4}}>📋 What happens after you post</div>
            <div style={{fontSize:13,color:'#a16207',lineHeight:1.8}}>1. You post → 2. Admin reviews (2-4 hrs) → 3. Goes live → 4. Buyers pay ₹{UNLOCK_FEE} to see your contact.</div>
          </div>
          <div className="g2r" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:32,alignItems:'start'}}>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700,color:T.t3,marginBottom:18,textTransform:'uppercase',letterSpacing:'0.06em'}}>Your details</div>
              <Lbl>Your full name *</Lbl><Inp placeholder="Riya Sharma" value={sf.name} onChange={e=>upd('name',e.target.value)}/>
              <Lbl>Phone number * (buyers pay ₹{UNLOCK_FEE} to see this)</Lbl><Inp placeholder="9876543210" type="tel" value={sf.phone} onChange={e=>upd('phone',e.target.value)}/>
              <Lbl>USN (optional)</Lbl><Inp placeholder="1BM22CS001" value={sf.usn} onChange={e=>upd('usn',e.target.value)}/>
              <Div my={20}/>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700,color:T.t3,marginBottom:18,textTransform:'uppercase',letterSpacing:'0.06em'}}>Product details</div>
              <Lbl>Title *</Lbl><Inp placeholder="e.g. Homemade Biryani, Custom Hoodies" value={sf.title} onChange={e=>upd('title',e.target.value)}/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div><Lbl>Category</Lbl><Sel value={sf.cat} onChange={e=>upd('cat',e.target.value)} options={CATS}/></div>
                <div><Lbl>Price (₹) *</Lbl><Inp placeholder="200" type="number" min="1" value={sf.price} onChange={e=>upd('price',e.target.value)}/></div>
              </div>
              <Lbl>Description</Lbl><Tex placeholder="Describe your product, delivery details, pickup location, etc." value={sf.desc} onChange={e=>upd('desc',e.target.value)}/>
              <Lbl>Available until</Lbl><Inp type="date" value={sf.deadline} onChange={e=>upd('deadline',e.target.value)}/>
            </div>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700,color:T.t3,marginBottom:18,textTransform:'uppercase',letterSpacing:'0.06em'}}>Product photos *</div>
              <div style={{background:T.rBg,border:`1px solid ${T.rBr}`,borderRadius:10,padding:12,marginBottom:16,fontSize:12,color:T.r}}>⚠️ Minimum 3 photos required. Good photos = more buyers.</div>
              <ImageUploader images={images} setImages={setImages}/>
              <div style={{marginTop:20,background:T.s2,border:`1px solid ${T.b2}`,borderRadius:12,padding:16}}>
                <div style={{fontSize:12,fontWeight:700,color:T.t2,marginBottom:8}}>📸 Photo tips</div>
                {['First photo is your main display photo','Use natural daylight for food photos','Show all angles','No screenshots or watermarked images'].map((t,i)=><div key={i} style={{fontSize:12,color:T.t3,marginBottom:4}}>· {t}</div>)}
              </div>
            </div>
          </div>
          <Div my={24}/>
          <Btn onClick={doPost} disabled={busy}>
            {busy?<><Spin/>{editId?'Updating...':'Submitting...'}</>:editId?'✓ Update listing':'📤 Submit for admin review'}
          </Btn>
          {editId&&<Btn v="dark" onClick={()=>{setEditId(null);setPage('myads');}}>Cancel</Btn>}
        </Card>
      </div>
    </div>
  );

  /* POSTED */
  if(page==='posted') return(
    <div style={{minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div className="fadeUp" style={{maxWidth:560,width:'100%',textAlign:'center'}}>
        <Card>
          <div style={{fontSize:64,marginBottom:16}}>⏳</div>
          <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,color:T.t,letterSpacing:'-0.5px',marginBottom:12}}>Ad submitted!</h2>
          <div style={{background:T.yBg,border:`1px solid ${T.yBr}`,borderRadius:14,padding:20,marginBottom:20}}>
            <div style={{fontSize:14,color:T.y,fontWeight:700,marginBottom:8}}>🔍 Under admin review</div>
            <div style={{fontSize:13,color:'#a16207',lineHeight:1.8}}>Your ad is being reviewed. Usually takes <strong style={{color:T.y}}>2-4 hours</strong>.</div>
          </div>
          <Btn onClick={()=>setPage('myads')}>View my ads</Btn>
          <Btn v="dark" onClick={()=>setPage('market')}>Browse marketplace</Btn>
        </Card>
      </div>
    </div>
  );

  /* MY ADS */
  if(page==='myads') return(
    <div style={{minHeight:'100vh',background:T.bg}}>
      <Nav user={user} onLogout={doLogout} onPost={()=>{setEditId(null);setImages([]);setSf({name:'',usn:'',phone:'',title:'',desc:'',price:'',cat:'food',deadline:''});setPage('post');}} onMyAds={()=>setPage('myads')} onMarket={()=>setPage('market')}/>
      <div style={{padding:'24px 32px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:12}}>
          <div>
            <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,color:T.t,letterSpacing:'-0.5px',marginBottom:4}}>My ads</h2>
            <p style={{fontSize:13,color:T.t3}}>{user?.email}</p>
          </div>
          <Btn v="yellow" block={false} onClick={()=>{setEditId(null);setImages([]);setSf({name:'',usn:'',phone:'',title:'',desc:'',price:'',cat:'food',deadline:''});setPage('post');}}>+ Post new ad</Btn>
        </div>
        <div className="g5r fadeUp" style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:24}}>
          <StatBox n={myAds.length} label="Total ads"/>
          <StatBox n={myAds.filter(a=>a.status==='pending').length} label="Pending" color={T.y}/>
          <StatBox n={myAds.filter(a=>a.status==='approved').length} label="Live" color={T.g}/>
          <StatBox n={myAds.reduce((a,p)=>a+(p.unlocks||0),0)} label="Unlocks" color={T.bl}/>
          <StatBox n={`₹${myAds.reduce((a,p)=>a+(p.unlocks||0),0)*UNLOCK_FEE}`} label="Revenue" color={T.g}/>
        </div>
        {myAds.length===0&&(
          <div style={{textAlign:'center',padding:'64px 0',color:T.t3}}>
            <div style={{fontSize:48,marginBottom:12}}>📦</div>
            <div style={{fontSize:15,color:T.t2,marginBottom:6}}>No ads yet</div>
            <div style={{fontSize:13}}>Post your first ad to start selling!</div>
          </div>
        )}
        <div style={{display:'grid',gap:12}}>
          {myAds.map(p=>(
            <Card key={p.id} style={{border:`1px solid ${p.status==='rejected'?T.rBr:p.status==='pending'?T.yBr:T.b2}`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12}}>
                <div style={{flex:1,minWidth:200,display:'flex',gap:14,alignItems:'flex-start'}}>
                  {p.images?.[0]&&<img src={p.images[0]} alt="" style={{width:60,height:60,borderRadius:8,objectFit:'cover',border:`1px solid ${T.b2}`,flexShrink:0}}/>}
                  <div style={{flex:1}}>
                    <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap',marginBottom:6}}>
                      <span style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800,color:T.t}}>{p.title}</span>
                      {p.status==='pending'&&<span style={{background:T.yBg,border:`1px solid ${T.yBr}`,color:T.y,borderRadius:20,padding:'2px 10px',fontSize:11,fontWeight:600}}>Pending review</span>}
                      {p.status==='approved'&&<span style={{background:T.gBg,border:`1px solid ${T.gBr}`,color:T.g,borderRadius:20,padding:'2px 10px',fontSize:11,fontWeight:600}}>Live</span>}
                      {p.status==='rejected'&&<span style={{background:T.rBg,border:`1px solid ${T.rBr}`,color:T.r,borderRadius:20,padding:'2px 10px',fontSize:11,fontWeight:600}}>Rejected</span>}
                    </div>
                    <div style={{fontSize:12,color:T.t3,marginBottom:8}}>₹{p.price} · {p.category} · {(p.images||[]).length} photos</div>
                    {p.status==='pending'&&<div style={{fontSize:12,color:'#a16207',background:T.yBg,border:`1px solid ${T.yBr}`,borderRadius:8,padding:'8px 12px',marginBottom:8}}>Under admin review. Usually approved within 2-4 hours.</div>}
                    {p.status==='rejected'&&<div style={{fontSize:12,color:T.r,background:T.rBg,border:`1px solid ${T.rBr}`,borderRadius:8,padding:'8px 12px',marginBottom:8}}>Ad rejected. Edit and resubmit.</div>}
                    {p.status==='approved'&&<div style={{display:'flex',gap:8}}><StatBox n={p.unlocks||0} label="Unlocks" color={T.g}/><StatBox n={`₹${(p.unlocks||0)*UNLOCK_FEE}`} label="Revenue" color={T.g}/></div>}
                  </div>
                </div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {p.status==='approved'&&<button onClick={()=>{setSelAd(p);setImgIdx(0);setUnlockStep('idle');setPage('product');}} style={{background:T.blBg,color:T.bl,border:`1px solid ${T.blBr}`,borderRadius:8,padding:'8px 14px',cursor:'pointer',fontSize:12,fontWeight:600}}>View</button>}
                  <button onClick={()=>{setEditId(p.id);setImages(p.images||[]);setSf({name:p.sellerName,usn:p.sellerUSN||'',phone:p.sellerPhone||'',title:p.title,desc:p.description||'',price:String(p.price),cat:p.category,deadline:p.deadline||''});setPage('post');}} style={{background:T.yBg,color:T.y,border:`1px solid ${T.yBr}`,borderRadius:8,padding:'8px 14px',cursor:'pointer',fontSize:12,fontWeight:600}}>Edit</button>
                  <button onClick={async()=>{if(!window.confirm('Remove this ad?'))return;await updateDoc(doc(db,'ads',p.id),{status:'removed'});loadMine(user.uid);}} style={{background:T.rBg,color:T.r,border:`1px solid ${T.rBr}`,borderRadius:8,padding:'8px 14px',cursor:'pointer',fontSize:12,fontWeight:600}}>Remove</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  /* ADMIN */
  if(page==='admin') return(
    <div style={{minHeight:'100vh',background:T.bg}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 32px',background:T.s,borderBottom:`1px solid ${T.b}`,position:'sticky',top:0,zIndex:200}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}><Logo size={20}/><Pill type="yellow">👑 Admin Panel</Pill></div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={loadAdmin} style={{background:T.yBg,border:`1px solid ${T.yBr}`,color:T.y,borderRadius:8,padding:'7px 16px',cursor:'pointer',fontSize:12,fontWeight:700}}>{busy?'Loading...':'↻ Refresh'}</button>
          <button onClick={doLogout} style={{background:T.s2,border:`1px solid ${T.b2}`,color:T.t2,borderRadius:8,padding:'7px 14px',cursor:'pointer',fontSize:12}}>Logout</button>
        </div>
      </div>
      <div style={{padding:'28px 32px'}}>
        <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:T.t,marginBottom:20}}>Dashboard</h2>
        <div className="g5r fadeUp" style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:14,marginBottom:20}}>
          <StatBox n={liveAds.length} label="Live ads" color={T.g}/>
          <StatBox n={pendingAds.length} label="Pending" color={T.y}/>
          <StatBox n={uniqueSellers} label="Sellers" color={T.bl}/>
          <StatBox n={txns.length} label="Unlocks" color={T.bl}/>
          <StatBox n={`₹${totalRev}`} label="Revenue" color={T.g}/>
        </div>
        <div className="g3r" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:28}}>
          <div style={{background:T.gBg,border:`1px solid ${T.gBr}`,borderRadius:14,padding:22,textAlign:'center'}}>
            <div style={{fontSize:11,color:T.g,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:6}}>Total revenue</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:40,fontWeight:800,color:T.g,letterSpacing:'-2px'}}>₹{totalRev}</div>
            <div style={{fontSize:12,color:T.g,opacity:.7,marginTop:6}}>UPI: {UPI_ID}</div>
          </div>
          <div style={{background:T.yBg,border:`1px solid ${T.yBr}`,borderRadius:14,padding:22,textAlign:'center'}}>
            <div style={{fontSize:11,color:T.y,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:6}}>Pending verification</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:40,fontWeight:800,color:T.y,letterSpacing:'-2px'}}>{pendingTxns.length}</div>
            <div style={{fontSize:12,color:'#a16207',marginTop:6}}>₹{pendingTxns.reduce((a,t)=>a+t.amount,0)} to verify</div>
          </div>
          <div style={{background:T.blBg,border:`1px solid ${T.blBr}`,borderRadius:14,padding:22,textAlign:'center'}}>
            <div style={{fontSize:11,color:T.bl,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:6}}>Pending ads</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:40,fontWeight:800,color:T.bl,letterSpacing:'-2px'}}>{pendingAds.length}</div>
            <div style={{fontSize:12,color:T.bl,opacity:.7,marginTop:6}}>{allAds.length} total posted</div>
          </div>
        </div>
        {pendingTxns.length>0&&(
          <div style={{marginBottom:28}}>
            <h3 style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:800,color:T.y,marginBottom:14}}>💰 Payment verifications — {pendingTxns.length} pending</h3>
            <div style={{display:'grid',gap:10}}>
              {pendingTxns.map(t=>(
                <div key={t.id} style={{background:T.s,border:`1px solid ${T.yBr}`,borderRadius:12,padding:18,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
                  <div>
                    <div style={{fontSize:14,fontWeight:700,color:T.t,marginBottom:4}}>₹{t.amount} · {t.adTitle}</div>
                    <div style={{fontSize:12,color:T.t2,marginBottom:4}}>Buyer: {t.buyerEmail}</div>
                    <div style={{fontSize:12,color:T.t2}}>UPI TXN ID: <strong style={{color:T.y,fontFamily:'monospace'}}>{t.txnId}</strong></div>
                    <div style={{fontSize:11,color:T.t3,marginTop:4}}>{t.createdAt?.toDate?.()?.toLocaleString('en-IN')||'Recently'}</div>
                  </div>
                  <button onClick={()=>verifyTxn(t)} style={{background:T.gBg,color:T.g,border:`1px solid ${T.gBr}`,borderRadius:8,padding:'10px 18px',cursor:'pointer',fontSize:13,fontWeight:700}}>✅ Verify & unlock</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {pendingAds.length>0&&(
          <div style={{marginBottom:28}}>
            <h3 style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:800,color:T.o,marginBottom:14}}>⏳ Ads pending review — {pendingAds.length}</h3>
            <div style={{display:'grid',gap:12}}>
              {pendingAds.map(p=>(
                <div key={p.id} style={{background:T.s,border:`1px solid ${T.oBr}`,borderRadius:14,padding:20}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12}}>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800,color:T.t,marginBottom:6}}>{p.title}</div>
                      <div style={{fontSize:12,color:T.t2,marginBottom:8}}>By {p.sellerName} · {p.sellerEmail} · ₹{p.price} · {p.category}</div>
                      {p.description&&<div style={{fontSize:13,color:T.t2,marginBottom:12,lineHeight:1.6}}>{p.description}</div>}
                      {(p.images||[]).length>0&&(
                        <div style={{display:'flex',gap:8,marginBottom:8}}>
                          {p.images.map((img,i)=><img key={i} src={img} alt="" style={{width:72,height:72,borderRadius:8,objectFit:'cover',border:`1px solid ${T.b2}`}}/>)}
                        </div>
                      )}
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:8,minWidth:150}}>
                      <button onClick={()=>adminUpdate(p.id,{status:'approved',flagged:false,flags:[]})} style={{background:T.gBg,color:T.g,border:`1px solid ${T.gBr}`,borderRadius:8,padding:'10px 16px',cursor:'pointer',fontSize:13,fontWeight:700}}>✅ Approve</button>
                      <button onClick={()=>adminUpdate(p.id,{status:'rejected'})} style={{background:T.rBg,color:T.r,border:`1px solid ${T.rBr}`,borderRadius:8,padding:'10px 16px',cursor:'pointer',fontSize:13,fontWeight:700}}>❌ Reject</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div>
          <h3 style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:800,color:T.t,marginBottom:14}}>All ads ({allAds.length})</h3>
          {[...allAds].sort((a,b)=>{const o={pending:0,approved:1,rejected:2,removed:3};return (o[a.status]||0)-(o[b.status]||0);}).map(p=>(
            <div key={p.id} style={{background:T.s2,border:`1px solid ${p.status==='pending'?T.yBr:p.status==='rejected'||p.status==='removed'?T.rBr:T.b2}`,borderRadius:12,padding:16,marginBottom:10}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12}}>
                <div style={{flex:1,minWidth:180}}>
                  <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap',marginBottom:6}}>
                    {p.images?.[0]&&<img src={p.images[0]} alt="" style={{width:40,height:40,borderRadius:6,objectFit:'cover',flexShrink:0}}/>}
                    <span style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,color:T.t}}>{p.title}</span>
                    {p.status==='pending'&&<Pill type="yellow" sm>Pending</Pill>}
                    {p.status==='approved'&&<Pill type="live" sm>Live</Pill>}
                    {(p.status==='rejected'||p.status==='removed')&&<Pill type="frozen" sm>{p.status}</Pill>}
                    {p.flagged&&<Pill type="warn" sm>Flagged</Pill>}
                  </div>
                  <div style={{fontSize:12,color:T.t2,marginBottom:8}}>{p.sellerName} · {p.sellerEmail} · ₹{p.price} · {p.category}</div>
                  <div style={{display:'flex',gap:8}}>
                    <StatBox n={p.unlocks||0} label="Unlocks" color={T.g}/>
                    <StatBox n={`₹${(p.unlocks||0)*UNLOCK_FEE}`} label="Revenue" color={T.g}/>
                    <StatBox n={(p.flags||[]).length} label="Flags" color={p.flagged?T.r:T.t3}/>
                  </div>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:6,minWidth:140}}>
                  {p.status==='pending'&&<button onClick={()=>adminUpdate(p.id,{status:'approved',flagged:false})} style={{background:T.gBg,color:T.g,border:`1px solid ${T.gBr}`,borderRadius:8,padding:'8px 14px',cursor:'pointer',fontSize:12,fontWeight:700}}>Approve</button>}
                  {p.status==='approved'&&<button onClick={()=>adminUpdate(p.id,{status:'rejected'})} style={{background:T.rBg,color:T.r,border:`1px solid ${T.rBr}`,borderRadius:8,padding:'8px 14px',cursor:'pointer',fontSize:12,fontWeight:700}}>Remove</button>}
                  {(p.status==='rejected'||p.status==='removed')&&<button onClick={()=>adminUpdate(p.id,{status:'approved'})} style={{background:T.gBg,color:T.g,border:`1px solid ${T.gBr}`,borderRadius:8,padding:'8px 14px',cursor:'pointer',fontSize:12,fontWeight:700}}>Restore</button>}
                  {p.flagged&&<button onClick={()=>adminUpdate(p.id,{flagged:false,flags:[]})} style={{background:T.gBg,color:T.g,border:`1px solid ${T.gBr}`,borderRadius:8,padding:'8px 14px',cursor:'pointer',fontSize:12,fontWeight:700}}>Clear flag</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return null;
}