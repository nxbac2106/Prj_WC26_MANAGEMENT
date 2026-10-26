const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const api=u=>fetch('/api/'+u).then(async r=>{const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||r.status);return d});
const ISO={'Mexico':'mx','South Africa':'za','South Korea':'kr','Korea Republic':'kr','Czechia':'cz','Czech Republic':'cz','Canada':'ca','Bosnia and Herzegovina':'ba','Qatar':'qa','Switzerland':'ch','Brazil':'br','Morocco':'ma','Haiti':'ht','Scotland':'gb-sct','USA':'us','United States':'us','Paraguay':'py','Australia':'au','Turkey':'tr','Türkiye':'tr','Germany':'de','Curaçao':'cw','Curacao':'cw','Ivory Coast':'ci',"Côte d'Ivoire":'ci','Ecuador':'ec','Netherlands':'nl','Japan':'jp','Sweden':'se','Tunisia':'tn','Belgium':'be','Egypt':'eg','Iran':'ir','IR Iran':'ir','New Zealand':'nz','Spain':'es','Cabo Verde':'cv','Saudi Arabia':'sa','Uruguay':'uy','France':'fr','Senegal':'sn','Iraq':'iq','Norway':'no','Argentina':'ar','Algeria':'dz','Austria':'at','Jordan':'jo','Portugal':'pt','Congo DR':'cd','Uzbekistan':'uz','Colombia':'co','England':'gb-eng','Croatia':'hr','Ghana':'gh','Panama':'pa'};
const flag=(n,c='w-6 h-4')=>ISO[n]?`<img class="${c} object-cover rounded-sm shadow-sm" src="https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/${ISO[n]}.svg" alt="">`:`<span class="${c} inline-flex items-center justify-center bg-slate-200 rounded-sm text-[8px] font-bold text-slate-500">${(n||'?').slice(0,3).toUpperCase()}</span>`;
// Huy chuong 🥇 dang anh (khong phu thuoc font emoji cua may): Fluent 3D -> Twemoji -> emoji
const MEDAL_URL='https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/1st%20place%20medal/3D/1st_place_medal_3d.png',
      MEDAL_ALT='https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f947.svg';
const medal=(c='w-4 h-4')=>`<img class="${c} inline-block shrink-0 object-contain" src="${MEDAL_URL}" alt="🥇" onerror="this.onerror=null;this.src='${MEDAL_ALT}'">`;
const shirt=p=>p&&p.shirt_number!=null&&p.shirt_number!==''?'#'+p.shirt_number+' ':'';
// So ao du phong (player_id:shirt_number, lay tu player_tournament_statistics.csv) - dung khi API chua tra shirt_number
const SHIRTS=Object.fromEntries('1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,10:10,11:11,12:12,13:13,14:14,15:15,16:16,17:17,18:18,19:19,20:20,21:21,22:22,23:23,24:24,25:25,26:26,27:1,28:2,29:3,30:4,31:5,32:6,33:7,34:8,35:9,36:10,37:11,38:12,39:13,40:14,41:15,42:16,43:17,44:18,45:19,46:20,47:21,48:22,49:23,50:24,51:25,52:26,53:1,54:2,55:3,56:4,57:5,58:6,59:7,60:8,61:9,62:10,63:11,64:12,65:13,66:14,67:15,68:16,69:17,70:18,71:19,72:20,73:21,74:22,75:23,76:24,77:25,78:26,79:1,80:2,81:3,82:4,83:5,84:6,85:7,86:8,87:9,88:10,89:11,90:12,91:13,92:14,93:15,94:16,95:17,96:18,97:19,98:20,99:21,100:22,101:23,102:24,103:25,104:26,105:1,106:2,107:3,108:4,109:5,110:6,111:7,112:8,113:9,114:10,115:11,116:12,117:13,118:14,119:15,120:16,121:17,122:18,123:19,124:20,125:21,126:22,127:23,128:24,129:25,130:26,131:1,132:2,133:3,134:4,135:5,136:6,137:7,138:8,139:9,140:10,141:11,142:12,143:13,144:14,145:15,146:16,147:17,148:18,149:19,150:20,151:21,152:22,153:23,154:24,155:25,156:26,157:1,158:2,159:3,160:4,161:5,162:6,163:7,164:8,165:9,166:10,167:11,168:12,169:13,170:14,171:15,172:16,173:17,174:18,175:19,176:20,177:21,178:22,179:23,180:24,181:25,182:26,183:1,184:2,185:3,186:4,187:5,188:6,189:7,190:8,191:9,192:10,193:11,194:12,195:13,196:14,197:15,198:16,199:17,200:18,201:19,202:20,203:21,204:22,205:23,206:24,207:25,208:26,209:1,210:2,211:3,212:4,213:5,214:6,215:7,216:8,217:9,218:10,219:11,220:12,221:13,222:14,223:15,224:16,225:17,226:18,227:19,228:20,229:21,230:22,231:23,232:24,233:25,234:26,235:1,236:2,237:3,238:4,239:5,240:6,241:7,242:8,243:9,244:10,245:11,246:12,247:13,248:14,249:15,250:16,251:17,252:18,253:19,254:20,255:21,256:22,257:23,258:24,259:25,260:26,261:1,262:2,263:3,264:4,265:5,266:6,267:7,268:8,269:9,270:10,271:11,272:12,273:13,274:14,275:15,276:16,277:17,278:18,279:19,280:20,281:21,282:22,283:23,284:24,285:25,286:26,287:1,288:2,289:3,290:4,291:5,292:6,293:7,294:8,295:9,296:10,297:11,298:12,299:13,300:14,301:15,302:16,303:17,304:18,305:19,306:20,307:21,308:22,309:23,310:24,311:25,312:26,313:1,314:2,315:3,316:4,317:5,318:6,319:7,320:8,321:9,322:10,323:11,324:12,325:13,326:14,327:15,328:16,329:17,330:18,331:19,332:20,333:21,334:22,335:23,336:24,337:25,338:26,339:1,340:2,341:3,342:4,343:5,344:6,345:7,346:8,347:9,348:10,349:11,350:12,351:13,352:14,353:15,354:16,355:17,356:18,357:19,358:20,359:21,360:22,361:23,362:24,363:25,364:26,365:1,366:2,367:3,368:4,369:5,370:6,371:7,372:8,373:9,374:10,375:11,376:12,377:13,378:14,379:15,380:16,381:17,382:18,383:19,384:20,385:21,386:22,387:23,388:24,389:25,390:26,391:1,392:2,393:3,394:4,395:5,396:6,397:7,398:8,399:9,400:10,401:11,402:12,403:13,404:14,405:15,406:16,407:17,408:18,409:19,410:20,411:21,412:22,413:23,414:24,415:25,416:26,417:1,418:2,419:3,420:4,421:5,422:6,423:7,424:8,425:9,426:10,427:11,428:12,429:13,430:14,431:15,432:16,433:17,434:18,435:19,436:20,437:21,438:22,439:23,440:24,441:25,442:26,443:1,444:2,445:3,446:4,447:5,448:6,449:7,450:8,451:9,452:10,453:11,454:12,455:13,456:14,457:15,458:16,459:17,460:18,461:19,462:20,463:21,464:22,465:23,466:24,467:25,468:26,469:1,470:2,471:3,472:4,473:5,474:6,475:7,476:8,477:9,478:10,479:11,480:12,481:13,482:14,483:15,484:16,485:17,486:18,487:19,488:20,489:21,490:22,491:23,492:24,493:25,494:26,495:1,496:2,497:3,498:4,499:5,500:6,501:7,502:8,503:9,504:10,505:11,506:12,507:13,508:14,509:15,510:16,511:17,512:18,513:19,514:20,515:21,516:22,517:23,518:24,519:25,520:26,521:1,522:2,523:3,524:4,525:5,526:6,527:7,528:8,529:9,530:10,531:11,532:12,533:13,534:14,535:15,536:16,537:17,538:18,539:19,540:20,541:21,542:22,543:23,544:24,545:25,546:26,547:1,548:2,549:3,550:4,551:5,552:6,553:7,554:8,555:9,556:10,557:11,558:12,559:13,560:14,561:15,562:16,563:17,564:18,565:19,566:20,567:21,568:22,569:23,570:24,571:25,572:26,573:1,574:2,575:3,576:4,577:5,578:6,579:7,580:8,581:9,582:10,583:11,584:12,585:13,586:14,587:15,588:16,589:17,590:18,591:19,592:20,593:21,594:22,595:23,596:24,597:25,598:26,599:1,600:2,601:3,602:4,603:5,604:6,605:7,606:8,607:9,608:10,609:11,610:12,611:13,612:14,613:15,614:16,615:17,616:18,617:19,618:20,619:21,620:22,621:23,622:24,623:25,624:26,625:1,626:2,627:3,628:4,629:5,630:6,631:7,632:8,633:9,634:10,635:11,636:12,637:13,638:14,639:15,640:16,641:17,642:18,643:19,644:20,645:21,646:22,647:23,648:24,649:25,650:26,651:1,652:2,653:3,654:4,655:5,656:6,657:7,658:8,659:9,660:10,661:11,662:12,663:13,664:14,665:15,666:16,667:17,668:18,669:19,670:20,671:21,672:22,673:23,674:24,675:25,676:26,677:1,678:2,679:3,680:4,681:5,682:6,683:7,684:8,685:9,686:10,687:11,688:12,689:13,690:14,691:15,692:16,693:17,694:18,695:19,696:20,697:21,698:22,699:23,700:24,701:25,702:26,703:1,704:2,705:3,706:4,707:5,708:6,709:7,710:8,711:9,712:10,713:11,714:12,715:13,716:14,717:15,718:16,719:17,720:18,721:19,722:20,723:21,724:22,725:23,726:24,727:25,728:26,729:1,730:2,731:3,732:4,733:5,734:6,735:7,736:8,737:9,738:10,739:11,740:12,741:13,742:14,743:15,744:16,745:17,746:18,747:19,748:20,749:21,750:22,751:23,752:24,753:25,754:26,755:1,756:2,757:3,758:4,759:5,760:6,761:7,762:8,763:9,764:10,765:11,766:12,767:13,768:14,769:15,770:16,771:17,772:18,773:19,774:20,775:21,776:22,777:23,778:24,779:25,780:26,781:1,782:2,783:3,784:4,785:5,786:6,787:7,788:8,789:9,790:10,791:11,792:12,793:13,794:14,795:15,796:16,797:17,798:18,799:19,800:20,801:21,802:22,803:23,804:24,805:25,806:26,807:1,808:2,809:3,810:4,811:5,812:6,813:7,814:8,815:9,816:10,817:11,818:12,819:13,820:14,821:15,822:16,823:17,824:18,825:19,826:20,827:21,828:22,829:23,830:24,831:25,832:26,833:1,834:2,835:3,836:4,837:5,838:6,839:7,840:8,841:9,842:10,843:11,844:12,845:13,846:14,847:15,848:16,849:17,850:18,851:19,852:20,853:21,854:22,855:23,856:24,857:25,858:26,859:1,860:2,861:3,862:4,863:5,864:6,865:7,866:8,867:9,868:10,869:11,870:12,871:13,872:14,873:15,874:16,875:17,876:18,877:19,878:20,879:21,880:22,881:23,882:24,883:25,884:26,885:1,886:2,887:3,888:4,889:5,890:6,891:7,892:8,893:9,894:10,895:11,896:12,897:13,898:14,899:15,900:16,901:17,902:18,903:19,904:20,905:21,906:22,907:23,908:24,909:25,910:26,911:1,912:2,913:3,914:4,915:5,916:6,917:7,918:8,919:9,920:10,921:11,922:12,923:13,924:14,925:15,926:16,927:17,928:18,929:19,930:20,931:21,932:22,933:23,934:24,935:25,936:26,937:1,938:2,939:3,940:4,941:5,942:6,943:7,944:8,945:9,946:10,947:11,948:12,949:13,950:14,951:15,952:16,953:17,954:18,955:19,956:20,957:21,958:22,959:23,960:24,961:25,962:26,963:1,964:2,965:3,966:4,967:5,968:6,969:7,970:8,971:9,972:10,973:11,974:12,975:13,976:14,977:15,978:16,979:17,980:18,981:19,982:20,983:21,984:22,985:23,986:24,987:25,988:26,989:1,990:2,991:3,992:4,993:5,994:6,995:7,996:8,997:9,998:10,999:11,1000:12,1001:13,1002:14,1003:15,1004:16,1005:17,1006:18,1007:19,1008:20,1009:21,1010:22,1011:23,1012:24,1013:25,1014:26,1015:1,1016:2,1017:3,1018:4,1019:5,1020:6,1021:7,1022:8,1023:9,1024:10,1025:11,1026:12,1027:13,1028:14,1029:15,1030:16,1031:17,1032:18,1033:19,1034:20,1035:21,1036:22,1037:23,1038:24,1039:25,1040:26,1041:1,1042:2,1043:3,1044:4,1045:5,1046:6,1047:7,1048:8,1049:9,1050:10,1051:11,1052:12,1053:13,1054:14,1055:15,1056:16,1057:17,1058:18,1059:19,1060:20,1061:21,1062:22,1063:23,1064:24,1065:25,1066:26,1067:1,1068:2,1069:3,1070:4,1071:5,1072:6,1073:7,1074:8,1075:9,1076:10,1077:11,1078:12,1079:13,1080:14,1081:15,1082:16,1083:17,1084:18,1085:19,1086:20,1087:21,1088:22,1089:23,1090:24,1091:25,1092:26,1093:1,1094:2,1095:3,1096:4,1097:5,1098:6,1099:7,1100:8,1101:9,1102:10,1103:11,1104:12,1105:13,1106:14,1107:15,1108:16,1109:17,1110:18,1111:19,1112:20,1113:21,1114:22,1115:23,1116:24,1117:25,1118:26,1119:1,1120:2,1121:3,1122:4,1123:5,1124:6,1125:7,1126:8,1127:9,1128:10,1129:11,1130:12,1131:13,1132:14,1133:15,1134:16,1135:17,1136:18,1137:19,1138:20,1139:21,1140:22,1141:23,1142:24,1143:25,1144:26,1145:1,1146:2,1147:3,1148:4,1149:5,1150:6,1151:7,1152:8,1153:9,1154:10,1155:11,1156:12,1157:13,1158:14,1159:15,1160:16,1161:17,1162:18,1163:19,1164:20,1165:21,1166:22,1167:23,1168:24,1169:25,1170:26,1171:1,1172:2,1173:3,1174:4,1175:5,1176:6,1177:7,1178:8,1179:9,1180:10,1181:11,1182:12,1183:13,1184:14,1185:15,1186:16,1187:17,1188:18,1189:19,1190:20,1191:21,1192:22,1193:23,1194:24,1195:25,1196:26,1197:1,1198:2,1199:3,1200:4,1201:5,1202:6,1203:7,1204:8,1205:9,1206:10,1207:11,1208:12,1209:13,1210:14,1211:15,1212:16,1213:17,1214:18,1215:19,1216:20,1217:21,1218:22,1219:23,1220:24,1221:25,1222:26,1223:1,1224:2,1225:3,1226:4,1227:5,1228:6,1229:7,1230:8,1231:9,1232:10,1233:11,1234:12,1235:13,1236:14,1237:15,1238:16,1239:17,1240:18,1241:19,1242:20,1243:21,1244:22,1245:23,1246:24,1247:25,1248:26'.split(',').map(x=>x.split(':').map(Number)));
const PCOL={GK:'bg-amber-600',DEF:'bg-emerald-700',MID:'bg-indigo-700',FWD:'bg-red-600'},
      GNAME={GK:'Goalkeepers',DEF:'Defenders',MID:'Midfielders',FWD:'Forwards'};
// Chuan hoa ten (du lieu hay bi lap / dinh chu: "Matheus Matheus Cunha", "GUIMARAESBruno Bruno")
const cleanName=n=>{
  let t=String(n||'').replace(/([A-Z]{2,})([A-Z][a-z])/g,'$1 $2').split(/\s+/).filter(Boolean);
  const o=t;t=o.filter((w,i)=>i===0||w.toLowerCase()!==o[i-1].toLowerCase());
  if(t.length>1&&t[0].length>2&&t[0]===t[0].toUpperCase()&&t.slice(1).every(w=>w!==w.toUpperCase()))t=[...t.slice(1),t[0][0]+t[0].slice(1).toLowerCase()];
  return t.join(' ')};
const shortName=n=>{const t=cleanName(n).split(' ');return t.length>1?t[0]+' '+t[t.length-1][0]+'.':t[0]};
const iso=v=>typeof v==='string'?v.slice(0,10):new Date(v).toISOString().slice(0,10);
const fmtD=v=>new Date(iso(v)+'T00:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'short',timeZone:'UTC'});
const fmtT=v=>{if(v==null)return '';const t=String(v);return t.includes('T')?t.slice(11,16):t.slice(0,5)};
const pos=p=>/^g/i.test(p)?'GK':/^d/i.test(p)?'DEF':/^m/i.test(p)?'MID':'FWD';
const nz=v=>v??'-';
const empty=t=>`<p class="text-xs text-slate-400">${t}</p>`;
const CARD='bg-white rounded-xl border border-slate-200 shadow-sm';
const state={view:'matches',stage:null,group:null,teams:[],teamId:null};


let lastMatchesHash = '';
async function loadMatches(){ guard(async()=>{
  const {matches,updatedAt}=await api('matches');
  $('#matches-last-updated').textContent='Last updated: '+new Date(updatedAt).toLocaleTimeString();
  const hash=JSON.stringify(matches);
  if(hash===lastMatchesHash) return;        // dữ liệu không đổi thì không vẽ lại
  lastMatchesHash=hash;
  const td=new Date().toLocaleDateString('sv');
  list($('#matches-today-list'),matches.filter(m=>iso(m.datee)===td));
  list($('#matches-past-list'),matches.filter(m=>iso(m.datee)<td));
  list($('#matches-upcoming-list'),matches.filter(m=>iso(m.datee)>td));
})}

const stageLabel=m=>m.stage_name==='Group Stage'&&m.groupp?'Group '+m.groupp:(m.stage_name||'');
function matchCard(m){const lb=stageLabel(m);return `<div class="match-card clickable ${CARD} px-8 py-5 grid grid-cols-[1fr_auto_1fr] items-center gap-4" data-id="${m.match_id}">
 <div class="team-link group clickable justify-self-start flex items-center gap-4" data-team="${m.home_team_name}">${flag(m.home_team_name,'w-9 h-6')}<div><p class="text-base font-bold text-brand-navy group-hover:underline">${m.home_team_name}</p><p class="text-xs text-slate-400">${lb}</p></div></div>
 <div class="text-center"><p class="text-xs text-slate-400">${fmtD(m.datee)}</p><p class="text-3xl font-extrabold text-brand-navy tracking-wide">${nz(m.home_score)} – ${nz(m.away_score)}</p><span class="inline-block mt-1 text-[11px] px-2.5 py-1 rounded-md bg-slate-200 text-slate-500 font-semibold">${m.statuss||''}</span></div>
 <div class="team-link group clickable justify-self-end flex items-center gap-4 justify-end text-right" data-team="${m.away_team_name}"><div><p class="text-base font-bold text-brand-navy group-hover:underline">${m.away_team_name}</p><p class="text-xs text-slate-400">${lb}</p></div>${flag(m.away_team_name,'w-9 h-6')}</div></div>`}
const list=(el,a)=>{el.innerHTML=a.length?a.map(matchCard).join(''):empty('There are no matches yet.')};

// ---------- Knockout card (theo mau: Match N, san, ngay, ti so, FT/PEN) ----------
const isFinished=m=>/complet|finish|full/i.test(m.statuss||'')||!!m.result_type;
const isShootout=m=>String(m.result_type||'').toUpperCase()==='PEN'||
  (isFinished(m)&&m.home_score!=null&&m.away_score!=null&&Number(m.home_score)===Number(m.away_score));
const resBadge=m=>{
  const r=String(m.result_type||'').trim().toUpperCase(),
        b=t=>`<span class="px-2 py-0.5 rounded-md bg-slate-200 text-slate-500 text-[11px] font-semibold">${t}</span>`;
  if(isShootout(m))return b('PEN')+'<span class="text-[11px] font-medium text-slate-400">Pens</span>';
  if(!r)return b(m.statuss||'');
  return b(r);
};
function knockoutCard(m,n,w){
  const ck='<span title="Winner" class="shrink-0 w-5 h-5 rounded-full bg-emerald-500 text-white text-xs font-bold leading-none inline-flex items-center justify-center">✓</span>';
  const team=(name,right)=>`<div class="team-link group clickable flex items-center gap-2.5 min-w-0 ${right?'justify-self-end justify-end text-right':'justify-self-start'} ${w===name?'team-win':w?'team-lose':''}" data-team="${name}">${right?'':flag(name,'w-7 h-[21px]')}${right&&w===name?ck:''}<span class="text-[13px] ${w===name?'font-extrabold':'font-semibold'} text-brand-navy group-hover:underline">${name}</span>${!right&&w===name?ck:''}${right?flag(name,'w-7 h-[21px]'):''}</div>`;
  return `<div class="match-card clickable ${CARD} rounded-2xl px-[18px] pt-3.5 pb-4" data-id="${m.match_id}">
 <div class="flex items-center justify-between text-[11px] font-medium text-slate-400"><span>Match ${n}</span><span>${m.stadium_name||''}</span></div>
 <div class="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
  ${team(m.home_team_name,false)}
  <div class="flex flex-col items-center">
   <p class="text-base font-bold text-brand-navy leading-6">${fmtD(m.datee)}</p>
   <p class="inline-flex items-center gap-2.5 text-2xl font-extrabold text-brand-navy leading-8 tabular-nums slashed-zero"><span>${nz(m.home_score)}</span><span>–</span><span>${nz(m.away_score)}</span></p>
   <div class="mt-1.5 flex items-center gap-1.5">${resBadge(m)}</div>
   ${w&&isShootout(m)?`<p class="mt-1 text-[11px] font-semibold text-emerald-600">${w} win on pens</p>`:''}
  </div>
  ${team(m.away_team_name,true)}
 </div></div>`}




// ---------- Navigation ----------
function show(v){state.view=v;
  $$('.view-section').forEach(s=>s.classList.add('hidden'));$('#view-'+v).classList.remove('hidden');
  $$('.nav-btn').forEach(b=>{const on=b.dataset.view===(v==='player-detail'?'players':v);b.classList.toggle('active',on);b.classList.toggle('text-slate-600',!on)});
  $('#topbar-title').textContent={matches:'Match Results',tournament:'Tournament',teams:'Team Stats',players:'Player Stats','player-detail':'Player Stats'}[v];
  ({matches:loadMatches,tournament:loadTournament,teams:loadTeams,players:loadPlayers}[v==='player-detail'?'players':v])?.();
}
$$('.nav-btn').forEach(b=>b.onclick=()=>go(PATH[b.dataset.view]));
document.addEventListener('click',e=>{const t=e.target.closest('.team-link');if(t)return openTeamByName(t.dataset.team);const c=e.target.closest('.match-card');if(c)openMatch(c.dataset.id)});
async function openTeamByName(name){guard(async()=>{
  if(!state.teams.length)state.teams=await api('teams');
  const t=state.teams.find(x=>x.team_name===name);if(!t)throw new Error('Không tìm thấy đội '+name);
  go('/teamstats/'+t.team_id)})}
$('#btn-close-modal').onclick=()=>$('#match-modal').classList.add('hidden');
$('#match-modal').onclick=e=>{if(e.target.id==='match-modal')e.target.classList.add('hidden')};
$('#btn-back-leaderboard').onclick=()=>go('/playerstats');
$('#btn-refresh-matches').onclick=loadMatches;
$('#topbar-date').textContent=new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
const guard=async(fn)=>{try{await fn()}catch(e){alert('Không tải được dữ liệu: '+e.message)}};

// ---------- Match Results ----------
async function loadMatches(){guard(async()=>{
  const {matches,updatedAt}=await api('matches'),td=new Date().toLocaleDateString('sv');
  $('#matches-last-updated').textContent='Last updated: '+new Date(updatedAt).toLocaleTimeString();
  list($('#matches-today-list'),matches.filter(m=>iso(m.datee)===td));
  list($('#matches-past-list'),matches.filter(m=>iso(m.datee)<td));
  list($('#matches-upcoming-list'),matches.filter(m=>iso(m.datee)>td));
})}
setInterval(()=>{if(state.view==='matches')loadMatches()},60000*60);

async function openMatch(id){guard(async()=>{
  const {match:m,events,stats}=await api('matches/'+id);
  $('#modal-match-stage').textContent=`${m.stage_name} · ${fmtD(m.datee)} ${fmtT(m.kickoff_time_utc)} UTC`;
  const st=n=>stats.find(s=>s.team_name===n)||{};const h=st(m.home_team_name),a=st(m.away_team_name);
  const bar=(l,x,y)=>{const t=(x||0)+(y||0)||1;return `<div><div class="flex justify-between text-xs font-semibold"><span>${nz(x)}</span><span class="text-slate-400">${l}</span><span>${nz(y)}</span></div><div class="relative h-1.5 rounded bg-slate-100 overflow-hidden mt-1"><i class="absolute left-0 inset-y-0 bg-brand-navy" data-w="${100*(x||0)/t}" style="width:0"></i><i class="absolute right-0 inset-y-0 bg-sky-300" data-w="${100*(y||0)/t}" style="width:0"></i></div></div>`};
  const icon=t=>/yellow/i.test(t)?'🟨':/red/i.test(t)?'🟥':/goal/i.test(t)?'⚽':/sub/i.test(t)?'🔁':'•';
  $('#modal-match-body').innerHTML=`<div class="grid grid-cols-3 items-center text-center"><div>${flag(m.home_team_name,'w-12 h-8 mx-auto')}<p class="font-bold mt-1">${m.home_team_name}</p></div>
   <div><p class="text-4xl font-extrabold text-brand-navy">${nz(m.home_score)} – ${nz(m.away_score)}</p><p class="text-[11px] text-slate-400">${m.statuss||''} ${m.result_type||''}</p></div>
   <div>${flag(m.away_team_name,'w-12 h-8 mx-auto')}<p class="font-bold mt-1">${m.away_team_name}</p></div></div>
   <p class="text-[11px] text-slate-400 text-center">${m.stadium_name}, ${m.city} · Referee: ${nz(m.referee_name)} · POM: ${nz(m.player_of_the_match_name)}</p>
   <div class="space-y-3">${bar('Possession %',h.possession_pct,a.possession_pct)}${bar('Shots',h.total_shots,a.total_shots)}${bar('On target',h.shots_on_target,a.shots_on_target)}${bar('Corners',h.corners,a.corners)}${bar('Fouls',h.fouls,a.fouls)}${bar('Offsides',h.offsides,a.offsides)}${bar('Saves',h.saves,a.saves)}${bar('xG',m.home_xg,m.away_xg)}</div>
   <div><h4 class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">EVENTS</h4><div class="space-y-1 text-xs">${events.map(e=>`<div class="flex gap-2"><span class="w-8 text-slate-400">${e.minutee}'</span><span>${icon(e.event_type)}</span><span class="font-semibold">${e.player_name}</span><span class="text-slate-400">${e.team_name} · ${e.event_type}</span></div>`).join('')||empty('Không có sự kiện.')}</div></div>`;
  $('#match-modal').classList.remove('hidden');
})}

// ---------- Tournament ----------
async function loadTournament(){guard(async()=>{
  const stages=await api('stages');state.stage=state.stage||stages[0];
  const groups=await api('groups');state.group=state.group||groups[0];
  $('#tournament-sync-time').textContent='Last synced: '+new Date().toLocaleTimeString();
  $('#view-tournament .bg-blue-50').textContent=groups.length+' Groups';
  const pill=(on)=>on?'stage-pill active':'stage-pill bg-white border border-slate-200 text-slate-700 hover:bg-slate-50';
  $('#tournament-stage-tabs').innerHTML=stages.map(s=>`<button data-s="${s}" class="${pill(s===state.stage)} px-4 py-1.5 rounded-lg text-xs font-bold transition">${s==='Group Stage'?'Groups':s}</button>`).join('');
  $$('#tournament-stage-tabs button').forEach(b=>b.onclick=()=>{state.stage=b.dataset.s;loadTournament()});
  const isG=state.stage==='Group Stage';
  $('#tournament-group-tabs').style.display=isG?'flex':'none';
  $('#standings-card-wrapper').style.display=isG?'':'none';
  $('#tournament-matches-wrapper').className=isG?'lg:col-span-6 space-y-3':'lg:col-span-12 space-y-3';
  $('#tournament-matches-list').className=isG?'space-y-3':'grid grid-cols-1 lg:grid-cols-2 gap-4';
  $('#tournament-matches-title').parentElement.style.display=isG?'':'none';
  if(isG){
   $('#tournament-group-tabs').innerHTML=groups.map(g=>`<button data-g="${g}" class="px-4 py-1.5 rounded-lg text-xs font-bold ${g===state.group?'stage-pill active':'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}">Group ${g}</button>`).join('');
   $$('#tournament-group-tabs button').forEach(b=>b.onclick=()=>{state.group=b.dataset.g;loadTournament()});
   const d=await api('standings/'+encodeURIComponent(state.group));
   $('#standings-group-title').textContent=`Group ${state.group} — Standings`;
   $('#standings-tbody').innerHTML=d.standings.map((s,i)=>`<tr><td class="py-3 px-2"><span class="inline-flex w-6 h-6 rounded-full items-center justify-center text-[11px] ${i<2?'bg-emerald-100 text-emerald-700':i===3?'bg-red-50 text-red-600':'bg-slate-100 text-slate-500'}">${i+1}</span></td>
    <td class="py-3 px-2"><span class="inline-flex items-center gap-2"><span class="team-link group clickable inline-flex items-center gap-2" data-team="${s.team_name}">${flag(s.team_name)}<span class="group-hover:underline">${s.team_name}</span></span>${i<2?'<span class="text-[9px] px-1.5 rounded bg-emerald-50 text-emerald-600">ADV</span>':''}</span></td>
    <td class="text-center">${s.played}</td><td class="text-center">${s.wins}</td><td class="text-center">${s.draws}</td><td class="text-center">${s.loses}</td>
    <td class="text-center ${s.goal_difference<0?'text-red-500':'text-emerald-600'}">${s.goal_difference>0?'+':''}${s.goal_difference}</td><td class="text-center font-extrabold">${s.point}</td></tr>`).join('');
   $('#tournament-matches-title').textContent=`Group ${state.group} — Matches`;list($('#tournament-matches-list'),d.matches);
  } else {
   const ms=await api('stage?name='+encodeURIComponent(state.stage));
   $('#tournament-matches-title').textContent=state.stage+' — Matches';
   // Tran hoa phai da luan luu: doi thang = doi xuat hien o vong ke tiep
   let nextTeams=null;
   if(ms.some(isShootout)){
     const isThird=n=>/third/i.test(n||''),i=stages.indexOf(state.stage);
     let nxt=stages[i+1]; if(isThird(nxt))nxt=stages[i+2];
     if(nxt&&!isThird(state.stage)){
       try{nextTeams=new Set((await api('stage?name='+encodeURIComponent(nxt))).flatMap(x=>[x.home_team_name,x.away_team_name]).filter(Boolean))}catch(e){}
     }
   }
   // Doi thang: hon diem -> thang; hoa (luan luu) -> doi xuat hien o vong ke tiep
   const winnerOf=m=>{
     if(!isFinished(m)||m.home_score==null||m.away_score==null)return null;
     const h=Number(m.home_score),a=Number(m.away_score);
     if(h!==a)return h>a?m.home_team_name:m.away_team_name;
     if(!nextTeams)return null;
     return nextTeams.has(m.home_team_name)?m.home_team_name:nextTeams.has(m.away_team_name)?m.away_team_name:null;
   };
   // Thu tu tran: ngay -> gio da -> match_id; danh so Match 1..N trong tung vong
   const key=m=>iso(m.datee)+' '+fmtT(m.kickoff_time_utc)+' '+String(m.match_id).padStart(6,'0');
   const sorted=[...ms].sort((a,b)=>key(a).localeCompare(key(b)));
   $('#tournament-matches-list').innerHTML=sorted.length?sorted.map((m,i)=>knockoutCard(m,i+1,winnerOf(m))).reverse().join(''):empty('There are no matches yet.');
  }
})}

// ---------- Team Stats ----------
async function loadTeams(){guard(async()=>{
  if(!state.teams.length)state.teams=await api('teams');
  $('#teams-count-badge').textContent=state.teams.length+' teams';
  state.teamId=state.teamId||(state.teams.find(t=>t.team_name==='Brazil')||state.teams[0]).team_id;
  drawPicks($('#team-search-input').value.trim());
  await loadTeam(state.teamId);
})}
function drawPicks(q){const fav=['Brazil','France','Argentina','Spain','England'];
  let l=q?state.teams.filter(t=>t.team_name.toLowerCase().includes(q.toLowerCase())).slice(0,8):fav.map(n=>state.teams.find(t=>t.team_name===n)).filter(Boolean);
  $('#team-quick-picks').innerHTML=l.map(t=>`<button data-id="${t.team_id}" class="pick inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${t.team_id===state.teamId?'bg-brand-navy text-white border-brand-navy':'bg-white border-slate-200 text-slate-700'}">${flag(t.team_name,'w-5 h-3')}${t.team_name}</button>`).join('')+(q?'':`<span class="text-[11px] text-slate-400 ml-1">+ ${state.teams.length-l.length} more</span>`);
  $$('.pick').forEach(b=>b.onclick=()=>{state.teamId=+b.dataset.id;history.pushState(null,'','/teamstats/'+state.teamId);drawPicks(q);loadTeam(state.teamId)})}
$('#team-search-input').oninput=e=>drawPicks(e.target.value.trim());

async function loadTeam(id){guard(async()=>{
  const d=await api('teams/'+id),i=d.info,s=d.stats,res=r=>{const home=r.home_team_name===i.team_name,gf=home?r.home_score:r.away_score,ga=home?r.away_score:r.home_score;return gf>ga?'W':gf<ga?'L':'D'};
  // Recent form: tat ca tran da dau cua doi (lay tu api matches), moi nhat o tren
  const {matches:allM}=await api('matches'),tk=r=>iso(r.datee)+' '+fmtT(r.kickoff_time_utc);
  const played=allM.filter(r=>(r.home_team_name===i.team_name||r.away_team_name===i.team_name)&&isFinished(r)&&r.home_score!=null&&r.away_score!=null).sort((a,b)=>tk(b).localeCompare(tk(a)));
  const F=played.length?played:d.form;
  $('#team-hero-banner').innerHTML=`<div class="flex items-center gap-5">${flag(i.team_name,'w-24 h-[74px] border-[6px] border-white rounded-2xl')}<div><p class="text-[11px] tracking-wider text-blue-200">GROUP ${i.groupp} · ${i.confederation}</p><h2 class="text-4xl font-extrabold">${i.team_name}</h2><p class="text-xs text-blue-200">FIFA ranking ${nz(i.fifa_ranking_per_tournament)} · Elo ${nz(i.elo_rating)} · ${i.fifa_code_name}</p></div></div><div class="text-sm text-right">Coach: <b>${nz(i.coach_name)}</b></div>`;
  const gd=s.goal_difference;
  const wr=s.total_games_played?Math.round(100*s.wins/s.total_games_played):0;
  $('#team-kpi-grid').innerHTML=[
    ['PLAYED',s.total_games_played,'text-brand-navy'],
    ['WON',s.wins,'text-emerald-700',wr+'% win rate'],
    ['DRAWN',s.draws,'text-slate-600'],
    ['LOST',s.loses,'text-red-600'],
    ['GOAL DIFF',gd>0?'+'+gd:gd,gd>0?'text-emerald-700':gd<0?'text-red-600':'text-slate-600'],
    ['POINTS',s.point_in_group_stage,'text-brand-navy']
  ].map(([l,v,c,sub])=>`<div class="${CARD} p-4"><p class="text-[10px] font-bold tracking-wider text-slate-400">${l}</p><p class="text-3xl font-extrabold ${c}">${nz(v)}</p>${sub?`<p class="text-xs text-slate-400 mt-0.5">${sub}</p>`:''}</div>`).join('');
  const col={W:'bg-emerald-600',D:'bg-slate-500',L:'bg-red-600'};
  $('#team-form-badges').classList.add('flex-wrap');
  $('#team-form-badges').innerHTML=[...F].reverse().map(r=>`<span class="w-9 h-9 rounded-lg ${col[res(r)]} text-white font-bold text-sm inline-flex items-center justify-center">${res(r)}</span>`).join('')||empty('No matches');
  $('#team-form-details').innerHTML=F.map(r=>{
    const k=res(r),opp=r.home_team_name===i.team_name?r.away_team_name:r.home_team_name,
          w=k==='W'?i.team_name:k==='L'?opp:null,                       // hoa -> chua co doi thang
          t=n=>n===w?`<b class="text-brand-navy">${n}</b>`:n;
    return `<div class="flex items-center gap-2"><span class="w-5 h-5 shrink-0 rounded ${col[k]} text-white text-[10px] font-bold inline-flex items-center justify-center">${k}</span><span>${fmtD(r.datee)} · ${t(r.home_team_name)} ${nz(r.home_score)}–${nz(r.away_score)} ${t(r.away_team_name)}</span></div>`}).join('');
  const pb=(l,v,max,suf='',bg='bg-brand-navy',tx='text-brand-navy')=>`<div><div class="flex justify-between text-xs"><span>${l}</span><b class="${tx}">${nz(v)}${suf}</b></div><div class="h-1.5 bg-slate-100 rounded mt-1"><i class="block h-full rounded ${bg}" data-w="${Math.min(100,100*(v||0)/max)}" style="width:0"></i></div></div>`;
  $('#team-performance-bars').innerHTML=pb('Possession',s.avg_possession,100,'%','bg-brand-navy','text-brand-navy')+pb('Shots on target',s.total_shots?Math.round(100*s.shot_on_target/s.total_shots):0,100,'%','bg-emerald-600','text-emerald-700')+pb('Avg rating',d.rating,10,'','bg-amber-500','text-amber-600');
  const sq=d.squad.map(p=>({...p,shirt_number:p.shirt_number??SHIRTS[p.player_id]})),rated=sq.filter(p=>p.avg_rating!=null).sort((a,b)=>b.avg_rating-a.avg_rating)[0];
  const trb=$('#team-top-rated-banner');
  trb.className='bg-gradient-to-r from-amber-100/70 via-white to-white border border-amber-500/70 rounded-2xl px-5 py-3.5 flex items-center justify-between gap-4';
  const drawTop=(g,a)=>{const st=(l,v,c)=>`<div class="text-center"><p class="text-2xl font-extrabold leading-8 tabular-nums slashed-zero ${c}">${v}</p><p class="text-[11px] font-semibold tracking-wider text-slate-500">${l}</p></div>`;
    trb.innerHTML=`<div class="flex items-center gap-3 min-w-0">${medal('w-10 h-10')}<div class="min-w-0"><p class="text-[11px] font-bold tracking-wider text-slate-500">TEAM TOP RATED</p><p class="text-lg font-extrabold text-brand-navy">${shirt(rated)}${cleanName(rated.player_name)} <span class="text-slate-400 text-xs font-medium">${pos(rated.position)}</span></p></div></div>
    <div class="flex items-center gap-6 shrink-0">${st('GOALS',nz(g),'text-red-600')}${st('ASSISTS',nz(a),'text-brand-navy')}${st('RATING',isNaN(rated.avg_rating)?nz(rated.avg_rating):Number(rated.avg_rating).toFixed(1),'text-emerald-700')}</div>`};
  if(rated){
    drawTop(rated.goals,rated.assists);
    // squad rows may not carry goals/assists -> fetch the player's detail once
    if(rated.goals==null||rated.assists==null)api('players/'+rated.player_id).then(pd=>{if(String(state.teamId)===String(id))drawTop(pd.goals,pd.assists)}).catch(()=>{});
  }else trb.innerHTML='';
  // ---------- Squad: Starting XI + danh sach theo vi tri ----------
  $('#team-squad-title').innerHTML=`Squad <span class="text-sm font-medium text-slate-400">· ${sq.length} players</span>`;
  const cnt={GK:0,DEF:0,MID:0,FWD:0};sq.forEach(p=>cnt[pos(p.position)]++);
  $('#team-position-counts').innerHTML=Object.entries(cnt).map(([k,v])=>`<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-brand-navy"><i class="w-1.5 h-1.5 rounded-full ${PCOL[k]}"></i>${k} ${v}</span>`).join('');
  // doi hinh xuat phat: 1 GK + 10 cau thu (nhieu tran da chinh / phut nhat), gioi han so nguoi moi tuyen
  const rank=(a,b)=>(b.matches_started||0)-(a.matches_started||0)||(b.minutes_played||0)-(a.minutes_played||0);
  const gk1=sq.filter(x=>pos(x.position)==='GK').sort(rank)[0],lim={DEF:5,MID:5,FWD:3},used={DEF:0,MID:0,FWD:0},xi=[];
  sq.filter(x=>pos(x.position)!=='GK').sort(rank).forEach(x=>{const k=pos(x.position);if(xi.length<10&&used[k]<lim[k]){used[k]++;xi.push(x)}});
  const starters=new Set([gk1,...xi].filter(Boolean).map(x=>x.player_id));
  const fm=$('#team-formation');if(fm)fm.textContent=`${used.DEF}-${used.MID}-${used.FWD}`;   // index.html cu chua co id nay
  if(sq.length&&sq.every(x=>x.shirt_number==null))console.warn('[Squad] API teams/'+id+' chua tra shirt_number -> vong tron dang hien chu viet tat. Hay them cot shirt_number vao query squad o server.');
  const num=p=>p.shirt_number!=null?p.shirt_number:cleanName(p.player_name).split(' ').pop().slice(0,3).toUpperCase();
  const row=l=>l.length?`<div class="flex justify-around">${l.map(p=>`<div class="clickable text-center w-[84px]" onclick="openPlayer(${p.player_id})"><div class="w-10 h-10 mx-auto rounded-full ${PCOL[pos(p.position)]} border-2 border-white text-white text-sm font-extrabold flex items-center justify-center shadow">${num(p)}</div><p class="text-[11px] font-bold leading-tight mt-1 text-white drop-shadow">${shortName(p.player_name)}</p></div>`).join('')}</div>`:'';
  $('#team-pitch-lineup').innerHTML=['FWD','MID','DEF'].map(k=>row(xi.filter(x=>pos(x.position)===k))).join('')+row(gk1?[gk1]:[]);
  // danh sach theo vi tri
  const cell=(v,l,c)=>`<div class="text-center px-2"><p class="text-sm font-extrabold leading-4 tabular-nums slashed-zero ${c}">${v}</p><p class="text-[9px] font-semibold tracking-wide text-slate-400">${l}</p></div>`;
  const nv=v=>v==null?'–':v,age=p=>p.birth?Math.floor((Date.now()-new Date(p.birth))/31557600000):null;
  const card=p=>{const k=pos(p.position),a=age(p),r=Number(p.avg_rating||0).toFixed(1);
    return `<div class="clickable ${CARD} rounded-xl px-3 py-2.5 flex items-center gap-3" onclick="openPlayer(${p.player_id})">
      <div class="w-11 h-11 shrink-0 rounded-full ${PCOL[k]} text-white text-base font-extrabold flex items-center justify-center">${num(p)}</div>
      <div class="min-w-0 flex-1"><p class="text-[13px] font-bold text-brand-navy truncate" title="${cleanName(p.player_name)}">${cleanName(p.player_name)}${starters.has(p.player_id)?' <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-600 align-middle" title="Starting XI"></span>':''}</p>${a?`<p class="text-[11px] text-slate-400">${a} yrs</p>`:''}</div>
      <div class="flex items-center divide-x divide-slate-100 shrink-0">${k==='GK'?cell('—','GK','text-amber-600'):cell(nv(p.goals),'G','text-red-600')+cell(nv(p.assists),'A','text-brand-navy')}${cell(r,'RTG','text-emerald-700')}</div></div>`};
  const gsort=(a,b)=>(starters.has(b.player_id)-starters.has(a.player_id))||rank(a,b);
  let grp=$('#team-squad-groups');     // index.html cu chua co khung nay -> tu tao ngay duoi san bong
  if(!grp){grp=document.createElement('div');grp.id='team-squad-groups';grp.className='space-y-5 pt-3';
    const host=$('#team-pitch-lineup').closest('.pitch-container')||$('#team-pitch-lineup').parentNode;host.parentNode.insertBefore(grp,host.nextSibling)}
  grp.innerHTML=['GK','DEF','MID','FWD'].map(k=>{const g=sq.filter(x=>pos(x.position)===k).sort(gsort);
    return g.length?`<div><div class="flex items-center gap-2 mb-2"><span class="w-1 h-4 rounded ${PCOL[k]}"></span><h4 class="text-xs font-bold text-brand-navy">${GNAME[k]}</h4><span class="text-[11px] text-slate-400">· ${g.length}</span></div><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5">${g.map(card).join('')}</div></div>`:''}).join('');
})}

// ---------- Players ----------
let ptm;$('#player-search-input').oninput=()=>{clearTimeout(ptm);ptm=setTimeout(loadPlayers,250)};
async function loadPlayers(){guard(async()=>{
  const d=await api('players?q='+encodeURIComponent($('#player-search-input').value)),p=d.players;
  $('#players-subtitle').textContent=`Golden Boot leaderboard · Top ${p.length} of ${d.total} players`;
  $('#players-tbody').innerHTML=p.map((x,i)=>`<tr class="clickable hover:bg-slate-50" onclick="openPlayer(${x.player_id})"><td class="py-3 px-4 text-slate-400 font-bold">${i<3?['🥇','🥈','🥉'][i]:i+1}</td>
   <td class="py-3 px-4"><span class="inline-flex items-center gap-2.5">${flag(x.team_name,'w-8 h-5')}<span><b class="text-sm text-brand-navy">${x.player_name}</b> <span class="text-[10px] px-1.5 rounded bg-red-50 text-red-600 font-bold">${pos(x.position)}</span><br><span class="text-[11px] text-slate-400">${x.team_name}</span></span></span></td>
   <td class="text-center font-extrabold text-red-600 text-base">${x.goals}</td><td class="text-center font-bold text-brand-navy">${x.assists}</td><td class="text-center text-slate-500">${nz(x.shots)}</td>
   <td class="text-center text-slate-500">${x.goals?Math.round(x.minutes_played/x.goals)+"'":'-'}</td><td class="text-center font-bold text-emerald-600">${nz(x.avg_rating)}</td></tr>`).join('');
  const best=(k,l)=>[...p].sort((a,b)=>(b[k]||0)-(a[k]||0))[0];
  $('#players-podium-grid').innerHTML=p.length?[['TOP SCORER','goals'],['TOP ASSISTS','assists'],['TOP RATED','avg_rating']].map(([l,k])=>{const x=best(k);return `<div class="${CARD} p-5 text-center clickable" onclick="openPlayer(${x.player_id})"><p class="text-[10px] font-bold tracking-wider text-slate-400">${l}</p><p class="text-sm font-bold mt-1">${x.player_name}</p><p class="text-[11px] text-slate-400">${x.team_name}</p><p class="text-3xl font-extrabold text-brand-navy mt-1">${x[k]}</p></div>`}).join(''):'';
})}

async function openPlayer(id,push=true){guard(async()=>{
  const p=await api('players/'+id);if(p.shirt_number==null)p.shirt_number=SHIRTS[id];if(push)history.pushState(null,'','/playerstats/'+id);show('player-detail');
  const age=p.birth?Math.floor((Date.now()-new Date(p.birth))/31557600000):null;
  $('#player-detail-hero').innerHTML=`<div class="flex items-center gap-5">${flag(p.team_name,'w-20 h-14 border-4 border-white rounded-lg')}<div><p class="text-[11px] tracking-wider text-blue-200">${pos(p.position)} · ${p.team_name}</p><h2 class="text-3xl font-extrabold">${shirt(p)}${p.player_name}</h2><p class="text-xs text-blue-200">${nz(p.club_team)}${age?' · '+age+' yrs':''}${p.height_cm?' · '+p.height_cm+' cm':''}</p></div></div><div class="text-sm text-right">Caps: <b>${nz(p.caps)}</b><br>Int'l goals: <b>${nz(p.goals_for_country)}</b></div>`;
  $('#player-detail-kpis').innerHTML=[['GOALS',p.goals],['ASSISTS',p.assists],['MATCHES',p.matches_played],['MINUTES',p.minutes_played],['RATING',p.avg_rating]].map(([l,v])=>`<div class="${CARD} p-4"><p class="text-[10px] font-bold tracking-wider text-slate-400">${l}</p><p class="text-3xl font-extrabold text-brand-navy">${nz(v)}</p></div>`).join('');
  const b=(l,v,max,suf='')=>`<div><div class="flex justify-between text-xs"><span>${l}</span><b>${nz(v)}${suf}</b></div><div class="h-2 bg-slate-100 rounded mt-1"><i class="block h-full rounded bg-brand-navy" data-w="${Math.min(100,100*(v||0)/max)}" style="width:0"></i></div></div>`;
  $('#player-detail-bars').innerHTML=b('Shot accuracy',p.shots?Math.round(100*p.shots_on_target/p.shots):0,100,'%')+b('Starter rate',p.matches_played?Math.round(100*p.matches_started/p.matches_played):0,100,'%')+b('Goals per match',p.matches_played?+(p.goals/p.matches_played).toFixed(2):0,2)+b('Yellow / red cards',(p.yellow_cards||0)+(p.red_cards||0),10)+b('Avg rating',p.avg_rating,10);
  $('#player-detail-footer-id').textContent=`Player ID #${p.player_id} · Dữ liệu từ SQL Server`;
})}

// ---------- Router: moi trang mot duong dan rieng ----------
const PATH={matches:'/matches',tournament:'/standings',teams:'/teamstats',players:'/playerstats'};
const VIEW=Object.fromEntries(Object.entries(PATH).map(([v,u])=>[u.slice(1),v]));
function go(url,replace){history[replace?'replaceState':'pushState'](null,'',url);route()}
function route(){
  const [seg,id]=location.pathname.split('/').filter(Boolean),v=VIEW[seg];
  if(!v)return go('/matches',true);
  if(v==='players'&&id)return openPlayer(+id,false);
  if(v==='teams'&&id)state.teamId=+id;
  show(v);
}
addEventListener('popstate',route);
route();

// ---------- Thanh thong so: chay tu 0 -> gia tri khi vua hien ra ----------
new MutationObserver(()=>{
  const bars=document.querySelectorAll('[data-w]:not([data-done])');
  if(!bars.length)return;
  bars.forEach(el=>el.dataset.done='1');
  requestAnimationFrame(()=>requestAnimationFrame(()=>bars.forEach((el,i)=>{
    el.style.transitionDelay=Math.min(i,10)*40+'ms';   // le tung thanh
    el.style.width=el.dataset.w+'%';
  })));
}).observe(document.body,{childList:true,subtree:true});