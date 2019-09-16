// ==UserScript==
// @name         Votes 22
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Seat distribution calculator
// @author       iAmOren@gmail.com
// @match        https://votes22.bechirot.gov.il/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var vDiv=document.createElement('div');
    vDiv.id="vDiv";
    document.getElementsByTagName('body')[0].appendChild(vDiv);
    vDiv.innerHTML="";

    function numberWithCommas(x) {
        var parts=x.toString().split(".");
        parts[0]=parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }
    function printLTR(msg) {
        vDiv.innerHTML+="<p width=100% dir=ltr>"+msg+"</p>";
    }

    printLTR("Made by Oren: iAmOren@gmail.com");
    var partyData=document.getElementsByClassName("TableData")[0].tBodies[0];
    var parties=partyData.rows.length;
    printLTR("There are "+parties+" parties");

    var columns=document.getElementsByClassName("TableCategory")[0].tBodies[0].rows[0].cells.length;
    printLTR("There are "+columns+" columns");

    var pArr=[];
    var kosher=0;
    for(var p=0;p<parties;p++) {
        var party=partyData.rows[p];
        pArr[p]=[party.cells[1].textContent, parseInt(party.cells[3+(columns==5?1:0)].textContent.replace(/,/g, '')), party.cells[0].textContent];
        kosher+=pArr[p][1];
    };
    printLTR("There are "+numberWithCommas(kosher)+" kosher votes");

    var blocker=kosher*3.25/100;
    printLTR("Blocker of 3.25% is "+numberWithCommas(blocker)+" votes");

//    printLTR("<hr>");

    //---------------------------------------------------------------------------------------

    var po="<p width=100% dir=ltr>", pc="</p>";
    var pPassArr=[];
    var ppVotes=0;
    var pObj={};
    for(p=0;p<parties;p++) {
        if(pArr[p][1]>blocker) {
            pPassArr[p]=pArr[p];
            ppVotes+=pPassArr[p][1];
            pObj[pPassArr[p][0]]={votes:pPassArr[p][1], name:pPassArr[p][2]};
        };
    };
//    vDiv.innerHTML+=po+"pObj="+pObj+pc;
//    vDiv.innerHTML+=po+"pObj["+pPassArr[0][0]+"].votes="+pObj[pPassArr[0][0]].votes+pc;
    var pPass=pPassArr.length;
    vDiv.innerHTML+=po+pPass+" parties passed the blocker"+pc;
    var text=po+"<table border=1 dir=ltr>";
    text+="<tr>";
    text+="<td align=center>#</td>";
    text+="<td align=center>Letters</td>";
//-    text+="<td align=right nowrap>Name</td>";
    text+="<td align=right>Votes</td>";
    text+="<td width=100% style='border:none'>&nbsp;</td>";
    text+="</tr>";
    for(p=0;p<pPass;p++) {
        text+="<tr>";
        text+="<td align=center>"+(p+1)+"</td>";
        text+="<td align=center>"+pPassArr[p][0]+"</td>";
//-        text+="<td align=right nowrap>"+pPassArr[p][2]+"</td>";
        text+="<td align=right>"+pPassArr[p][1]+"</td>";
        text+="<td width=100% style='border:none'>&nbsp;</td>";
        text+="</tr>";
    };
    text+="</table>"+pc;
    vDiv.innerHTML+=text;
    vDiv.innerHTML+=po+"Pass votes is "+ppVotes+pc;
    var mandate=ppVotes/120;
    vDiv.innerHTML+=po+"Mandate is "+mandate+" votes"+pc;
    var total=0;
    for(var pLetter in pObj) {
        pObj[pLetter].mandates=pObj[pLetter].votes/mandate;
        pObj[pLetter].whole=parseInt(pObj[pLetter].mandates);
        pObj[pLetter].leftover=pObj[pLetter].votes-mandate*pObj[pLetter].whole;
        total+=pObj[pLetter].whole;
    };
    text=po+"<table border=1 dir=ltr>";
    text+="<tr>";
    text+="<td align=center>#</td>";
    text+="<td align=center>Letters</td>";
//-    text+="<td align=right nowrap>Name</td>";
    text+="<td align=right>votes</td>";
    text+="<td align=right>mandates</td>";
    text+="<td align=right>whole</td>";
    text+="<td align=right>leftover</td>";
    text+="<td width=100% style='border:none'>&nbsp;</td>";
    text+="</tr>";
    total=0;
    for(p=0;p<pPass;p++) {
        pLetter=pPassArr[p][0];
        var ppObj=pObj[pLetter];
        text+="<tr>";
        text+="<td align=center>"+(p+1)+"</td>";
        text+="<td align=center>"+pLetter+"</td>";
//-        text+="<td align=right nowrap>"+ppObj.name+"</td>";
        text+="<td align=right nowrap>"+ppObj.votes+"</td>";
        text+="<td align=right nowrap>"+parseInt(100*ppObj.mandates)/100+"</td>";
        text+="<td align=right nowrap>"+ppObj.whole+"</td>";
        total+=ppObj.whole;
        text+="<td align=right nowrap>"+parseInt(100*ppObj.leftover)/100+"</td>";
        text+="<td width=100% style='border:none'>&nbsp;</td>";
        text+="</tr>";
    };
    text+="<tr>";
    text+="<td></td>";
    text+="<td></td>";
//-    text+="<td></td>";
    text+="<td></td>";
    text+="<td></td>";
    text+="<td align=right>"+total+"</td>";
    text+="<td></td>";
    text+="<td width=100% style='border:none'>&nbsp;</td>";
    text+="</tr>";
    text+="</table>"+pc;
    vDiv.innerHTML+=text;
//    vDiv.innerHTML+=po+"Whole mandates is "+total+pc;
    if(total!=120) {
        vDiv.innerHTML+=po+"Need to distribute "+(120-total)+" mandates"+pc;
        // while(whole!=120)...
        alert("הסכמי עודפים...");
        var partnersArr=[
            ["מחל","טב"],
            ["אמת","מרצ"],
            ["שס","ג"],
            ["פה","ל"],
            ["כ","כף"]
        ];
        var partners={};
        for(p=0;p<partnersArr.length;p++) {
            var p0=partnersArr[p][0], p1=partnersArr[p][1];
            try {
                total=pObj[p0].votes+pObj[p1].votes;
                partners[p0]={party:p1, votes:total};
                partners[p1]={party:p0, votes:total};
            } catch(e) {}
        };
        var partnerships=Object.keys(partners).length/2;
        vDiv.innerHTML+=po+(partnerships!=0?partnerships:"No")+" Partnership"+(partnerships!=1?"s":"")+(partnerships!=0?":":"")+pc;
        for(p=0;p<partnersArr.length;p++) {
            p0=partnersArr[p][0];
            if(partners[p0]!==undefined) vDiv.innerHTML+=po+p0+"+"+partners[p0].party+pc;
        };
        var maxBO=0, maxBO1=0, maxBOL="", maxBO1L="";
        maxBO=0; maxBO1=0; maxBOL=""; maxBO1L="";
        for(pLetter in pObj) {
            if(partners[pLetter]!==undefined) {
                var partner=partners[pLetter].party;
                pObj[pLetter].bo=partners[pLetter].votes/(pObj[pLetter].whole+pObj[partner].whole+1);
            } else {
                pObj[pLetter].bo=pObj[pLetter].votes/(pObj[pLetter].whole+1);
            };
            pObj[pLetter].bo1=pObj[pLetter].votes/(pObj[pLetter].whole+1);
        };
        text=po+"<table border=1 dir=ltr>";
        text+="<tr>";
        text+="<td align=center>#</td>";
        text+="<td align=center>Letters</td>";
        //-    text+="<td align=right nowrap>Name</td>";
        text+="<td align=right>whole</td>";
        text+="<td align=right>BO w/partner</td>";
        text+="<td align=right>BO for party</td>";
        text+="<td width=100% style='border:none'>&nbsp;</td>";
        text+="</tr>";
        total=0;
        for(p=0;p<pPass;p++) {
            pLetter=pPassArr[p][0];
            ppObj=pObj[pLetter];
            text+="<tr>";
            text+="<td align=center>"+(p+1)+"</td>";
            text+="<td align=center>"+pLetter+"</td>";
            //-        text+="<td align=right nowrap>"+ppObj.name+"</td>";
            text+="<td align=right nowrap>"+ppObj.whole+"</td>";
            total+=ppObj.whole;
            text+="<td align=right nowrap>"+Math.round(ppObj.bo)+"</td>";
            text+="<td align=right nowrap>"+Math.round(ppObj.bo1)+"</td>";
            text+="<td width=100% style='border:none'>&nbsp;</td>";
            text+="</tr>";
        };
        text+="<tr>";
        text+="<td></td>";
        text+="<td></td>";
        //-    text+="<td></td>";
        text+="<td align=right>"+total+"</td>";
        text+="<td></td>";
        text+="<td></td>";
        text+="<td></td>";
        text+="<td width=100% style='border:none'>&nbsp;</td>";
        text+="</tr>";
        text+="</table>"+pc;
  //      vDiv.innerHTML+=text;

// --------------------------------------------------------------------
      while(total<120) {
        var BOmax=0, BOparties=[], BO1max=0, BO1party="";
        for(p=0;p<pPass;p++) {
            pLetter=pPassArr[p][0];
            ppObj=pObj[pLetter];
            if(ppObj.bo>BOmax) {
                BOmax=ppObj.bo;
                BOparties=[pLetter];
                BO1max=ppObj.bo1;
                BO1party=pLetter;
            } else if(ppObj.bo==BOmax) {
                BOparties.push(pLetter);
                if(ppObj.bo1>BO1max) {
                    BO1max=ppObj.bo1;
                    BO1party=pLetter;
                }
            }
        };
        vDiv.innerHTML+=po+"BOmax="+BOmax+pc;
        vDiv.innerHTML+=po+"BOparties="+BOparties+pc;
        vDiv.innerHTML+=po+"BO1max="+BO1max+pc;
        vDiv.innerHTML+=po+"BO1party="+BO1party+pc;

        text=po+"<table border=1 dir=ltr>";
        text+="<tr>";
        text+="<td align=center>#</td>";
        text+="<td align=center>Letters</td>";
        //-    text+="<td align=right nowrap>Name</td>";
        text+="<td align=right>whole</td>";
        text+="<td align=right>BO w/partner</td>";
        text+="<td align=right>BO for party</td>";
        text+="<td width=100% style='border:none'>&nbsp;</td>";
        text+="</tr>";
        total=0;
        for(p=0;p<pPass;p++) {
            pLetter=pPassArr[p][0];
            ppObj=pObj[pLetter];
            text+="<tr>";
            text+="<td align=center>"+(p+1)+"</td>";
            text+="<td align=center>"+pLetter+"</td>";
            //-        text+="<td align=right nowrap>"+ppObj.name+"</td>";
            text+="<td align=right nowrap>"+ppObj.whole+"</td>";
            total+=ppObj.whole;
            text+="<td align=right nowrap"+(ppObj.bo==BOmax?" bgcolor=yellow>*":">")+Math.round(ppObj.bo)+"</td>";
            text+="<td align=right nowrap"+(ppObj.bo1==BO1max?" bgcolor=yellow>*":">")+Math.round(ppObj.bo1)+"</td>";
            text+="<td width=100% style='border:none'>&nbsp;</td>";
            text+="</tr>";
        };
        text+="<tr>";
        text+="<td></td>";
        text+="<td></td>";
        //-    text+="<td></td>";
        text+="<td align=right>"+total+"</td>";
        text+="<td></td>";
        text+="<td></td>";
        text+="<td></td>";
        text+="<td width=100% style='border:none'>&nbsp;</td>";
        text+="</tr>";
        text+="</table>"+pc;
        vDiv.innerHTML+=text;

        pObj[BO1party].whole++;

        maxBO=0; maxBO1=0; maxBOL=""; maxBO1L="";
        for(pLetter in pObj) {
            if(partners[pLetter]!==undefined) {
                partner=partners[pLetter].party;
                pObj[pLetter].bo=partners[pLetter].votes/(pObj[pLetter].whole+pObj[partner].whole+1);
            } else {
                pObj[pLetter].bo=pObj[pLetter].votes/(pObj[pLetter].whole+1);
            };
            pObj[pLetter].bo1=pObj[pLetter].votes/(pObj[pLetter].whole+1);
        };
        text=po+"<table border=1 dir=ltr>";
        text+="<tr>";
        text+="<td align=center>#</td>";
        text+="<td align=center>Letters</td>";
        //-    text+="<td align=right nowrap>Name</td>";
        text+="<td align=right>whole</td>";
        text+="<td align=right>BO w/partner</td>";
        text+="<td align=right>BO for party</td>";
        text+="<td width=100% style='border:none'>&nbsp;</td>";
        text+="</tr>";
        total=0;
        for(p=0;p<pPass;p++) {
            pLetter=pPassArr[p][0];
            ppObj=pObj[pLetter];
            text+="<tr>";
            text+="<td align=center>"+(p+1)+"</td>";
            text+="<td align=center>"+pLetter+"</td>";
            //-        text+="<td align=right nowrap>"+ppObj.name+"</td>";
            text+="<td align=right nowrap"+(BO1party==pLetter?" bgcolor=yellow>*":">")+ppObj.whole+"</td>";
            total+=ppObj.whole;
            text+="<td align=right nowrap>"+Math.round(ppObj.bo)+"</td>";
            text+="<td align=right nowrap>"+Math.round(ppObj.bo1)+"</td>";
            text+="<td width=100% style='border:none'>&nbsp;</td>";
            text+="</tr>";
        };
        text+="<tr>";
        text+="<td></td>";
        text+="<td></td>";
        //-    text+="<td></td>";
        text+="<td align=right>"+total+"</td>";
        text+="<td></td>";
        text+="<td></td>";
        text+="<td></td>";
        text+="<td width=100% style='border:none'>&nbsp;</td>";
        text+="</tr>";
        text+="</table>"+pc;
        vDiv.innerHTML+=text;
      }

// --------------------------------------------------------------------
    }

    vDiv.innerHTML+=po+"Final distribution of mandates:"+pc;

    text=po+"<table border=1 dir=ltr>";
    text+="<tr>";
    text+="<td align=center><b>#</b></td>";
    text+="<td align=center><b>אותיות</b></td>";
    text+="<td align=right nowrap><b>השם המלא של המפלגה</b></td>";
    text+="<td align=right><b>מנדטים</b></td>";
    text+="<td width=100% style='border:none'>&nbsp;</td>";
    text+="</tr>";
    total=0;
    for(p=0;p<pPass;p++) {
        pLetter=pPassArr[p][0];
        ppObj=pObj[pLetter];
        text+="<tr>";
        text+="<td align=center>"+(p+1)+"</td>";
        text+="<td align=center>"+pLetter+"</td>";
        text+="<td align=right nowrap>"+ppObj.name+"</td>";
        text+="<td align=right nowrap>"+ppObj.whole+"</td>";
        total+=ppObj.whole;
        text+="<td width=100% style='border:none'>&nbsp;</td>";
        text+="</tr>";
    };
    text+="<tr>";
    text+="<td></td>";
    text+="<td></td>";
    text+="<td></td>";
    text+="<td align=right><b>"+total+"</b></td>";
    text+="<td></td>";
    text+="<td></td>";
    text+="<td></td>";
    text+="<td width=100% style='border:none'>&nbsp;</td>";
    text+="</tr>";
    text+="</table>"+pc;
    vDiv.innerHTML+=text;

    /*
    vDiv.innerHTML+=po+"<br>"+pc;
    vDiv.innerHTML+=po+"dynamic partnerships: user enters?"+pc;
    vDiv.innerHTML+=po+"<br>"+pc;
    */
    vDiv.innerHTML+=po+"Done."+pc;

})();