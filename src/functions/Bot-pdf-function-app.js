const { app } = require('@azure/functions');
const getConnection = require('./dabataseConfig');
const PDFDocument = require('pdfkit');

app.http('Bot-pdf-function-app', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        // database connection
        const connection = await getConnection();    
        const result = await connection.request().query('SELECT * FROM generalSmartHealthAssessment');    
    
        const doc = new PDFDocument();    
        let buffers = [];  
        doc.on('data', buffers.push.bind(buffers));  
        doc.on('end', () => {  
            const pdfData = Buffer.concat(buffers);  
            context.res = {  
                headers: {  
                    'Content-Type': 'application/pdf',  
                    'Content-Disposition': 'attachment; filename=rapport.pdf'  
                },  
                body: pdfData,  
                isRaw: true,  
            };  
        });  
    

        // Genarate pdf here  
        doc.fontSize(12).text('Rapport PDF', { underline: true });    
        result.recordset.forEach(record => {    
            doc.text(`${record.Name} - ${record.Race}`, { paragraphGap: 5 });    
        });  
    
        doc.end();
        return { body: doc };
    }
});