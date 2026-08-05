const PDFDocument = require("pdfkit");

const Invoice = require("../models/Invoice");



const downloadInvoicePDF = async(req,res)=>{


    try{


        const invoice = await Invoice.findById(req.params.id)
        .populate("clientId");


        if(!invoice){

            return res.status(404).json({

                success:false,
                message:"Invoice Not Found"

            });

        }



        const doc = new PDFDocument();



        res.setHeader(
            "Content-Type",
            "application/pdf"
        );


        res.setHeader(
            "Content-Disposition",
            "attachment; filename=invoice.pdf"
        );



        doc.pipe(res);



        doc.fontSize(20)
        .text("THE D CUTS INVOICE");


        doc.moveDown();



        doc.fontSize(12)
        .text(
            `Invoice Number : ${invoice.invoiceNumber}`
        );


        doc.text(
            `Client : ${invoice.clientId.name}`
        );



        doc.moveDown();


        doc.text("Services:");



        invoice.services.forEach(service=>{


            doc.text(
                `${service.serviceName} - ${service.price}`
            );


        });



        doc.moveDown();


        doc.text(
            `Total Amount : ${invoice.totalAmount}`
        );



        doc.end();



    }
    catch(error){


        res.status(500).json({

            success:false,
            message:error.message

        });


    }


};



module.exports={
    downloadInvoicePDF
};