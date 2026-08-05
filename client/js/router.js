async function loadPage(page) {


    const content = document.getElementById("content");


    content.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
        </div>
    `;


    try {


        const response = await fetch(`pages/${page}.html`);



        if (!response.ok) {

            throw new Error("Page not found");

        }



        const html = await response.text();


        content.innerHTML = html;



        content.classList.add("fade-in");


        setTimeout(() => {

            content.classList.remove("fade-in");

        },400);




        // Remove old script

        const oldScript =
        document.getElementById("pageScript");


        if(oldScript){

            oldScript.remove();

        }




        // Create new script

        const script =
        document.createElement("script");


        script.id="pageScript";



        switch(page){


            case "dashboard":

                script.src="js/dashboard.js";

                break;



            case "clients":

                script.src="js/clients.js";

                break;



            case "timesheet":

                script.src="js/timesheet.js";

                break;



            case "projects":

                script.src="js/projects.js";

                break;



            case "calendar":

                script.src="js/calendar.js";

                break;



            case "reports":

                script.src="js/reports.js";

                break;



            case "employees":

                script.src="js/employees.js";

                break;



            case "settings":

                script.src="js/settings.js";

                break;



            default:

                script.src="js/dashboard.js";

        }



        document.body.appendChild(script);



    }


    catch(err){


        content.innerHTML = `

        <h2>Error Loading Page</h2>

        <p>${err.message}</p>

        `;


        console.error(err);


    }


}



// First load

loadPage("dashboard");