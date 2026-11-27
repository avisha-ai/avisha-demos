/* Avisha design kit v1 (27 Nov 2026). No libraries, no tracking. Exposes window.AK. See README.md. */
(function(w,d){"use strict";
var mq=function(q){return w.matchMedia?w.matchMedia(q):{matches:false};};
var RM=mq("(prefers-reduced-motion: reduce)"),FINE=mq("(hover: hover) and (pointer: fine)");
function rm(){return !!RM.matches;}
function each(l,f){Array.prototype.forEach.call(l,f);}
function $(x){return typeof x==="string"?d.getElementById(x):x;}
d.documentElement.classList.add("ak-js");
var AK={reduced:rm};

/* ripple on tap */
d.addEventListener("pointerdown",function(e){
var t=e.target.closest&&e.target.closest(".ak-tile,.ak-btn,.ak-fab,.ak-dial-item,[data-ak-ripple]");if(!t||rm())return;
var r=t.getBoundingClientRect(),s=Math.max(r.width,r.height)*2.2,c=d.createElement("span");
c.className="ak-rip";c.setAttribute("aria-hidden","true");
c.style.cssText="width:"+s+"px;height:"+s+"px;left:"+(e.clientX-r.left-s/2)+"px;top:"+(e.clientY-r.top-s/2)+"px";
t.appendChild(c);setTimeout(function(){if(c.parentNode)c.parentNode.removeChild(c);},650);});

/* 3D tilt (desktop pointers only) */
var tilted=null;
function untilt(t){t.classList.remove("ak-tilting");t.style.removeProperty("--rx");t.style.removeProperty("--ry");}
d.addEventListener("pointermove",function(e){
if(e.pointerType!=="mouse"||!FINE.matches||rm())return;
var t=e.target.closest&&e.target.closest(".ak-tilt");
if(tilted&&tilted!==t)untilt(tilted);tilted=t;if(!t)return;
var r=t.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
t.classList.add("ak-tilting");t.style.setProperty("--ry",(px*10).toFixed(2)+"deg");t.style.setProperty("--rx",(-py*10).toFixed(2)+"deg");});
d.addEventListener("pointerleave",function(){if(tilted){untilt(tilted);tilted=null;}});

/* bottom sheet */
var openS=null,opener=null,inerted=[];
function sheetOpen(sc,from){sc=$(sc);if(!sc)return;if(openS&&openS!==sc)sheetClose(true);if(openS===sc)return;
closeDials();from=from||d.activeElement;
var dl=from&&from.closest&&from.closest(".ak-dial");opener=dl?dl.querySelector(".ak-fab"):from;openS=sc;
inerted=[];each(d.body.children,function(c){if(c!==sc&&c.tagName!=="SCRIPT"&&!c.hasAttribute("inert")){c.setAttribute("inert","");c.setAttribute("aria-hidden","true");inerted.push(c);}});
sc.setAttribute("aria-hidden","false");void sc.offsetWidth;sc.classList.add("open");d.body.style.overflow="hidden";
var x=sc.querySelector(".ak-x")||sc.querySelector(".ak-sheet");setTimeout(function(){if(openS===sc)x.focus();},60);
sc.dispatchEvent(new CustomEvent("ak:open"));}
function sheetClose(quiet){var sc=openS;if(!sc)return;openS=null;
sc.classList.remove("open");sc.setAttribute("aria-hidden","true");
var p=sc.querySelector(".ak-sheet");if(p){p.style.removeProperty("--dy");p.classList.remove("ak-dragging");}
each(inerted,function(c){c.removeAttribute("inert");c.removeAttribute("aria-hidden");});inerted=[];d.body.style.overflow="";
sc.dispatchEvent(new CustomEvent("ak:close"));if(!quiet&&opener&&opener.focus)opener.focus();}
AK.sheet={open:sheetOpen,close:function(){sheetClose();},current:function(){return openS;}};
/* drag the handle or header down to close */
var drag=null;
d.addEventListener("pointerdown",function(e){if(!openS)return;var h=e.target.closest&&e.target.closest(".ak-handle,.ak-sheet-head");
if(!h||e.target.closest("button")||!openS.contains(h))return;var p=openS.querySelector(".ak-sheet");
drag={p:p,y:e.clientY,dy:0,id:e.pointerId};p.classList.add("ak-dragging");try{h.setPointerCapture(e.pointerId);}catch(_){}});
d.addEventListener("pointermove",function(e){if(!drag||e.pointerId!==drag.id)return;drag.dy=Math.max(0,e.clientY-drag.y);drag.p.style.setProperty("--dy",drag.dy+"px");});
function endDrag(e){if(!drag||e.pointerId!==drag.id)return;var g=drag;drag=null;g.p.classList.remove("ak-dragging");
if(g.dy>110)sheetClose();else g.p.style.removeProperty("--dy");}
d.addEventListener("pointerup",endDrag);d.addEventListener("pointercancel",endDrag);

/* speed dial */
var dials=[];
function dial(el){el=$(el);if(!el||el._ak)return el&&el._ak;
var fab=el.querySelector(".ak-fab"),menu=el.querySelector(".ak-dial-menu"),items=el.querySelectorAll(".ak-dial-item"),scrim=el.querySelector(".ak-dial-scrim"),txt=el.querySelector(".ak-fab-text"),label=txt?txt.textContent:"",n=items.length;
each(items,function(it,i){it.style.setProperty("--i",n-1-i);it.style.setProperty("--j",i);});
function set(o){el.classList.toggle("open",o);fab.setAttribute("aria-expanded",o?"true":"false");
if(o)menu.removeAttribute("inert");else menu.setAttribute("inert","");menu.setAttribute("aria-hidden",o?"false":"true");
if(txt)txt.textContent=o?"Close":label;}
var api={open:function(){set(true);setTimeout(function(){if(items[n-1])items[n-1].focus();},80);},close:function(focus){if(!el.classList.contains("open"))return;set(false);if(focus)fab.focus();},isOpen:function(){return el.classList.contains("open");}};
fab.addEventListener("click",function(){api.isOpen()?api.close():api.open();});
if(scrim)scrim.addEventListener("click",function(){api.close(true);});
each(items,function(it){it.addEventListener("click",function(){set(false);});});
set(false);el._ak=api;dials.push(api);return api;}
function closeDials(){each(dials,function(a){a.close();});}
AK.dial=dial;

/* story cards */
function stories(el,o){el=$(el);o=o||{};var cards=el.querySelectorAll(".ak-story"),n=cards.length,bars=el.querySelector(".ak-bars"),i=0,run=false,live=el.querySelector(".ak-story-live"),pb=el.querySelector(".ak-pause");
bars.textContent="";for(var k=0;k<n;k++){var b=d.createElement("i");b.appendChild(d.createElement("b"));bars.appendChild(b);}
var bs=bars.children;el.style.setProperty("--ak-dur",(o.ms||5000)+"ms");
function go(j){i=Math.max(0,Math.min(n-1,j));el.classList.remove("ended");
for(var k=0;k<n;k++){cards[k].classList.toggle("on",k===i);cards[k].classList.toggle("past",k<i);cards[k].setAttribute("aria-hidden",k===i?"false":"true");bs[k].className=k<i?"done":"";}
void bs[i].offsetWidth;bs[i].className=run&&!rm()?"on":"cur";if(live)live.textContent="Card "+(i+1)+" of "+n;if(o.onChange)o.onChange(i);}
function end(){run=false;bs[n-1].className="done";el.classList.add("ended");setPb();if(o.onEnd)o.onEnd();}
function next(){if(i<n-1)go(i+1);else end();}
function setPb(){if(pb){pb.textContent=run?"❚❚":"▶";pb.setAttribute("aria-label",run?"Pause the cards":"Play the cards");}}
bars.addEventListener("animationend",function(e){if(run&&e.target===bs[i].firstChild)next();});
var pv=el.querySelector(".ak-tap.prev"),nx=el.querySelector(".ak-tap.next");
if(pv)pv.addEventListener("click",function(){go(i-1);});
if(nx)nx.addEventListener("click",next);
if(pb)pb.addEventListener("click",function(){if(run){run=false;el.classList.remove("paused");bs[i].className="cur";}else{run=true;if(el.classList.contains("ended"))i=0;}go(i);setPb();});
el.addEventListener("pointerdown",function(e){if(run&&!e.target.closest(".ak-pause"))el.classList.add("paused");});
each(["pointerup","pointercancel","pointerleave"],function(t){el.addEventListener(t,function(){el.classList.remove("paused");});});
el.addEventListener("keydown",function(e){if(e.key==="ArrowRight"){next();e.preventDefault();}else if(e.key==="ArrowLeft"){go(i-1);e.preventDefault();}});
var api={start:function(){run=!rm();go(0);setPb();},stop:function(){run=false;el.classList.remove("paused");each(bs,function(b){b.className="";});setPb();},go:go,next:next};
return api;}
AK.stories=stories;

/* count-up number */
function countUp(el,to,o){el=$(el);o=o||{};var dec=o.decimals||0,from=o.from||0,dur=o.ms||900;
function f(v){var s=v.toFixed(dec);if(/^-0(\.0+)?$/.test(s))s=s.slice(1);if(o.sign&&parseFloat(s)>0)s="+"+s;return (o.prefix||"")+s.replace("-","−")+(o.suffix||"");}
if(el._akRaf)w.cancelAnimationFrame(el._akRaf);
if(rm()||!w.requestAnimationFrame){el.textContent=f(to);return;}
var t0=null;function step(t){if(t0===null)t0=t;var p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,3);el.textContent=f(from+(to-from)*e);if(p<1)el._akRaf=w.requestAnimationFrame(step);}
el.textContent=f(from);el._akRaf=w.requestAnimationFrame(step);}
AK.countUp=countUp;

/* progress ring: frac 0..1 */
AK.ring=function(el,frac,label){el=$(el);var c=el.querySelector(".ak-ring-fg"),C=2*Math.PI*parseFloat(c.getAttribute("r"));frac=Math.max(0,Math.min(1,frac));
c.style.strokeDasharray=C.toFixed(2);c.style.strokeDashoffset=(C*(1-frac)).toFixed(2);el.classList.toggle("full",frac>=1);
var v=el.querySelector(".ak-ring-val");if(v&&label!=null)v.textContent=label;};

/* checkmark draw: replays the animation */
AK.check=function(el){el=$(el);el.classList.remove("go");void el.offsetWidth;el.classList.add("go");};

/* confetti burst inside a positioned host */
var COLS=["#e86fa8","#5fc4c9","#1d7f86","#ffd166","#c2185b","#0f1b2d"];
AK.confetti=function(host,n){host=$(host);if(rm()||!host)return;n=n||30;var box=d.createElement("div");box.className="ak-confetti";box.setAttribute("aria-hidden","true");
for(var k=0;k<n;k++){var p=d.createElement("i"),a=Math.random()*Math.PI*2,v=70+Math.random()*120;
p.style.cssText="background:"+COLS[k%COLS.length]+";--x:"+(Math.cos(a)*v).toFixed(0)+"px;--y:"+(Math.sin(a)*v*.7+60).toFixed(0)+"px;--r:"+(Math.random()*720-360).toFixed(0)+"deg;animation-delay:"+(Math.random()*90).toFixed(0)+"ms";
box.appendChild(p);}host.appendChild(box);setTimeout(function(){if(box.parentNode)box.parentNode.removeChild(box);},1400);};

/* shimmer skeleton for at most 400 ms, then done() */
AK.skeleton=function(host,ms,done,lines){host=$(host);host.textContent="";var wrap=d.createElement("div");wrap.setAttribute("role","status");
var sr=d.createElement("span");sr.className="ak-sr";sr.textContent="Loading";wrap.appendChild(sr);
for(var k=0;k<(lines||3);k++){var s=d.createElement("div");s.className="ak-skel";s.style.width=[92,74,58,84][k%4]+"%";wrap.appendChild(s);}
host.appendChild(wrap);setTimeout(function(){host.textContent="";done();},rm()?0:Math.min(ms||300,400));};

/* scroll reveal */
function reveal(){var els=d.querySelectorAll(".ak-reveal:not(.ak-in)");
if(rm()||!("IntersectionObserver" in w)){each(els,function(e){e.classList.add("ak-in");});return;}
var io=new IntersectionObserver(function(es){each(es,function(en){if(en.isIntersecting){en.target.classList.add("ak-in");io.unobserve(en.target);}});},{threshold:.12,rootMargin:"0px 0px -6% 0px"});
each(els,function(e){io.observe(e);});}
AK.reveal=reveal;

/* light / dark theme */
function theme(t){var h=d.documentElement;if(t)h.setAttribute("data-theme",t);t=h.getAttribute("data-theme")||"light";
each(d.querySelectorAll("[data-ak-theme-toggle]"),function(b){var dk=t==="dark";b.setAttribute("aria-pressed",dk?"true":"false");b.setAttribute("aria-label",dk?"Switch to light mode":"Switch to dark mode");b.textContent=dk?"☀️":"🌙";});
var m=d.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",t==="dark"?"#0b1320":"#0f1b2d");return t;}
AK.theme=theme;

/* global wiring */
d.addEventListener("click",function(e){var t=e.target;if(!t.closest)return;
var o=t.closest("[data-ak-sheet]");if(o){sheetOpen(o.getAttribute("data-ak-sheet"),o);return;}
if(openS&&(t===openS||t.closest(".ak-x"))){sheetClose();return;}
if(t.closest("[data-ak-theme-toggle]"))theme(d.documentElement.getAttribute("data-theme")==="dark"?"light":"dark");});
d.addEventListener("keydown",function(e){if(e.key!=="Escape"&&e.key!=="Esc")return;
if(openS){sheetClose();return;}each(dials,function(a){a.close(true);});});
function init(){each(d.querySelectorAll("[data-ak-dial]"),dial);
if(!d.documentElement.getAttribute("data-theme"))theme(mq("(prefers-color-scheme: dark)").matches?"dark":"light");else theme();reveal();}
if(d.readyState==="loading")d.addEventListener("DOMContentLoaded",init);else init();
w.AK=AK;
})(window,document);
