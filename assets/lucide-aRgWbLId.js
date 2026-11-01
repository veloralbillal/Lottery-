/**
 * @license lucide v1.66.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};/**
 * @license lucide v1.66.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=([e,t,n])=>{const o=document.createElementNS("http://www.w3.org/2000/svg",e);return Object.keys(t).forEach(r=>{o.setAttribute(r,String(t[r]))}),n!=null&&n.length&&n.forEach(r=>{const l=m(r);o.appendChild(l)}),o},A=(e,t={})=>{const o={...p,...t};return m(["svg",o,e])};/**
 * @license lucide v1.66.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=(...e)=>e.filter((t,n,o)=>!!t&&t.trim()!==""&&o.indexOf(t)===n).join(" ").trim();/**
 * @license lucide v1.66.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=e=>{for(const t in e)if(t.startsWith("aria-")||t==="role"||t==="title")return!0;return!1};/**
 * @license lucide v1.66.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E=e=>{let t="",n=!1;for(const o of e){if(o==="-"||o==="_"||o<=" "){n=t.length>0;continue}t.length===0?t+=o.toLowerCase():t+=n?o.toUpperCase():o,n=!1}return t};/**
 * @license lucide v1.66.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=e=>{const t=E(e);return t.charAt(0).toUpperCase()+t.slice(1)};/**
 * @license lucide v1.66.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=e=>Array.from(e.attributes).reduce((t,n)=>(t[n.name]=n.value,t),{}),f=e=>typeof e=="string"?e:!e||!e.class?"":e.class&&typeof e.class=="string"?e.class.split(" "):e.class&&Array.isArray(e.class)?e.class:"",d=(e,{nameAttr:t,icons:n,attrs:o})=>{var u;const r=e.getAttribute(t);if(r==null)return;const l=v(r),s=n[l];if(!s)return;const c=k(e),h=C(c)?{}:{"aria-hidden":"true"},a={...p,"data-lucide":r,...h,...o,...c},w=f(c),g=f(o),i=b("lucide",`lucide-${r}`,...w,...g);i&&Object.assign(a,{class:i});const y=A(s,a);return(u=e.parentNode)==null?void 0:u.replaceChild(y,e)};/**
 * @license lucide v1.66.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=[["path",{d:"m12 19-7-7 7-7"}],["path",{d:"M19 12H5"}]];/**
 * @license lucide v1.66.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=({icons:e={},nameAttr:t="data-lucide",attrs:n={},root:o=document,inTemplates:r}={})=>{if(!Object.values(e).length)throw new Error(`Please provide an icons object.
If you want to use all the icons you can import it like:
 \`import { createIcons, icons } from 'lucide';
lucide.createIcons({icons});\``);if(typeof o>"u")throw new Error("`createIcons()` only works in a browser environment.");if(Array.from(o.querySelectorAll(`[${t}]`)).forEach(s=>d(s,{nameAttr:t,icons:e,attrs:n})),r&&Array.from(o.querySelectorAll("template")).forEach(c=>N({icons:e,nameAttr:t,attrs:n,root:c.content,inTemplates:r})),t==="data-lucide"){const s=o.querySelectorAll("[icon-name]");s.length>0&&Array.from(s).forEach(c=>d(c,{nameAttr:"icon-name",icons:e,attrs:n}))}};export{j as A,N as c};
