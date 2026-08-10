/* =====================================
   THE D CUTS WORK CALENDAR
   ADD / EDIT / DELETE SYSTEM
===================================== */


let events =
JSON.parse(localStorage.getItem("calendarEvents")) || [];


let editEventId = null;


let currentDate = new Date();



document.addEventListener("DOMContentLoaded", function(){

    const today = new Date();

    const dateInput =
    document.getElementById("eventDate");


    if(dateInput){

        dateInput.value =
        formatDate(today);

    }


    loadCalendar();

});




function formatDate(date){

    const year =
    date.getFullYear();


    const month =
    String(date.getMonth()+1).padStart(2,"0");


    const day =
    String(date.getDate()).padStart(2,"0");


    return `${year}-${month}-${day}`;

}





function loadCalendar(){


const grid =
document.getElementById("calendarGrid");


const monthYear =
document.getElementById("monthYear");


if(!grid || !monthYear)
return;



grid.innerHTML="";



const year =
currentDate.getFullYear();


const month =
currentDate.getMonth();



monthYear.innerHTML =
currentDate.toLocaleString(
"en-US",
{
month:"long",
year:"numeric"
}
);



const firstDay =
new Date(year,month,1).getDay();



const totalDays =
new Date(year,month+1,0).getDate();





for(let i=0;i<firstDay;i++){

    const empty =
    document.createElement("div");

    empty.className =
    "calendar-empty";

    grid.appendChild(empty);

}






for(let day=1;day<=totalDays;day++){



const calendarDate =
`${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;



const dayBox =
document.createElement("div");


dayBox.className="day";



const today =
new Date();


if(calendarDate === formatDate(today)){

dayBox.classList.add("today");

}




const dayNumber =
document.createElement("strong");


dayNumber.innerText =
day;


dayBox.appendChild(dayNumber);






const dayEvents =
events.filter(
event =>
event.date === calendarDate
);





dayEvents.forEach(event=>{


const eventBox =
document.createElement("div");


eventBox.className="event";



const text =
document.createElement("span");


text.innerText =
event.title;



eventBox.appendChild(text);





const actions =
document.createElement("div");


actions.className =
"event-actions";





/* EDIT BUTTON */


const editButton =
document.createElement("button");


editButton.type="button";


editButton.innerHTML =
'<i class="fa-solid fa-pen"></i>';



editButton.onclick=function(e){

e.preventDefault();

e.stopPropagation();


editEvent(event.id);


};







/* DELETE BUTTON */



const deleteButton =
document.createElement("button");


deleteButton.type="button";


deleteButton.innerHTML =
'<i class="fa-solid fa-trash"></i>';



deleteButton.onclick=function(e){

e.preventDefault();

e.stopPropagation();


deleteEvent(event.id);


};






actions.appendChild(editButton);

actions.appendChild(deleteButton);


eventBox.appendChild(actions);


dayBox.appendChild(eventBox);



});







dayBox.onclick=function(){

selectDate(calendarDate);

};



grid.appendChild(dayBox);



}



}






function previousMonth(){

currentDate.setMonth(
currentDate.getMonth()-1
);


loadCalendar();

}





function nextMonth(){

currentDate.setMonth(
currentDate.getMonth()+1
);


loadCalendar();

}






function openEventBox(){


editEventId=null;



const modal =
document.getElementById("eventModal");


const title =
document.getElementById("modalTitle");


const saveButton =
document.getElementById("saveEventBtn");


const titleInput =
document.getElementById("eventTitle");


if(!modal)
return;



title.innerText =
"Add Daily Work";



saveButton.innerHTML =
'<i class="fa-solid fa-floppy-disk"></i> Save Work';



titleInput.value="";



modal.style.display="flex";


}








function closeEventBox(){


const modal =
document.getElementById("eventModal");


if(modal){

modal.style.display="none";

}


editEventId=null;


}








function saveEvent(){



const date =
document.getElementById("eventDate").value.trim();



const title =
document.getElementById("eventTitle").value.trim();




if(!date){

alert("Select Date");

return;

}




if(!title){

alert("Enter Work Details");

return;

}






/* UPDATE */



if(editEventId){



const index =
events.findIndex(
item =>
item.id === editEventId
);



if(index !== -1){


events[index].date =
date;


events[index].title =
title;


}



alert(
"Work Updated Successfully ✅"
);



}






/* ADD */



else{



events.push({

id:Date.now(),

date:date,

title:title,

createdAt:
new Date().toISOString()


});



alert(
"Work Added Successfully ✅"
);



}






localStorage.setItem(
"calendarEvents",
JSON.stringify(events)
);



closeEventBox();


loadCalendar();



}








function editEvent(id){



const event =
events.find(
item =>
item.id === id
);



if(!event)
return;




editEventId=id;



document.getElementById("eventDate").value =
event.date;



document.getElementById("eventTitle").value =
event.title;




document.getElementById("modalTitle").innerText =
"Edit Daily Work";




document.getElementById("saveEventBtn").innerHTML =
'<i class="fa-solid fa-pen"></i> Update Work';





document.getElementById("eventModal").style.display =
"flex";



}









function deleteEvent(id){



const event =
events.find(
item =>
item.id === id
);



if(!event)
return;




const check =
confirm(
`Delete this work?\n\n${event.title}`
);



if(!check)
return;





events =
events.filter(
item =>
item.id !== id
);




localStorage.setItem(
"calendarEvents",
JSON.stringify(events)
);




alert(
"Work Deleted Successfully 🗑️"
);



loadCalendar();



}








function selectDate(date){



const input =
document.getElementById("eventDate");



if(input){

input.value=date;

}



openEventBox();



}







window.addEventListener(
"click",
function(e){


const modal =
document.getElementById("eventModal");



if(e.target===modal){

closeEventBox();

}


});







/* =====================================
   MAKE FUNCTIONS GLOBAL
===================================== */


window.previousMonth =
previousMonth;


window.nextMonth =
nextMonth;


window.openEventBox =
openEventBox;


window.closeEventBox =
closeEventBox;


window.saveEvent =
saveEvent;


window.editEvent =
editEvent;


window.deleteEvent =
deleteEvent;


window.selectDate =
selectDate;