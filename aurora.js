/* Hero Prisma: aurora em WebGL que segue o cursor com suavidade e vitrine com inclinação. */
(() => {
  const hero = document.querySelector('.aurora-hero');
  if (!hero) return;
  const root = document.documentElement;
  const bg = hero.querySelector('.aurora-bg');
  const canvas = hero.querySelector('#aurora-canvas');
  const showcase = hero.querySelector('.aurora-showcase');
  const tiltEl = hero.querySelector('.showcase-tilt');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let paused = reduce.matches, visible = true, raf = 0, last = 0, clock = 7, lastPointer = -1e9, hovering = false;
  const light = { x: .5, y: .62, tx: .5, ty: .62, e: .55, te: .55 };
  const tilt = { x: 0, y: 0, l: 0, tx: 0, ty: 0, tl: 0 };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = (dt, speed) => 1 - Math.exp(-dt * speed);

  root.classList.add('aurora-js');
  if (!reduce.matches) {
    root.classList.add('aurora-anim');
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('hero-entered')));
  }

  const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FRAG = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;uniform float uTime;uniform vec2 uLight;uniform float uEnergy;
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<4;i++){v+=a*noise(p);p=m*p;a*=.5;}return v;}
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
// Arco de fita de vidro: um toro achatado e torcido que ondula devagar.
float ribbon(vec3 p){
  p.z+=.13*sin(p.x*1.6+uTime*.55)+.07*sin(p.y*2.4-uTime*.4);
  float ang=atan(p.y,p.x);
  vec2 q=vec2(length(p.xy)-1.28,p.z);
  q=rot(ang+uTime*.22)*q;
  vec2 d=abs(q)-vec2(.52,.03);
  return length(max(d,0.))+min(max(d.x,d.y),0.)-.04;
}
vec3 place(vec3 p){
  p.yz=rot(-.42+(uLight.y-.5)*.45)*p.yz;
  p.xz=rot(sin(uTime*.11)*.32+(uLight.x-.5)*.85)*p.xz;
  return p;
}
float map(vec3 p){return ribbon(place(p));}
vec3 normalAt(vec3 p){vec2 e=vec2(.004,-.004);return normalize(e.xyy*map(p+e.xyy)+e.yyx*map(p+e.yyx)+e.yxy*map(p+e.yxy)+e.xxx*map(p+e.xxx));}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;float aspect=uRes.x/uRes.y;
  vec2 p=(uv-.5)*vec2(aspect,1.);vec2 l=(uLight-.5)*vec2(aspect,1.);
  float t=uTime;vec2 dl=p-l;float ld=dot(dl,dl);
  // Fundo: luz difusa e discreta
  vec2 q=vec2(fbm(p*1.1+vec2(0.,t*.04)),fbm(p*1.1+vec2(5.2,-t*.035)));
  float f=fbm(p*1.0+q*1.6+vec2(t*.02,0.));
  vec3 blue=vec3(.05,.14,.9),azure=vec3(.03,.32,.95),cyan=vec3(.2,.72,1.);
  vec3 tint=mix(blue,azure,smoothstep(.3,.75,q.y));
  vec3 col=vec3(.006,.008,.03)+tint*.16*f*smoothstep(.95,.05,length(p*vec2(.7,1.)));
  col+=mix(cyan,blue,.4)*.14*exp(-ld*7.)*uEnergy;
  // Objeto 3D
  float k=3.3*max(1.,.66/aspect);
  vec3 ro=vec3(0.,0.,5.),rd=normalize(vec3(p*k/5.,-1.));
  float dist=2.4,glow=0.,hit=0.,edge=9.,px=k*1.6/uRes.y;
  for(int i=0;i<90;i++){
    float d=map(ro+rd*dist);
    glow+=exp(-max(d,0.)*9.)*.01;
    edge=min(edge,d/(px*dist*.2));
    if(d<.002){hit=1.;break;}
    dist+=d*.62;if(dist>8.)break;
  }
  col+=mix(blue,azure,.35)*glow*.55;
  col+=mix(vec3(.16,.36,1.),vec3(.25,.78,1.),.4)*.55*(1.-smoothstep(0.,1.,edge))*(1.-hit);
  if(hit>.5){
    vec3 pos=ro+rd*dist,n=normalAt(pos);
    float facing=max(dot(n,-rd),0.);
    float fres=pow(1.-facing,2.4);
    vec3 L=normalize(vec3(-.45,.85,.55));
    float diff=max(dot(n,L),0.);
    float spec=pow(max(dot(n,normalize(L-rd)),0.),56.);
    float hue=.5+.5*sin(dot(n,vec3(1.4,.8,.5))*2.2+t*.18);
    vec3 rimCol=mix(vec3(.16,.36,1.),vec3(.25,.78,1.),hue);
    vec3 body=vec3(.015,.02,.09)+vec3(.04,.09,.42)*diff*.55;
    vec3 shade=body+rimCol*fres*1.3+vec3(.78,.88,1.)*spec*.7;
    vec3 Lm=normalize(vec3(l*k,2.2)-pos);
    shade+=cyan*pow(max(dot(n,Lm),0.),8.)*.4*uEnergy;
    col=shade+mix(blue,azure,.35)*glow*.25;
  }
  col*=.25+.75*smoothstep(1.2,.2,length(p*vec2(.62,1.05)));
  gl_FragColor=vec4(pow(col,vec3(.92)),1.);
}`;
  let gl = null, uni = {}, width = 0, height = 0;
  function setupGL() {
    try {
      gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
      if (!gl) return false;
      const shader = (type, source) => {
        const s = gl.createShader(type); gl.shaderSource(s, source); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
        return s;
      };
      const program = gl.createProgram();
      gl.attachShader(program, shader(gl.VERTEX_SHADER, VERT));
      gl.attachShader(program, shader(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || 'program');
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(program, 'p');
      gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      for (const name of ['uRes', 'uTime', 'uLight', 'uEnergy']) uni[name] = gl.getUniformLocation(program, name);
      width = height = 0;
      return true;
    } catch (error) {
      console.warn('Prisma: fundo estático ativado.', error);
      gl = null; return false;
    }
  }
  function draw() {
    if (!gl) return;
    gl.uniform2f(uni.uRes, width, height);
    gl.uniform1f(uni.uTime, clock);
    gl.uniform2f(uni.uLight, light.x, light.y);
    gl.uniform1f(uni.uEnergy, light.e);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  // Fixed pixel budget keeps the 3D light fluid; it drops further if frames run slow.
  let budget = 0;
  function resize() {
    if (!gl) return;
    const r = bg.getBoundingClientRect();
    if (!budget) budget = r.width < 760 ? 260000 : 620000;
    const scale = Math.min(devicePixelRatio || 1, Math.sqrt(budget / Math.max(1, r.width * r.height)));
    const w = Math.max(1, Math.round(r.width * scale)), h = Math.max(1, Math.round(r.height * scale));
    if (w === width && h === height) return;
    width = w; height = h; canvas.width = w; canvas.height = h;
    gl.viewport(0, 0, w, h);
    draw();
  }
  let slow = 0;
  function adapt(dt) {
    slow = dt > .028 ? slow + 1 : Math.max(0, slow - 1);
    if (slow > 30 && budget > 140000) { budget *= .72; slow = 0; resize(); }
  }
  function applyTilt() {
    if (!tiltEl) return;
    tiltEl.style.setProperty('--ry', `${tilt.x.toFixed(3)}deg`);
    tiltEl.style.setProperty('--rx', `${tilt.y.toFixed(3)}deg`);
    tiltEl.style.setProperty('--lift', `${tilt.l.toFixed(2)}px`);
  }
  function frame(now) {
    raf = 0;
    const dt = last ? Math.min((now - last) / 1000, .05) : 1 / 60;
    if (last) adapt((now - last) / 1000);
    last = now; clock += dt;
    if (!finePointer.matches || now - lastPointer > 2600) {
      // Without a cursor the light keeps drifting on its own.
      light.tx = .5 + .22 * Math.sin(clock * .21);
      light.ty = .6 + .1 * Math.sin(clock * .29 + 1.3);
      light.te = .55;
    }
    const k = ease(dt, 2.6), kt = ease(dt, 6);
    light.x += (light.tx - light.x) * k;
    light.y += (light.ty - light.y) * k;
    light.e += (light.te - light.e) * ease(dt, 2);
    tilt.x += (tilt.tx - tilt.x) * kt;
    tilt.y += (tilt.ty - tilt.y) * kt;
    tilt.l += (tilt.tl - tilt.l) * kt;
    draw(); applyTilt();
    request();
  }
  function request() { if (!raf && !paused && visible && !document.hidden) raf = requestAnimationFrame(frame); }
  function stop() { cancelAnimationFrame(raf); raf = 0; last = 0; }
  // Motion follows the system "reduce motion" setting.
  function updatePaused() { hero.classList.toggle('is-paused', paused); }

  hero.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    lastPointer = performance.now();
    const r = bg.getBoundingClientRect();
    light.tx = clamp((event.clientX - r.left) / r.width, -.1, 1.1);
    light.ty = clamp(1 - (event.clientY - r.top) / r.height, -.1, 1.1);
    light.te = 1;
    if (showcase) {
      const s = showcase.getBoundingClientRect();
      tilt.tx = clamp((event.clientX - (s.left + s.width / 2)) / (s.width / 2), -1, 1) * 5;
      tilt.ty = -clamp((event.clientY - (s.top + s.height / 2)) / (s.height / 2), -1.5, 1.5) * 3;
    }
    request();
  });
  hero.addEventListener('pointerleave', () => { light.te = .55; lastPointer = -1e9; tilt.tx = tilt.ty = 0; request(); });
  showcase?.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') { hovering = true; tilt.tl = -12; request(); } });
  showcase?.addEventListener('pointerleave', () => { hovering = false; tilt.tl = 0; request(); });
  hero.querySelectorAll('.glow-button').forEach(button => button.addEventListener('pointermove', event => {
    const r = button.getBoundingClientRect();
    button.style.setProperty('--mx', `${event.clientX - r.left}px`);
    button.style.setProperty('--my', `${event.clientY - r.top}px`);
  }));
  reduce.addEventListener('change', () => { paused = reduce.matches; updatePaused(); if (paused) { stop(); tilt.x = tilt.y = tilt.l = 0; applyTilt(); } else request(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else request(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) request(); else stop(); }).observe(hero);
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); hero.classList.remove('aurora-live'); gl = null; });
  canvas.addEventListener('webglcontextrestored', () => { if (setupGL()) { hero.classList.add('aurora-live'); resize(); } });
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(bg); else addEventListener('resize', resize);

  if (setupGL()) { hero.classList.add('aurora-live'); resize(); }
  updatePaused();
  request();
})();
