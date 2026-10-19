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