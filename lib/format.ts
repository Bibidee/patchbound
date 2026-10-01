export const short=(s:string,n=5)=>s?`${s.slice(0,n+2)}…${s.slice(-n)}`:"—";
export const gen=(wei:string)=>{try{return (Number(BigInt(wei))/1e18).toLocaleString(undefined,{maximumFractionDigits:4})}catch{return "0"}};
export const when=(n:number)=>n?new Date(n*1000).toLocaleString():"—";
