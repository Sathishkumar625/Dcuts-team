const PDFDocument = require("pdfkit");



// ===============================
// CREATE PDF FUNCTION
// ===============================

const generatePDF = (title, data, res) => {


    const doc = new PDFDocument();


    res.setHeader(
        "Content-Type",
        "application/pdf"
    );


    res.setHeader(
        "Content-Disposition",
        `attachment; filename=${title}.pdf`
    );



    doc.pipe(res);



    // TITLE

    doc
    .fontSize(20)
    .text(
        title,
        {
            align:"center"
        }
    );



    doc.moveDown();



    // DATE

    doc
    .fontSize(12)
    .text(
        "Generated Date : "
        +
        new Date().toLocaleDateString()
    );


    doc.moveDown();





    // DATA LOOP

    data.forEach((item,index)=>{


        doc
        .fontSize(12)
        .text(
            `${index+1}.`
        );


        Object.keys(item).forEach(key=>{


            let value = item[key];


            if(
                typeof value === "object"
            ){

                value =
                JSON.stringify(value);

            }



            doc.text(
                `${key} : ${value}`
            );


        });



        doc.moveDown();



    });





    doc.end();


};





module.exports =
generatePDF;