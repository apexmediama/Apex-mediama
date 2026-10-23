(function(){
var f=document.querySelector('[data-calc]');
if(f){var L=f.getAttribute('data-lang')==='es'?'es-US':'en-US',P=+f.getAttribute('data-price');
 function $(id){return document.getElementById(id);}
 function money(n){return '$'+Math.round(n).toLocaleString(L);}
 function run(){var c=+$('c-calls').value,v=+$('c-value').value,r=+$('c-rate').value;
  $('o-calls').textContent=c;$('o-value').textContent=money(v);$('o-rate').textContent=r+'/10';
  var lost=c*52/12*(r/10)*v;$('o-lost').textContent=money(lost);
  var jobs=Math.max(1,Math.ceil(P/v));$('o-jobs').textContent=jobs;}
 ['c-calls','c-value','c-rate'].forEach(function(id){$(id).addEventListener('input',run);});run();}
var hero=document.querySelector('.st-hero .cta-row'),bar=document.querySelector('.stbar');
if(hero&&bar&&'IntersectionObserver' in window){new IntersectionObserver(function(e){document.body.classList.toggle('stbar-on',!e[0].isIntersecting&&e[0].boundingClientRect.top<0);}).observe(hero);}
})();
(function(){
var f=document.querySelector('[data-demo]');if(!f)return;
var lang=f.getAttribute('data-lang'),url=f.getAttribute('data-url'),tel=f.getAttribute('data-tel'),msg=f.querySelector('.demo-msg'),btn=f.querySelector('button');
var M=lang==='es'?{wait:'Llamándolo… conteste el teléfono.',done:'Ava lo está llamando ahora. Conteste, haga de cliente y al colgar revise su email.',datos:'Escriba su nombre y el de su negocio.',email:'Ese email no parece correcto.',telefono:'Escriba un celular de EE.UU. (10 dígitos).',repetido:'Ya llamamos a este número hace poco. Llame usted a Ava: '+tel+'.',cupo:'Las demos de hoy se acabaron. Llame usted a Ava: '+tel+'.',bloqueado:'No podemos llamar a este número.',red:'No pudimos iniciar la llamada. Llame usted a Ava: '+tel+'.'}
:{wait:'Calling you… pick up the phone.',done:'Ava is calling you now. Pick up, play the customer, and check your email when you hang up.',datos:'Please enter your name and your business name.',email:"That email doesn't look right.",telefono:'Enter a US cell phone (10 digits).',repetido:'We already called this number recently. Call Ava instead: '+tel+'.',cupo:"Today's demo lines are full. Call Ava yourself: "+tel+'.',bloqueado:"We can't call this number.",red:"Couldn't start the call. Call Ava yourself: "+tel+'.'};
function show(t,err){msg.textContent=t;msg.className='demo-msg'+(err?' err':'');}
f.addEventListener('submit',function(e){e.preventDefault();var d={};new FormData(f).forEach(function(v,k){d[k]=String(v);});d.idioma=lang;
 if(!d.nombre.trim()||!d.negocio.trim())return show(M.datos,1);
 if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email))return show(M.email,1);
 var dg=d.telefono.replace(/\D/g,'');if(dg.length===11&&dg.charAt(0)==='1')dg=dg.slice(1);if(dg.length!==10)return show(M.telefono,1);
 btn.disabled=true;show(M.wait,0);
 fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)}).then(function(r){return r.json();}).then(function(r){
  if(r&&r.ok){show(M.done,0);f.classList.add('ok');window.fbq&&fbq('track','Lead',{content_name:'demo_llamada'});}
  else{show(M[r&&r.error]||M.red,1);btn.disabled=false;}
 }).catch(function(){show(M.red,1);btn.disabled=false;});
});
})();