const { app } = require('@azure/functions');
const getConnection = require('./dabataseConfig');
const { GET } = require('./Consts');
const PDFDocument = require('pdfkit');
const sql = require('mssql');

app.http('Bot-pdf-function-app', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => { 
        try {
            // database connection  
            const connection = await getConnection();
            const dbRequest = connection.request();
            const result = await dbRequest.query('SELECT TOP 1 * FROM generalSmartHealthAssessment ORDER BY ColumnDateTime DESC');
    
            const doc = new PDFDocument();  
            let buffers = [];  
            doc.on('data', buffers.push.bind(buffers));  
            doc.on('end', () => {  
                const pdfData = Buffer.concat(buffers);  
                context.res = {  
                    status: 200, // HTTP Status Code  
                    headers: {  
                        'Content-Type': 'application/pdf',  
                        'Content-Disposition': 'attachment; filename=PLANHEAL_GENERAL_HEALTH_ASSESSMENT.pdf',  
                    },  
                    body: pdfData,  
                    isRaw: true,  
                };  
            });  
    
            // Génération du contenu du PDF  
            doc.fontSize(12).text('PLANHEAL GENERAL HEALTH ASSESSMENT', { underline: true, paragraphGap: 5 });  
            doc.fontSize(12).text(`NAME: ${result.recordset[0].Name}`, { underline: true, paragraphGap: 5 });
            result.recordset.forEach(record => { 
            doc.text(`${record.testExamResult?.replace(/\*\*(.*?)\*\*/g, '$1')}`);  
            doc.text(`${record.WaistResult?.replace(/\*\*(.*?)\*\*/g, '$1')}`);  
            doc.text(`${record.bmiResult?.replace(/\*\*(.*?)\*\*/g, '$1')}`);
            doc.text(`${record.wthResult?.replace(/\*\*(.*?)\*\*/g, '$1')}`);
            doc.text(`${record.generalHealthResult?.replace(/\*\*(.*?)\*\*/g, '$1')}`);
            });
            doc.end();
            return { body: doc };
        } catch (error) {  
                return { body : error}; 
            }  
        }
        
    });