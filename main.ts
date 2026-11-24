import{mkdirSync as m,readdirSync as d,readFileSync as r,writeFileSync as w}from'fs'
const T={0:'000',1:'101',2:'401',3:'010',4:'012',5:'022',6:'023',7:'033',23:'011',27:'011',48:'200',49:'210',50:'210',51:'200',52:'000',64:'011',65:'020',80:'010',81:'010',82:'001',83:'010'}
const run=(p,I)=>{
const n=p.length,D=new Int32Array(256),C=[],M=new Int32Array(256),o=[]
let s=0,i=0,c=0,k=0
const f=x=>[Buffer.from(o),x]
for(;;){
if(k==1e6)return f(10)
if(c<0||c>=n)return f(9)
const x=p[c],t=T[x]||(x>15&&x<35&&x!=31&&'021')
if(!t)return f(5)
const g=+t[0],q=+t[1]
if(c+g>=n)return f(9)
k++
const e=c+1+g
if(s<q)return f(2)
if(s-q+ +t[2]>256)return f(3)
c=e
const b=D[s-1],a=D[s-2]
if(x>15&&x<35&&q==2){
let v
switch(x){
case 16:v=a+b;break
case 17:v=a-b;break
case 18:v=Math.imul(a,b);break
case 19:if(!b)return f(4);v=a/b;break
case 20:if(!b)return f(4);v=a%b;break
case 21:if(!b)return f(4);v=(a>>>0)/(b>>>0);break
case 22:if(!b)return f(4);v=(a>>>0)%(b>>>0);break
case 24:v=a&b;break
case 25:v=a|b;break
case 26:v=a^b;break
case 28:v=a<<b;break
case 29:v=a>>b;break
case 30:v=a>>>b;break
case 32:v=+(a==b);break
case 33:v=+(a<b);break
default:v=+(a>>>0<b>>>0)}
D[--s-1]=v|0
continue}
switch(x){
case 0:return f(0)
case 1:D[s++]=p[e-1]<<24>>24;break
case 2:D[s++]=p[e-4]|p[e-3]<<8|p[e-2]<<16|p[e-1]<<24;break
case 3:s--;break
case 4:D[s++]=b;break
case 5:D[s-1]=a;D[s-2]=b;break
case 6:D[s++]=a;break
case 7:{const y=D[s-3];D[s-3]=a;D[s-2]=b;D[s-1]=y;break}
case 23:D[s-1]=-b|0;break
case 27:D[s-1]=~b;break
case 48:case 49:case 50:
if(x>48){s--;if(x==49?b:!b)break}
c=e+((p[e-2]|p[e-1]<<8)<<16>>16)
break
case 51:if(C.length==64)return f(7);C.push(e);c=p[e-2]|p[e-1]<<8;break
case 52:if(!C.length)return f(8);c=C.pop();break
case 64:if(b<0||b>255)return f(6);D[s-1]=M[b];break
case 65:if(b<0||b>255)return f(6);M[b]=a;s-=2;break
case 80:{const z=''+b;if(o.length+z.length>65536)return f(11);s--;o.push(...Buffer.from(z));break}
case 81:if(o.length>=65536)return f(11);o.push(D[--s]&255);break
case 82:D[s++]=i<I.length?I[i++]:-1;break
default:return f(b&255)}}}
for(const z of d('/input').sort()){const[o,c]=run(r(`/input/${z}/program.bin`),r(`/input/${z}/input.bin`))
m('/output/'+z,{recursive:true});w(`/output/${z}/stdout.bin`,o);w(`/output/${z}/exit.txt`,''+c)}
