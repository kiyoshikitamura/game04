/* Approved B07 scenery motion. Transparent rear layer, no sound or external assets. */
(() => {
  'use strict';
  // Positions are normalized to the visible home background, not the character.
  const scenes = {
    sakura: { particles: 'petal', count: 8, color: '255,199,217' },
    mikawa: { light: [.22,.18,.24,.32], mist: [[.53,.58,.30,.05]], color: '255,241,191' },
    owari: { particles: 'dust', count: 6, zone: [.68,.22,.26,.32], mist: [[.65,.51,.27,.045]], color: '255,238,180' },
    mino: { mist: [[.23,.49,.25,.075],[.20,.68,.30,.065]], color: '205,219,225' },
    omi: { particles: 'glint', count: 8, zone: [.08,.46,.82,.34], mist: [[.55,.43,.35,.035]], color: '206,239,250' },
    kai: { mist: [[.67,.38,.28,.04],[.76,.53,.22,.06]], color: '221,225,215' },
    echigo: { particles: 'snow', count: 8, mist: [[.62,.39,.30,.04]], color: '232,242,255' },
    kyoto: { glows: [[.13,.24,.08],[.11,.43,.06]], mist: [[.58,.56,.17,.035]], color: '255,196,111' },
    izumo: { light: [.29,.19,.12,.32], particles: 'dust', count: 6, zone: [.09,.12,.37,.48], color: '222,240,209' },
    satsuma: { mist: [[.53,.34,.32,.045]], glows: [[.24,.58,.045],[.65,.52,.035]], color: '245,172,118' },
    sekigahara: { mist: [[.47,.40,.42,.04],[.60,.53,.35,.055]], color: '211,222,230' },
  };
  const scene = new URLSearchParams(location.search).get('scene');
  const config = Object.prototype.hasOwnProperty.call(scenes,scene) ? scenes[scene] : undefined;
  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  if (!config || !ctx) return;
  document.documentElement.dataset.scene = scene;
  document.documentElement.dataset.particles = String(config.count || 0);
  document.documentElement.dataset.mistLayers = String(config.mist?.length || 0);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 1, height = 1, raf = 0, previous = 0, lastDraw = 0, elapsed = 0, disposed = false;
  const rgba = alpha => `rgba(${config.color},${alpha})`;
  const TAU = Math.PI * 2;
  function resize() {
    width = Math.max(1,innerWidth); height = Math.max(1,innerHeight);
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  function haze(x,y,rx,ry,alpha) {
    ctx.save(); ctx.translate(x*width,y*height); ctx.scale(rx*width,ry*height);
    const g=ctx.createRadialGradient(0,0,0,0,0,1);
    g.addColorStop(0,rgba(alpha)); g.addColorStop(.55,rgba(alpha*.42)); g.addColorStop(1,rgba(0));
    ctx.fillStyle=g;ctx.fillRect(-1,-1,2,2);ctx.restore();
  }
  function particles(time) {
    const zone=config.zone || [0,0,1,1];
    for(let i=0;i<(config.count||0);i++){
      const phase=i*2.399,cycle=time/(config.particles==='snow'?16:14);
      const x=zone[0]+zone[2]*(((i*.618+Math.sin(time*.23+phase)*.06)%1+1)%1);
      const y=zone[1]+zone[3]*((i*.173+cycle)%1);
      const alpha=(.35+.15*Math.sin(time*.5+phase));
      ctx.save();ctx.translate(x*width,y*height);
      if(config.particles==='petal'){
        // Same curved petal silhouette as the existing SSR sakura renderer; only 8 rear petals.
        const size=2.2+i%3*.4;ctx.rotate(time*.25+phase);ctx.scale(.6+Math.abs(Math.sin(time*.35+phase))*.4,1);
        ctx.fillStyle=rgba(alpha);ctx.beginPath();ctx.moveTo(0,-size);
        ctx.bezierCurveTo(size*.9,-size*.65,size*.85,size*.45,0,size);
        ctx.bezierCurveTo(-size*.85,size*.45,-size*.9,-size*.65,0,-size);ctx.fill();
      }else if(config.particles==='glint'){
        const pulse=Math.pow(Math.max(0,Math.sin(time*TAU/12+phase)),4);
        ctx.fillStyle=rgba(pulse*.45);ctx.beginPath();ctx.ellipse(0,0,2.8, .65,0,0,TAU);ctx.fill();
      }else{
        ctx.fillStyle=rgba(config.particles==='snow'?alpha:alpha*.5);
        ctx.beginPath();ctx.arc(0,0,config.particles==='snow'?1.1:1.3,0,TAU);ctx.fill();
      }
      ctx.restore();
    }
  }
  function render(time){
    ctx.clearRect(0,0,width,height);
    (config.mist||[]).forEach(([x,y,rx,ry],i)=>{
      haze(x+Math.sin(time*TAU/16+i)*.035,y,rx,ry,.09+.025*Math.sin(time*TAU/14+i));
    });
    if(config.light){const [x,y,rx,ry]=config.light;haze(x+Math.sin(time*TAU/16)*.015,y,rx,ry,.07+.025*Math.sin(time*TAU/12));}
    (config.glows||[]).forEach(([x,y,r],i)=>haze(x,y,r,r,.07+.025*Math.sin(time*TAU/8+i)));
    particles(time);
  }
  function frame(now){
    raf=0;
    if(disposed||document.hidden||motion.matches)return;
    if(!previous)previous=now;
    elapsed+=Math.min((now-previous)/1000,.05);previous=now;
    if(now-lastDraw>=1000/30){render(elapsed);lastDraw=now;}
    raf=requestAnimationFrame(frame);
  }
  function stop(){cancelAnimationFrame(raf);raf=0;previous=0;ctx.clearRect(0,0,width,height);}
  function update(){
    stop();
    if(!disposed&&!document.hidden&&!motion.matches)raf=requestAnimationFrame(frame);
    document.documentElement.dataset.running=String(!!raf);
  }
  function dispose(){
    disposed=true;stop();document.documentElement.dataset.running='false';
    removeEventListener('resize',resize);removeEventListener('pagehide',dispose);
    document.removeEventListener('visibilitychange',update);motion.removeEventListener('change',update);
    observer.disconnect();
  }
  const observer=new ResizeObserver(resize);
  function start(){
    disposed=false;resize();observer.observe(document.documentElement);
    addEventListener('resize',resize);addEventListener('pagehide',dispose);
    document.addEventListener('visibilitychange',update);motion.addEventListener('change',update);update();
  }
  addEventListener('pageshow',event=>{if(event.persisted&&disposed)start();});
  start();
})();
